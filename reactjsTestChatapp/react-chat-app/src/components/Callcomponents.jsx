import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'peerjs';

const SERVER_URL = 'http://localhost:3001/call';

function App() {
  const [token, setToken] = useState('');
  const [socket, setSocket] = useState(null);
  const [peer, setPeer] = useState(null);
  const [myId, setMyId] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [incomingCall, setIncomingCall] = useState(null);
  const [callActive, setCallActive] = useState(false);

  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStream = useRef(null);

  useEffect(() => {
    if (token) {
      const newSocket = io(SERVER_URL, {
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      newSocket.on('userId', ({ userId }) => {
        setMyId(userId);
      });

      newSocket.on('incomingCall', ({ from }) => {
        setIncomingCall(from);
      });

      newSocket.on('callEnded', () => {
        endCall();
      });

      setSocket(newSocket);
    }
  }, [token]);

  useEffect(() => {
    if (socket) {
      const peerInstance = new Peer();

      peerInstance.on('open', (id) => {
        console.log('My Peer ID:', id);
      });

      peerInstance.on('call', (call) => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
          call.answer(stream);
          call.on('stream', (remoteStream) => {
            remoteVideoRef.current.srcObject = remoteStream;
          });
        });
      });

      setPeer(peerInstance);
    }
  }, [socket]);

  const startCall = async () => {
    if (!targetUserId || !peer || !socket) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      myVideoRef.current.srcObject = stream;
      localStream.current = stream;

      socket.emit('startCall', { targetUserId });

      const call = peer.call(targetUserId, stream);
      call.on('stream', (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });

      setCallActive(true);
    } catch (err) {
      console.error('Lỗi khi gọi:', err);
    }
  };

  const acceptCall = async () => {
    if (!incomingCall || !peer) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      myVideoRef.current.srcObject = stream;
      localStream.current = stream;

      const call = peer.call(incomingCall, stream);
      call.on('stream', (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });

      setCallActive(true);
      setIncomingCall(null);
    } catch (err) {
      console.error('Lỗi khi nhận cuộc gọi:', err);
    }
  };

  const rejectCall = () => {
    if (socket && incomingCall) {
      socket.emit('rejectCall', { callerId: incomingCall });
      setIncomingCall(null);
    }
  };

  const endCall = () => {
    if (socket && targetUserId) {
      socket.emit('endCall', { targetUserId });
    }

    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
    }

    myVideoRef.current.srcObject = null;
    remoteVideoRef.current.srcObject = null;
    setCallActive(false);
    setTargetUserId('');
    setIncomingCall(null);
  };

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <h1>WebRTC Call App</h1>

      {!token ? (
        <div>
          <input
            type="text"
            placeholder="Nhập JWT Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <button onClick={() => setToken(token)}>Kết Nối</button>
        </div>
      ) : (
        <div>
          <h3>🔹 ID của bạn: {myId}</h3>
          <input
            type="text"
            placeholder="Nhập ID người muốn gọi"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            disabled={callActive}
          />

          <div>
            {!callActive && <button onClick={startCall}>📞 Gọi</button>}
            {incomingCall && (
              <>
                <button onClick={acceptCall}>✅ Chấp nhận</button>
                <button onClick={rejectCall}>❌ Từ chối</button>
              </>
            )}
            {callActive && <button onClick={endCall}>⏹ Kết thúc</button>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
            <div>
              <h3>🎥 Video của bạn</h3>
              <video ref={myVideoRef} autoPlay playsInline muted width="300" height="200" />
            </div>
            <div>
              <h3>👤 Video của đối phương</h3>
              <video ref={remoteVideoRef} autoPlay playsInline width="300" height="200" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
