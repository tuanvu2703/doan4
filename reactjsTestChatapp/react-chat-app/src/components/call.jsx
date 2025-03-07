import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001/call"); // Kết nối đến backend WebSocket

const App = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const [userId, setUserId] = useState("");
  const [targetUserId, setTargetUserId] = useState("");

  useEffect(() => {
    socket.on("incomingCall", ({ from }) => {
      console.log("📞 Cuộc gọi đến từ:", from);
      setTargetUserId(from);
    });

    socket.on("offer", async ({ from, sdp }) => {
      console.log("📡 Nhận OFFER từ", from);
      setTargetUserId(from);
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit("answer", { targetUserId: from, sdp: answer });
    });

    socket.on("answer", async ({ from, sdp }) => {
      console.log("📡 Nhận ANSWER từ", from);
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    socket.on("ice-candidate", ({ from, candidate }) => {
      console.log("❄️ ICE Candidate từ", from);
      peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => socket.disconnect();
  }, []);

  const startCall = async () => {
    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", { targetUserId, candidate: event.candidate });
      }
    };

    peerConnection.current.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideoRef.current.srcObject = stream;
    stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit("offer", { targetUserId, sdp: offer });
  };

  return (
    <div>
      <h1>WebRTC Video Call</h1>
      <div>
        <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "300px" }} />
        <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "300px" }} />
      </div>
      <input
        type="text"
        placeholder="Nhập ID người nhận"
        value={targetUserId}
        onChange={(e) => setTargetUserId(e.target.value)}
      />
      <button onClick={startCall}>Gọi</button>
    </div>
  );
};

export default App;
