import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import authToken from "../components/authToken";
import { PhoneXMarkIcon, XMarkIcon } from "@heroicons/react/16/solid";

export default function Call({ onClose, isOpen, targetUserIds, status }) {
    const localVideoRef = useRef(null);
    const remoteVideoRefs = useRef({});
    const peerConnections = useRef({});
    const iceCandidatesBuffer = useRef({});
    const pendingStreams = useRef({}); // Buffer để lưu stream nếu container chưa sẵn sàng
    const [userId, setUserId] = useState(null);
    const [socket, setSocket] = useState(null);
    const [stream, setStream] = useState(null);
    const [callStatus, setCallStatus] = useState(status);
    const [isStreamReady, setIsStreamReady] = useState(false); // Theo dõi trạng thái stream
    const [hasStartedCall, setHasStartedCall] = useState(false); // Theo dõi xem startCall đã được gọi chưa

    const URL = `${process.env.REACT_APP_API_URL}`;

    const iceServers = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:openrelay.metered.ca:80" },
            {
                urls: "turn:openrelay.metered.ca:80",
                username: "openrelayproject",
                credential: "openrelayproject",
            },
            {
                urls: "turn:openrelay.metered.ca:443",
                username: "openrelayproject",
                credential: "openrelayproject",
            },
        ],
    };

    // Lấy stream ngay khi component mở
    useEffect(() => {
        if (isOpen && !stream) {
            const getMediaDevices = async () => {
                try {
                    const userStream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: true,
                    });
                    console.log("✅ [Media] Đã lấy stream thành công");
                    setStream(userStream);
                    setIsStreamReady(true); // Đánh dấu stream đã sẵn sàng
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userStream;
                    }
                } catch (err) {
                    console.error("❌ [Media] Lỗi lấy thiết bị media:", err);
                    alert("Không thể truy cập camera hoặc micro!");
                    setIsStreamReady(false);
                }
            };
            getMediaDevices();
        } else if (!isOpen) {
            cleanupMediaStream();
        }
    }, [isOpen]);

    // Kết nối socket và bắt đầu cuộc gọi khi stream sẵn sàng
    useEffect(() => {
        if (isStreamReady && targetUserIds && !socket) {
            connectSocket();
        }
        if (isStreamReady && targetUserIds && socket && !hasStartedCall) {
            startCall();
            setHasStartedCall(true); // Đánh dấu startCall đã được gọi
        }
    }, [isStreamReady, targetUserIds, socket, hasStartedCall]);

    const cleanupMediaStream = () => {
        if (stream) {
            console.log("🧹 [Media] Dọn dẹp stream");
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
            setIsStreamReady(false);
        }
    };

    // Xử lý các stream đang chờ khi container sẵn sàng
    useEffect(() => {
        const remoteVideosContainer = document.getElementById("remote-videos");
        if (remoteVideosContainer && Object.keys(pendingStreams.current).length > 0) {
            console.log("📊 [Render] Xử lý các stream đang chờ...");
            Object.entries(pendingStreams.current).forEach(([targetId, stream]) => {
                if (!remoteVideoRefs.current[targetId]) {
                    const container = document.createElement("div");
                    const video = document.createElement("video");
                    const label = document.createElement("p");
                    label.textContent = `User: ${targetId}`;
                    video.autoplay = true;
                    video.playsInline = true;
                    video.style.width = "200px";
                    video.style.border = "1px solid #ccc";
                    container.appendChild(video);
                    container.appendChild(label);
                    remoteVideosContainer.appendChild(container);
                    remoteVideoRefs.current[targetId] = video;
                    video.srcObject = stream;
                    video.play().catch((err) => {
                        console.error(`❌ [Render] Lỗi phát video cho user ${targetId}:`, err);
                    });
                }
            });
            pendingStreams.current = {};
        }
    }, [callStatus]);

    useEffect(() => {
        if (!socket) return;

        socket.on("connect", () => {
            console.log("✅ [Socket] Kết nối WebSocket thành công");
            setCallStatus("calling");
        });

        socket.on("disconnect", () => {
            console.log("❌ [Socket] WebSocket ngắt kết nối");
            setCallStatus("disconnected");
            alert("Mất kết nối với server, vui lòng thử lại.");
            endCall();
        });

        socket.on("userId", ({ userId }) => {
            console.log("🆔 [Socket] Nhận userId:", userId);
            setUserId(userId);
        });

        socket.on("incomingCall", ({ from, group }) => {
            console.log("📞 [Socket] Nhận incomingCall từ:", from, "group:", group);
            const accept = window.confirm(`📞 Cuộc gọi từ ${from}, chấp nhận?`);
            if (accept) {
                setCallStatus("in-call");
                acceptCall(from, group);
            } else {
                console.log("❌ [Socket] Gửi rejectCall tới:", from);
                socket.emit("rejectCall", { callerId: from });
            }
        });

        socket.on("callRejected", ({ from }) => {
            console.log("❌ [Socket] Nhận callRejected từ:", from);
            alert(`❌ Cuộc gọi từ ${from} đã bị từ chối`);
            cleanupPeer(from);
            setCallStatus("idle");
        });

        socket.on("callEnded", ({ from }) => {
            console.log("🚫 [Socket] Nhận callEnded từ:", from);
            alert(`🚫 Cuộc gọi kết thúc bởi ${from}`);
            cleanupPeer(from);
            setCallStatus("idle");
        });

        socket.on("offer", async ({ from, sdp }) => {
            if (!isStreamReady) {
                console.log("⏳ [Socket] Chưa có stream, chờ stream sẵn sàng...");
                return;
            }
            console.log("📡 [Socket] Nhận offer từ:", from);
            try {
                if (peerConnections.current[from]) {
                    const pc = peerConnections.current[from];
                    if (pc.signalingState === "stable") {
                        console.log("⚠️ [Peer] Đã ở trạng thái stable, bỏ qua offer từ:", from);
                        return;
                    }
                } else {
                    console.log("🔗 [Peer] Tạo PeerConnection mới vì chưa tồn tại cho:", from);
                    peerConnections.current[from] = createPeerConnection(from);
                }
                const pc = peerConnections.current[from];
                console.log("📡 [Peer] Đang đặt remote description...");
                await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                console.log("✅ [Peer] Đã đặt remote description cho:", from);

                console.log("📡 [Peer] Đang tạo answer...");
                const answer = await pc.createAnswer();
                console.log("📡 [Peer] Đang đặt local description...");
                await pc.setLocalDescription(answer);
                console.log("📡 [Socket] Gửi answer tới:", from);
                socket.emit("answer", { targetUserId: from, sdp: answer });
                console.log("✅ [Socket] Đã gửi answer thành công tới:", from);

                if (iceCandidatesBuffer.current[from]) {
                    for (const candidate of iceCandidatesBuffer.current[from]) {
                        console.log("❄️ [Socket] Xử lý ICE candidate từ buffer cho:", from);
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                    delete iceCandidatesBuffer.current[from];
                }
            } catch (error) {
                console.error("❌ [Socket] Lỗi xử lý offer:", error);
                cleanupPeer(from);
            }
        });

        socket.on("answer", async ({ from, sdp }) => {
            console.log("📡 [Socket] Nhận answer từ:", from);
            try {
                if (!peerConnections.current[from]) {
                    console.warn("⚠️ [Peer] PeerConnection không tồn tại cho:", from);
                    return;
                }
                const pc = peerConnections.current[from];
                if (pc.signalingState === "stable") {
                    console.warn("⚠️ [Peer] Already in stable state, ignoring answer from:", from);
                    return;
                }
                if (pc.signalingState !== "have-local-offer") {
                    console.warn(`⚠️ [Peer] Invalid state for answer: ${pc.signalingState}`);
                    return;
                }
                await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                console.log("✅ [Peer] Remote answer SDP set successfully for:", from);

                if (iceCandidatesBuffer.current[from]) {
                    for (const candidate of iceCandidatesBuffer.current[from]) {
                        console.log("❄️ [Socket] Xử lý ICE candidate từ buffer cho:", from);
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                    delete iceCandidatesBuffer.current[from];
                }
            } catch (error) {
                console.error("❌ [Socket] Lỗi xử lý answer:", error);
                cleanupPeer(from);
            }
        });

        socket.on("ice-candidate", async ({ from, candidate }) => {
            console.log("❄️ [Socket] Nhận ICE candidate từ:", from);
            try {
                if (!peerConnections.current[from]) {
                    console.log("⏳ [Socket] PeerConnection chưa tồn tại, lưu ICE candidate vào buffer cho:", from);
                    if (!iceCandidatesBuffer.current[from]) iceCandidatesBuffer.current[from] = [];
                    iceCandidatesBuffer.current[from].push(candidate);
                    return;
                }
                const pc = peerConnections.current[from];
                if (!pc.remoteDescription) {
                    console.log("⏳ [Socket] Chưa có remoteDescription, lưu ICE candidate vào buffer cho:", from);
                    if (!iceCandidatesBuffer.current[from]) iceCandidatesBuffer.current[from] = [];
                    iceCandidatesBuffer.current[from].push(candidate);
                    return;
                }
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
                console.log("✅ [Peer] ICE candidate added successfully for:", from);
            } catch (error) {
                console.error("❌ [Socket] Lỗi xử lý ICE candidate:", error);
            }
        });

        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("userId");
            socket.off("incomingCall");
            socket.off("callRejected");
            socket.off("callEnded");
            socket.off("offer");
            socket.off("answer");
            socket.off("ice-candidate");
        };
    }, [socket, isStreamReady]);

    const connectSocket = () => {
        const token = authToken.getToken();
        if (!token) {
            console.error("❌ [Socket] Không tìm thấy token");
            return;
        }
        if (socket) return;

        console.log("🔌 [Socket] Bắt đầu kết nối với token:", token);
        try {
            const newSocket = io(URL, {
                extraHeaders: { Authorization: `Bearer ${token}` },
            });

            newSocket.on("connect_error", (err) => {
                console.error("❌ [Socket] Lỗi kết nối:", err.message);
                alert("Không thể kết nối tới server, vui lòng kiểm tra lại.");
            });

            setSocket(newSocket);
        } catch (error) {
            console.error("❌ [Socket] Lỗi khi khởi tạo socket:", error);
            alert("Đã xảy ra lỗi khi kết nối socket.");
        }
    };

    const createPeerConnection = (targetId) => {
        console.log("🔗 [Peer] Tạo PeerConnection với:", targetId);
        const pc = new RTCPeerConnection(iceServers);
        if (stream) {
            stream.getTracks().forEach((track) => {
                console.log("➕ [Peer] Thêm track vào PeerConnection:", track.kind);
                pc.addTrack(track, stream);
            });
        }
        pc.onicecandidate = (e) => {
            if (e.candidate && socket) {
                console.log("❄️ [Peer] Gửi ICE candidate tới:", targetId);
                socket.emit("ice-candidate", { targetUserId: targetId, candidate: e.candidate });
            }
        };
        pc.ontrack = (e) => {
            console.log("📹 [Peer] Nhận stream từ:", targetId, "Tracks:", e.streams[0].getTracks());
            e.streams[0].getTracks().forEach((track) => {
                console.log(`🔊 [Track] Track type: ${track.kind}, enabled: ${track.enabled}, readyState: ${track.readyState}`);
            });
            const remoteVideosContainer = document.getElementById("remote-videos");
            if (!remoteVideosContainer) {
                console.error("❌ [Render] Không tìm thấy container remote-videos trong DOM, lưu stream vào buffer...");
                pendingStreams.current[targetId] = e.streams[0];
                return;
            }
            if (!remoteVideoRefs.current[targetId]) {
                console.log(`🎥 [Render] Tạo video element cho user ${targetId}`);
                const container = document.createElement("div");
                const video = document.createElement("video");
                const label = document.createElement("p");
                label.textContent = `User: ${targetId}`;
                video.autoplay = true;
                video.playsInline = true;
                video.style.width = "200px";
                video.style.border = "1px solid #ccc";
                container.appendChild(video);
                container.appendChild(label);
                remoteVideosContainer.appendChild(container);
                remoteVideoRefs.current[targetId] = video;
            }
            remoteVideoRefs.current[targetId].srcObject = e.streams[0];
            remoteVideoRefs.current[targetId].play().catch((err) => {
                console.error(`❌ [Render] Lỗi phát video cho user ${targetId}:`, err);
            });
        };
        pc.oniceconnectionstatechange = () => {
            console.log("🌐 [Peer] Trạng thái ICE của", targetId, ":", pc.iceConnectionState);
            if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
                console.log("❌ [Peer] Kết nối ICE thất bại với:", targetId);
                cleanupPeer(targetId);
            } else if (pc.iceConnectionState === "connected") {
                console.log("✅ [Peer] Kết nối ICE thành công với:", targetId);
            }
        };
        return pc;
    };

    const startCall = async () => {
        if (!targetUserIds || !socket || !stream) {
            console.log("⚠️ [Call] Thiếu điều kiện để bắt đầu cuộc gọi:", { targetUserIds, socket, stream });
            return;
        }
        const ids = targetUserIds.split(",").map((id) => id.trim());
        if (ids.length > 5) return alert("Tối đa 5 người trong nhóm");

        console.log("📞 [Socket] Gửi startCall tới:", ids);
        socket.emit("startCall", { targetUserIds: ids });

        for (const targetId of ids) {
            if (!peerConnections.current[targetId]) {
                peerConnections.current[targetId] = createPeerConnection(targetId);
                const offer = await peerConnections.current[targetId].createOffer();
                await peerConnections.current[targetId].setLocalDescription(offer);
                console.log("📡 [Socket] Gửi offer tới:", targetId);
                socket.emit("offer", { targetUserId: targetId, sdp: offer });
            }
        }
    };

    const acceptCall = async (callerId, group) => {
        console.log("✅ [Call] Chấp nhận cuộc gọi từ:", callerId, "group:", group);
        if (!isStreamReady) {
            console.log("⏳ [Call] Chưa có stream, chờ stream sẵn sàng...");
            return;
        }
        try {
            group.forEach((id) => {
                if (id !== userId && !peerConnections.current[id]) {
                    peerConnections.current[id] = createPeerConnection(id);
                    stream.getTracks().forEach((track) => {
                        console.log("➕ [Peer] Thêm track vào PeerConnection trong acceptCall:", track.kind);
                        peerConnections.current[id].addTrack(track, stream);
                    });
                }
            });
        } catch (error) {
            console.error("❌ [Call] Lỗi khi chấp nhận cuộc gọi:", error);
            alert("Không thể chấp nhận cuộc gọi do lỗi media!");
        }
    };

    const endCall = () => {
        console.log("🚫 [Socket] Gửi endCall");
        Object.keys(peerConnections.current).forEach((targetId) => cleanupPeer(targetId));
        if (socket) socket.emit("endCall");
        cleanupMediaStream();
        setCallStatus("idle");
        setHasStartedCall(false); // Reset để có thể gọi lại
        if (onClose) onClose();
    };

    const cleanupPeer = (targetId) => {
        console.log("🧹 [Peer] Dọn dẹp PeerConnection với:", targetId);
        if (peerConnections.current[targetId]) {
            peerConnections.current[targetId].close();
            delete peerConnections.current[targetId];
        }
        if (remoteVideoRefs.current[targetId]) {
            remoteVideoRefs.current[targetId].srcObject = null;
            remoteVideoRefs.current[targetId].parentElement.remove();
            delete remoteVideoRefs.current[targetId];
        }
        if (iceCandidatesBuffer.current[targetId]) {
            delete iceCandidatesBuffer.current[targetId];
        }
        if (pendingStreams.current[targetId]) {
            delete pendingStreams.current[targetId];
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="p-6 rounded-lg shadow-lg">
                {callStatus === "calling" && (
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded-md">
                        <p>Đang gọi...</p>
                    </div>
                )}
                <div
                    id="remote-videos"
                    style={{
                        display: callStatus === "in-call" ? "grid" : "none",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "10px",
                        width: "100%",
                        height: "100%",
                    }}
                />
                {callStatus === "idle" && (
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-3 rounded-md">
                        <p>Cuộc gọi kết thúc</p>
                    </div>
                )}

                <div>
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: "300px" }}
                        className="absolute bottom-3 right-3 rounded-md border border-gray-300"
                    />
                </div>
                <div>
                    {callStatus === "calling" && (
                        <button
                            className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-2"
                            onClick={endCall}
                            disabled={callStatus === "idle"}
                        >
                            <PhoneXMarkIcon className="h-10 w-10 text-red-600" />
                        </button>
                    )}
                    {callStatus === "in-call" && (
                        <button
                            className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-2"
                            onClick={endCall}
                            disabled={callStatus === "idle"}
                        >
                            <PhoneXMarkIcon className="h-10 w-10 text-red-600" />
                        </button>
                    )}
                    {callStatus === "idle" && (
                        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex gap-14">
                            <button onClick={endCall}>
                                <XMarkIcon className="h-14 w-14 bg-white cursor-pointer rounded-full text-red-600 p-1" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}