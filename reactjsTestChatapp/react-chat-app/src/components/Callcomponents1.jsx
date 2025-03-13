import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const VideoCall = () => {
  const [token, setToken] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [userId, setUserId] = useState(null);
  const [peers, setPeers] = useState(new Map());
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRefs = useRef(new Map());


  const connectWithToken = () => {
    if (!token) {
      alert('Please enter a token');
      return;
    }

    const newSocket = io('https://social-network-jbtx.onrender.com/call', {
      extraHeaders:{ Authorization: `Bearer ${token}` }
    });

    setSocket(newSocket);
    setIsConnected(true);
  };

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  // Initialize local media stream
  useEffect(() => {
    async function setupMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    }
    setupMedia();
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      alert('Connection failed. Please check your token and try again.');
      setIsConnected(false);
      socket.disconnect();
      setSocket(null);
    });

    socket.on('userId', ({ userId }) => {
      setUserId(userId);
    });

    socket.on('incomingCall', ({ from, group }) => {
      setIncomingCall({ from, group });
    });

    socket.on('callRejected', ({ from }) => {
      cleanupPeer(from);
    });

    socket.on('callEnded', ({ from }) => {
      cleanupPeer(from);
    });

    socket.on('offer', async ({ from, sdp }) => {
      await handleOffer(from, sdp);
    });

    socket.on('answer', ({ from, sdp }) => {
      handleAnswer(from, sdp);
    });

    socket.on('ice-candidate', ({ from, candidate }) => {
      handleIceCandidate(from, candidate);
    });

    return () => {
      socket.off('connect_error');
      socket.off('userId');
      socket.off('incomingCall');
      socket.off('callRejected');
      socket.off('callEnded');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
    };
  }, [socket]);

  // Create peer connection
  const createPeerConnection = (targetUserId) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });

    localStream?.getTracks().forEach(track => {
      peer.addTrack(track, localStream);
    });

    peer.ontrack = (event) => {
      const remoteVideo = remoteVideoRefs.current.get(targetUserId);
      if (remoteVideo) {
        remoteVideo.srcObject = event.streams[0];
      }
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          targetUserId,
          candidate: event.candidate
        });
      }
    };

    setPeers(prev => new Map(prev).set(targetUserId, peer));
    return peer;
  };

  const startCall = (targetUserIds) => {
    if (!isConnected) {
      alert('Please connect with a token first');
      return;
    }
    socket.emit('startCall', { targetUserIds });
    targetUserIds.forEach(targetId => {
      const peer = createPeerConnection(targetId);
      createOffer(peer, targetId);
    });
  };

  const createOffer = async (peer, targetId) => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit('offer', { targetUserId: targetId, sdp: offer });
  };

  const handleOffer = async (from, sdp) => {
    const peer = createPeerConnection(from);
    await peer.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit('answer', { targetUserId: from, sdp: answer });
  };

  const handleAnswer = (from, sdp) => {
    const peer = peers.get(from);
    if (peer) {
      peer.setRemoteDescription(new RTCSessionDescription(sdp));
    }
  };

  const handleIceCandidate = (from, candidate) => {
    const peer = peers.get(from);
    if (peer) {
      peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const acceptCall = () => {
    if (incomingCall) {
      incomingCall.group.forEach(targetId => {
        if (targetId !== userId) {
          createPeerConnection(targetId);
        }
      });
      setIncomingCall(null);
    }
  };

  const rejectCall = () => {
    if (incomingCall) {
      socket.emit('rejectCall', { callerId: incomingCall.from });
      setIncomingCall(null);
    }
  };

  const endCall = () => {
    if (!isConnected) return;
    socket.emit('endCall');
    peers.forEach((peer, id) => cleanupPeer(id));
  };

  const cleanupPeer = (userId) => {
    const peer = peers.get(userId);
    if (peer) {
      peer.close();
      setPeers(prev => {
        const newPeers = new Map(prev);
        newPeers.delete(userId);
        return newPeers;
      });
      const remoteVideo = remoteVideoRefs.current.get(userId);
      if (remoteVideo) remoteVideo.srcObject = null;
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setUserId(null);
      peers.forEach((peer, id) => cleanupPeer(id));
      setToken('');
    }
  };

  if (!isConnected) {
    return (
      <div>
        <h1>Video Call - Authentication</h1>
        <div>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your authentication token"
            style={{ padding: '8px', marginRight: '8px' }}
          />
          <button onClick={connectWithToken}>Connect</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Video Call - Connected as {userId}</h1>
      <button onClick={disconnect} style={{ marginBottom: '10px' }}>Disconnect</button>
      <div>
        <video ref={localVideoRef} autoPlay muted style={{ width: '200px' }} />
        {Array.from(peers.keys()).map(userId => (
          <video
            key={userId}
            ref={el => el && remoteVideoRefs.current.set(userId, el)}
            autoPlay
            style={{ width: '200px' }}
          />
        ))}
      </div>
      <div>
        <button onClick={() => startCall(['target-user-id-1', 'target-user-id-2'])}>
          Start Call
        </button>
        <button onClick={endCall}>End Call</button>
      </div>
      {incomingCall && (
        <div>
          <p>Incoming call from {incomingCall.from}</p>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={rejectCall}>Reject</button>
        </div>
      )}
    </div>
  );
};

export default VideoCall;