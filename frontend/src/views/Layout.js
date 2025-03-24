import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./navbar/navBar";
import LeftListMenu from "./menu/LeftMenuList";
import authToken from "../components/authToken";
import { useEffect, useCallback, useState, useRef } from "react";
import { UserProvider } from "../service/UserContext";
import socket, { socketcall } from "../service/webSocket/socket";
import { toast } from "react-toastify";
import NotificationCss from "../module/cssNotification/NotificationCss";
import imgUser from "../img/user.png"
import { profileUserCurrent } from '../service/ProfilePersonal';
import SideBar from "./sidebar/SideBar";
import { ToastContainer } from 'react-toastify';
// import Call from "../components/Call";
import { PhoneXMarkIcon, XMarkIcon } from "@heroicons/react/16/solid";
import Call from "../components/Call";


export default function Layout() {
    const navigate = useNavigate();
    const [userCurrent, setUserCurrent] = useState({});
    const [disconnect, setDisconnect] = useState(true);
    useEffect(() => {
        if (disconnect === true) {
            socket.on("connect", () => {
                console.log("Connected to WebSocket server with ID:", socket.id);
                setDisconnect(false)
            });
            socketcall.on("connect", () => {
                console.log("Connected to WebSocket serverCALL with ID:", socketcall.id);
                setDisconnect(false)
            });
        } else {
            socket.on("disconnect", () => {
                console.log("Disconnected from server");
                setDisconnect(true)
            });
        }
    }, [disconnect])

    const getDataUser = async () => {
        try {
            const response = await profileUserCurrent(); // Fetch user data
            if (response && response.data) {
                setUserCurrent(response.data); // Set user data to state
            } else {
                console.warn("No data found in response.");
            }
        } catch (error) {
            console.error("Error fetching user data:", error); // Handle any errors
        }
    };

    useEffect(() => {
        // Check if user is authenticated
        if (!authToken.getToken()) {
            navigate("/login");
            return;
        }
        getDataUser();
    }, [navigate]);

    useEffect(() => {
        if (userCurrent._id) {
            // console.log(userCurrent._id); // Log after state has been updated
        }
    }, [userCurrent]); // This will run whenever `userCurrent` changes

    useEffect(() => {
        socket.on("newmessage", (newMessage) => {
            if ((String(newMessage.sender._id) !== String(userCurrent._id)) && newMessage.sender._id && userCurrent._id) {
                toast.success(
                    <a href={`/messenger/inbox/?iduser=${newMessage.sender._id}`}>
                        <div className="w-full flex flex-row">
                            <div className="w-full flex items-center space-x-3">
                                <a>
                                    <img
                                        src={newMessage?.sender?.avatar ? newMessage.sender.avatar : imgUser}
                                        alt="user"
                                        className="w-12 h-12 rounded-full mr-2 border-white border-2"
                                    />
                                </a>
                                <div className="text-start">
                                    <h3
                                        className="font-semibold truncate w-[110px] overflow-hidden whitespace-nowrap"
                                        title={newMessage ? `${newMessage?.sender?.lastName || ''} ${newMessage?.sender?.firstName || ''}`.trim() : "No Name"}
                                    >
                                        {newMessage ? `${newMessage?.sender?.lastName || ''} ${newMessage?.sender?.firstName || ''}`.trim() : "No Name"}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div
                            className="line-clamp-2 overflow-hidden text-ellipsis"
                            title={newMessage?.content}
                        >
                            {newMessage ? newMessage.content : ''}
                        </div>
                    </a>,
                    NotificationCss.Mess
                );
            }
        });

        socket.on("newmessagetogroup", (newMessage) => {
            if ((String(newMessage.sender._id) !== String(userCurrent._id)) && newMessage.sender._id && userCurrent._id) {

                toast.success(
                    <a href={`/messenger/group/?idgroup=${String(newMessage.forGroup)}`}>
                        <p className="text-xs text-gray-400 mb-2 font-semibold text-nowrap overflow-hidden text-ellipsis max-w-20">
                            Tin Nhóm
                        </p>
                        <div className="w-full flex flex-row">
                            <div className="w-full flex items-center space-x-3">
                                <a>
                                    <img
                                        src={newMessage?.sender?.avatar ? newMessage.sender.avatar : imgUser}
                                        alt="user"
                                        className="w-12 h-12 rounded-full mr-2 border-white border-2"
                                    />
                                </a>
                                <div className="text-start">
                                    <h3
                                        className="font-semibold truncate w-[110px] overflow-hidden whitespace-nowrap"
                                        title={newMessage ? `${newMessage?.sender?.lastName || ''} ${newMessage?.sender?.firstName || ''}`.trim() : "No Name"}
                                    >
                                        {newMessage ? `${newMessage?.sender?.lastName || ''} ${newMessage?.sender?.firstName || ''}`.trim() : "No Name"}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div
                            className="line-clamp-2 text-xs text-gray-400 overflow-hidden text-ellipsis"
                            title={newMessage?.content}
                        >
                            Nhắn:{newMessage ? newMessage.content : ''}
                        </div>
                    </a>,
                    NotificationCss.Mess
                );
            }
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log("Disconnected from server");
        });

        return () => {
            socket.off("newmessage");
            socket.off("disconnect");
        };
    }, [userCurrent]);
    //call
    const [isCallModalOpen, setIsCallModalOpen] = useState(false); // State quản lý modal Call
    const localVideoRef = useRef(null);
    const remoteVideoRefs = useRef({});
    const peerConnections = useRef({});
    const iceCandidatesBuffer = useRef({}); // Buffer để lưu ICE candidates
    const [stream, setStream] = useState(null);
    const [callStatus, setCallStatus] = useState("calling");
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
    //clean
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
    };
    //
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
                console.log("❄️ [Peer] Gửi ICE candidate tới:", targetId, "Candidate:", e.candidate);
                socket.emit("ice-candidate", { targetUserId: targetId, candidate: e.candidate });
            }
        };
        pc.ontrack = (e) => {
            console.log("📹 [Peer] Nhận stream từ:", targetId);
            const remoteVideosContainer = document.getElementById("remote-videos");
            if (!remoteVideosContainer) {
                console.error("❌ [Peer] Element with ID 'remote-videos' not found in the DOM.");
                return;
            }

            if (!remoteVideoRefs.current[targetId]) {
                const container = document.createElement("div");
                const video = document.createElement("video");
                const label = document.createElement("p");
                label.textContent = `User: ${targetId}`;
                video.autoplay = true;
                video.playsInline = true;
                video.style.width = "200px";
                container.appendChild(video);
                container.appendChild(label);
                remoteVideosContainer.appendChild(container);
                remoteVideoRefs.current[targetId] = video;
            }
            remoteVideoRefs.current[targetId].srcObject = e.streams[0];
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
    //
    const acceptCall = async (callerId, group) => {
        console.log("✅ [Call] Chấp nhận cuộc gọi từ:", callerId, "group:", group);
        group.forEach((id) => {
            if (id !== userCurrent && !peerConnections.current[id]) {
                peerConnections.current[id] = createPeerConnection(id);
            }
        });
    };

    const endCall = () => {
        console.log("🚫 [Socket] Gửi endCall");
        Object.keys(peerConnections.current).forEach((targetId) => cleanupPeer(targetId));
        if (socketcall) socketcall.emit("endCall");
        setCallStatus("idle");
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [incomingCallInfo, setIncomingCallInfo] = useState(null);

    useEffect(() => {
        if (!socketcall) return;

        socketcall.on("connect", () => {
            console.log("✅ [Socket] Kết nối WebSocket thành công");
            setCallStatus("connected");
        });

        socketcall.on("disconnect", () => {
            console.log("❌ [Socket] WebSocket ngắt kết nối");
            setCallStatus("disconnected");
            // alert("Mất kết nối với server, vui lòng thử lại.");
            endCall();
        });

        socketcall.on("incomingCall", ({ from, group }) => {
            console.log("📞 [Socket] Nhận incomingCall từ:", from, "group:", group);
            const accept = window.confirm(`📞 Cuộc gọi từ ${from}, chấp nhận?`);
            if (accept) {
                setCallStatus("in-call");
                setIsCallModalOpen(true)
                acceptCall(from, group);
            } else {
                console.log("❌ [Socket] Gửi rejectCall tới:", from);
                socketcall.emit("rejectCall", { callerId: from });
            }
        });

        socketcall.on("callRejected", ({ from }) => {
            console.log("❌ [Socket] Nhận callRejected từ:", from);
            alert(`❌ Cuộc gọi từ ${from} đã bị từ chối`);
            cleanupPeer(from);
            setCallStatus("idle");
        });

        socketcall.on("callEnded", ({ from }) => {
            console.log("🚫 [Socket] Nhận callEnded từ:", from);
            alert(`🚫 Cuộc gọi kết thúc bởi ${from}`);
            cleanupPeer(from);
            setCallStatus("idle");
        });

        socketcall.on("callUnavailable", ({ message }) => {
            console.log("❌ [Socket] Nhận callUnavailable:", message);
            alert(`❌ ${message}`);
            setCallStatus("idle");
        });

        socketcall.on("offer", async ({ from, sdp }) => {
            console.log("📡 [Socket] Nhận offer từ:", from, "SDP:", sdp);
            try {
                if (!peerConnections.current[from]) {
                    peerConnections.current[from] = createPeerConnection(from);
                }
                await peerConnections.current[from].setRemoteDescription(new RTCSessionDescription(sdp));
                const answer = await peerConnections.current[from].createAnswer();
                await peerConnections.current[from].setLocalDescription(answer);
                console.log("📡 [Socket] Gửi answer tới:", from, "SDP:", answer);
                socketcall.emit("answer", { targetUserId: from, sdp: answer });

                // Xử lý ICE candidates trong buffer
                if (iceCandidatesBuffer.current[from]) {
                    for (const candidate of iceCandidatesBuffer.current[from]) {
                        console.log("❄️ [Socket] Xử lý ICE candidate từ buffer cho:", from, "Candidate:", candidate);
                        await peerConnections.current[from].addIceCandidate(new RTCIceCandidate(candidate));
                    }
                    delete iceCandidatesBuffer.current[from];
                }
            } catch (error) {
                console.error("❌ [Socket] Lỗi xử lý offer:", error);
                cleanupPeer(from);
            }
        });

        socketcall.on("answer", async ({ from, sdp }) => {
            console.log("📡 [Socket] Nhận answer từ:", from, "SDP:", sdp);
            try {
                if (!peerConnections.current[from]) return;

                const pc = peerConnections.current[from];
                if (pc.signalingState !== "stable") {
                    console.warn(`⚠️ [Peer] Cannot set remote answer SDP in state: ${pc.signalingState}`);
                    return;
                }

                await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                // Xử lý ICE candidates trong buffer
                if (iceCandidatesBuffer.current[from]) {
                    for (const candidate of iceCandidatesBuffer.current[from]) {
                        console.log("❄️ [Socket] Xử lý ICE candidate từ buffer cho:", from, "Candidate:", candidate);
                        await pc.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                    delete iceCandidatesBuffer.current[from];
                }
            } catch (error) {
                console.error("❌ [Socket] Lỗi xử lý answer:", error);
                cleanupPeer(from);
            }
        });

        socketcall.on("ice-candidate", async ({ from, candidate }) => {
            console.log("❄️ [Socket] Nhận ICE candidate từ:", from, "Candidate:", candidate);
            try {
                if (!peerConnections.current[from]) {
                    console.warn("⚠️ [Socket] PeerConnection cho", from, "chưa tồn tại");
                    return;
                }
                if (!peerConnections.current[from].remoteDescription) {
                    console.log("⏳ [Socket] Lưu ICE candidate vào buffer cho:", from);
                    if (!iceCandidatesBuffer.current[from]) iceCandidatesBuffer.current[from] = [];
                    iceCandidatesBuffer.current[from].push(candidate);
                    return;
                }
                await peerConnections.current[from].addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error("❌ [Socket] Lỗi xử lý ICE candidate:", error);
            }
        });

        return () => {
            socketcall.off("connect");
            socketcall.off("disconnect");
        };
    }, [socketcall, stream]);

    const [isMessengerPath, SetIsMessengerPath] = useState(true);
    const location = useLocation();
    useEffect(() => {
        SetIsMessengerPath(/^\/messenger(\/|$)/.test(location.pathname));
    }, [location]);

    return (
        // <div className="max-w-screen h-full">
        //     <UserProvider>
        //         <Navbar />
        //         <div className="navbar max-w-screen"></div>
        //         <div className="flex h-screen">
        //             {/* Sidebar */}
        //             <SideBar />
        //             {/* Main Content */}
        //             <main className="bg-background w-full md:w-4/5 lg:w-5/6 xl:w-5/6 p-4 ml-auto">
        //                 <Outlet />
        //             </main>
        //         </div>
        //     </UserProvider>
        // </div>
        <div className="min-h-screen flex flex-col bg-base-200">
            <UserProvider>
                <Navbar />
                <div className="navbar"></div>
                <div className="container mx-auto flex ">
                    {/* Sidebar */}
                    {isMessengerPath ? (
                        <div className="hidden md:block">
                            <SideBar />
                        </div>
                    ) : (
                        <div className="hidden md:block md:w-1/5 lg:w-1/6 xl:w-1/6">
                            <SideBar />
                        </div>
                    )}
                    {/* Main Content */}
                    <main className="bg-background w-full ">
                        <Outlet />
                        <ToastContainer position="bottom-left" autoClose={3000} />
                    </main>
                </div>
            </UserProvider>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        {/* <h2 className="text-lg font-bold mb-4">📞 Cuộc gọi đến</h2>
                        <p className="mb-4">Bạn có cuộc gọi từ: {incomingCallInfo?.from}</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="btn btn-error"
                                onClick={() => {
                                    console.log("❌ [Socket] Gửi rejectCall tới:", incomingCallInfo.from);
                                    socketcall.emit("rejectCall", { callerId: incomingCallInfo.from });
                                    setIsModalOpen(false); // Đóng modal
                                }}
                            >
                                Từ chối
                            </button>
                            <button
                                className="btn btn-success"
                                onClick={() => {
                                    setIsModalOpen(false); // Đóng modal Incoming Call
                                    setIsCallModalOpen(true); // Mở modal Call
                                }}
                            >
                                Chấp nhận
                            </button>
                        </div> */}
                    </div>
                </div>
            )}

            {/* Modal Call */}
            {isCallModalOpen && (
                <Call
                    isOpen={isCallModalOpen}
                    onClose={() => {
                        setIsCallModalOpen(false);
                        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                                .then((stream) => {
                                    stream.getTracks().forEach((track) => track.stop());
                                })
                                .catch((err) => console.error("❌ [Media] Lỗi dọn dẹp camera/micro:", err));
                        }
                    }}
                    status={"in-call"}
                    iceServers={iceServers} // Pass iceServers as a prop
                />
            )}
        </div>


    );
}
