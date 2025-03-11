import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const Call = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef({});
  const peerConnections = useRef({});
  const [userId, setUserId] = useState(null);
  const [targetUserIds, setTargetUserIds] = useState("");
  const [token, setToken] = useState("");
  const [socket, setSocket] = useState(null);
  const [stream, setStream] = useState(null);

  const URL = "https://social-network-jbtx.onrender.com/call";
  const iceServers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    if (!window.RTCPeerConnection) {
      alert("Trình duyệt của bạn không hỗ trợ WebRTC!");
      return;
    }

    const getMediaDevices = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(userStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = userStream;
        }
      } catch (err) {
        console.error("Lỗi lấy thiết bị media:", err);
        alert("Không thể truy cập camera hoặc micro!");
      }
    };
    getMediaDevices();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const connectSocket = () => {
    if (!token) return alert("Vui lòng nhập token");

    const newSocket = io(URL, {
      extraHeaders: { Authorization: `Bearer ${token}` },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Kết nối WebSocket thành công");
    });

    newSocket.on("disconnect", () => {
      console.log("❌ WebSocket ngắt kết nối");
      alert("Mất kết nối với server, vui lòng thử lại.");
      endCall();
    });

    newSocket.on("userId", ({ userId }) => {
      console.log("🆔 User ID:", userId);
      setUserId(userId);
    });

    newSocket.on("incomingCall", ({ from, group }) => {
      const accept = window.confirm(`📞 Cuộc gọi từ ${from}, chấp nhận?`);
      if (accept) {
        acceptCall(from, group || [from]);
      } else {
        newSocket.emit("rejectCall", { callerId: from });
      }
    });

    newSocket.on("callRejected", ({ from }) => {
      alert(`❌ Cuộc gọi từ ${from} đã bị từ chối`);
      cleanupPeer(from);
    });

    newSocket.on("callEnded", ({ from }) => {
      alert(`🚫 Cuộc gọi kết thúc bởi ${from}`);
      cleanupPeer(from);
    });

    newSocket.on("callUnavailable", ({ message }) => {
      alert(`❌ ${message}`);
    });

    newSocket.on("offer", async ({ from, sdp }) => {
      try {
        console.log(`📡 Nhận offer từ ${from} lúc ${new Date().toISOString()}`);
        if (!peerConnections.current[from]) {
          peerConnections.current[from] = createPeerConnection(from);
        }
        await peerConnections.current[from].setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peerConnections.current[from].createAnswer();
        await peerConnections.current[from].setLocalDescription(answer);
        newSocket.emit("answer", { targetUserId: from, sdp: answer });
      } catch (error) {
        console.error("Lỗi xử lý offer:", error);
        alert(`Không thể thiết lập cuộc gọi với ${from}`);
        cleanupPeer(from);
      }
    });

    newSocket.on("answer", async ({ from, sdp }) => {
      try {
        console.log("📡 Nhận answer từ", from);
        if (!peerConnections.current[from]) {
          console.warn(`PeerConnection cho ${from} chưa tồn tại khi nhận answer`);
          return;
        }
        await peerConnections.current[from].setRemoteDescription(new RTCSessionDescription(sdp));
      } catch (error) {
        console.error("Lỗi xử lý answer:", error);
        alert(`Không thể kết nối với ${from}`);
        cleanupPeer(from);
      }
    });

    newSocket.on("ice-candidate", async ({ from, candidate }) => {
      try {
        console.log(`❄️ Nhận ICE từ ${from} lúc ${new Date().toISOString()}`);
        if (!peerConnections.current[from]) {
          console.warn(`PeerConnection cho ${from} chưa được khởi tạo, tạo mới...`);
          peerConnections.current[from] = createPeerConnection(from);
        }
        if (!peerConnections.current[from].remoteDescription) {
          console.warn(`Chưa có remoteDescription cho ${from}, bỏ qua ICE candidate`);
          return;
        }
        await peerConnections.current[from].addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Lỗi xử lý ICE:", error);
      }
    });
  };

  const createPeerConnection = (targetId) => {
    const pc = new RTCPeerConnection(iceServers);

    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    pc.onicecandidate = (e) => {
      if (e.candidate && socket) {
        socket.emit("ice-candidate", {
          targetUserId: targetId,
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = (e) => {
      console.log("🎥 Nhận track từ", targetId);
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
        document.getElementById("remote-videos").appendChild(container);
        remoteVideoRefs.current[targetId] = video;
      }
      remoteVideoRefs.current[targetId].srcObject = e.streams[0];
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
        console.log(`❌ Kết nối với ${targetId} bị ngắt`);
        cleanupPeer(targetId);
      }
    };

    return pc;
  };

  const startCall = async () => {
    if (!targetUserIds || !socket) return alert("Nhập ID người cần gọi (cách nhau bằng dấu phẩy)");

    const ids = targetUserIds.split(",").map(id => id.trim());
    if (ids.length > 5) return alert("Tối đa 5 người trong nhóm");

    ids.forEach(async (targetId) => {
      try {
        peerConnections.current[targetId] = createPeerConnection(targetId);
        const offer = await peerConnections.current[targetId].createOffer();
        await peerConnections.current[targetId].setLocalDescription(offer);
        socket.emit("offer", { targetUserId: targetId, sdp: offer });
      } catch (error) {
        console.error(`Lỗi tạo offer cho ${targetId}:`, error);
        alert(`Không thể gọi ${targetId}`);
      }
    });

    socket.emit("startCall", { targetUserIds: ids });
  };

  const acceptCall = async (callerId, group) => {
    group.forEach(id => {
      if (id !== userId && !peerConnections.current[id]) {
        peerConnections.current[id] = createPeerConnection(id);
      }
    });
  };

  const endCall = () => {
    Object.keys(peerConnections.current).forEach(targetId => cleanupPeer(targetId));
    if (socket) socket.emit("endCall");
  };

  const cleanupPeer = (targetId) => {
    if (peerConnections.current[targetId]) {
      peerConnections.current[targetId].close();
      delete peerConnections.current[targetId];
    }
    if (remoteVideoRefs.current[targetId]) {
      remoteVideoRefs.current[targetId].srcObject = null;
      remoteVideoRefs.current[targetId].parentElement.remove();
      delete remoteVideoRefs.current[targetId];
    }
  };

  return (
    <div>
      <h2>📞 Video Call Demo</h2>

      <div>
        <label>Token: </label>
        <input value={token} onChange={(e) => setToken(e.target.value)} />
        <button onClick={connectSocket}>Kết nối</button>
      </div>

      <div>
        <label>Gọi tới ID (cách nhau bằng ","): </label>
        <input value={targetUserIds} onChange={(e) => setTargetUserIds(e.target.value)} />
        <button onClick={startCall}>Gọi</button>
        <button onClick={endCall}>Kết thúc</button>
      </div>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div>
          <h4>👤 Video của bạn</h4>
          <video ref={localVideoRef} autoPlay playsInline muted width="300" />
        </div>
        <div>
          <h4>👥 Video nhóm</h4>
          <div
            id="remote-videos"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Call;