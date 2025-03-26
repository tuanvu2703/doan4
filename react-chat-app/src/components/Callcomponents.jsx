import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const Call = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const [targetUserId, setTargetUserId] = useState("");
  const [token, setToken] = useState("");
  const [socket, setSocket] = useState(null);
  const [stream, setStream] = useState(null);

  const URL = "https://social-network-jbtx.onrender.com";
  const iceServers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // Lấy camera + micro
  useEffect(() => {
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
      }
    };
    getMediaDevices();
  }, []);

  // Kết nối socket
  const connectSocket = () => {
    if (!token) return alert("Vui lòng nhập token");

    const newSocket = io(URL, {
      extraHeaders: { Authorization: `Bearer ${token}` },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Kết nối WebSocket thành công");
    });

    newSocket.on("userId", ({ userId }) => {
      console.log("🆔 User ID:", userId);
      setUserId(userId);
    });

    newSocket.on("incomingCall", ({ from }) => {
      const accept = window.confirm(`📞 Cuộc gọi từ ${from}, chấp nhận?`);
      if (accept) {
        acceptCall(from);
      } else {
        newSocket.emit("rejectCall", { callerId: from });
      }
    });

    newSocket.on("callRejected", ({ from }) => {
      alert(`❌ Cuộc gọi từ ${from} đã bị từ chối`);
    });

    newSocket.on("callEnded", ({ from }) => {
      alert(`🚫 Cuộc gọi kết thúc bởi ${from}`);
      endCall();
    });

    newSocket.on("offer", async ({ from, sdp }) => {
      console.log("📡 Nhận offer từ", from);
      peerConnectionRef.current = createPeerConnection(from);
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));

      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      newSocket.emit("answer", {
        targetUserId: from,
        sdp: answer,
      });
    });

    newSocket.on("answer", async ({ from, sdp }) => {
      console.log("📡 Nhận answer từ", from);
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    newSocket.on("ice-candidate", async ({ from, candidate }) => {
      console.log("❄️ Nhận ICE từ", from);
      try {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Lỗi ICE", e);
      }
    });
  };

  // Tạo kết nối WebRTC
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
      console.log("🎥 Nhận track từ remote");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    return pc;
  };

  // Gọi người khác
  const startCall = async () => {
    if (!targetUserId || !socket) return alert("Nhập ID người cần gọi");

    peerConnectionRef.current = createPeerConnection(targetUserId);

    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);

    socket.emit("startCall", { targetUserId });
    socket.emit("offer", { targetUserId, sdp: offer });
  };

  // Chấp nhận cuộc gọi
  const acceptCall = async (callerId) => {
    peerConnectionRef.current = createPeerConnection(callerId);
  };

  // Kết thúc cuộc gọi
  const endCall = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (socket && targetUserId) {
      socket.emit("endCall", { targetUserId });
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
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
        <label>Gọi tới ID: </label>
        <input value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} />
        <button onClick={startCall}>Gọi</button>
        <button onClick={endCall}>Kết thúc</button>
      </div>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div>
          <h4>👤 Video của bạn</h4>
          <video ref={localVideoRef} autoPlay playsInline muted width="300" />
        </div>
        <div>
          <h4>👥 Video đối phương</h4>
          <video ref={remoteVideoRef} autoPlay playsInline width="300" />
        </div>
      </div>
    </div>
  );
};

export default Call;
