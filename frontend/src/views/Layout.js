import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./navbar/navBar";
import authToken from "../components/authToken";
import { useEffect, useState, useRef } from "react";
import { UserProvider } from "../service/UserContext";
import socket from "../service/webSocket/socket";
import { toast } from "react-toastify";
import NotificationCss from "../module/cssNotification/NotificationCss";
import imgUser from "../img/user.png";
import { profileUserCurrent } from "../service/ProfilePersonal";
import SideBar from "./sidebar/SideBar";
import { ToastContainer } from "react-toastify";
import Call from "../components/Call";

export default function Layout() {
  const navigate = useNavigate();
  const [userCurrent, setUserCurrent] = useState({});
  const [disconnect, setDisconnect] = useState(true);

  useEffect(() => {
    if (disconnect === true) {
      socket.on("connect", () => {
        console.log("✅ [Socket] Connected to WebSocket server with ID:", socket.id);
        setDisconnect(false);
      });
      socket.on("connect_error", (err) => {
        console.error("❌ [Socket] Lỗi kết nối:", err.message);
      });
    } else {
      socket.on("disconnect", () => {
        console.log("❌ [Socket] Disconnected from server");
        setDisconnect(true);
      });
    }
  }, [disconnect]);

  const getDataUser = async () => {
    try {
      const response = await profileUserCurrent();
      if (response && response.data) {
        setUserCurrent(response.data);
      } else {
        console.warn("No data found in response.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    if (!authToken.getToken()) {
      navigate("/login");
      return;
    }
    getDataUser();
  }, [navigate]);

  useEffect(() => {
    socket.on("newmessage", (newMessage) => {
      if (String(newMessage.sender._id) !== String(userCurrent._id) && newMessage.sender._id && userCurrent._id) {
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
            <div className="line-clamp-2 overflow-hidden text-ellipsis" title={newMessage?.content}>
              {newMessage ? newMessage.content : ''}
            </div>
          </a>,
          NotificationCss.Mess
        );
      }
    });

    socket.on("newmessagetogroup", (newMessage) => {
      if (String(newMessage.sender._id) !== String(userCurrent._id) && newMessage.sender._id && userCurrent._id) {
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
            <div className="line-clamp-2 text-xs text-gray-400 overflow-hidden text-ellipsis" title={newMessage?.content}>
              Nhắn:{newMessage ? newMessage.content : ''}
            </div>
          </a>,
          NotificationCss.Mess
        );
      }
    });

    return () => {
      socket.off("newmessage");
      socket.off("newmessagetogroup");
    };
  }, [userCurrent]);

  
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const peerConnections = useRef({});
  const iceCandidatesBuffer = useRef({});
  const [stream, setStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [callStatus, setCallStatus] = useState("idle");
  const [targetUserIds, setTargetUserIds] = useState(null);
  const [error, setError] = useState(null);

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

  const cleanupPeer = (targetId) => {
    console.log("🧹 [Peer] Dọn dẹp PeerConnection với:", targetId);
    if (peerConnections.current[targetId]) {
      peerConnections.current[targetId].close();
      delete peerConnections.current[targetId];
    }
    if (iceCandidatesBuffer.current[targetId]) {
      delete iceCandidatesBuffer.current[targetId];
    }
    setRemoteStreams((prev) => {
      const newStreams = { ...prev };
      delete newStreams[targetId];
      return newStreams;
    });
  };

  const cleanupStream = () => {
    if (stream) {
      console.log("🧹 [Media] Dọn dẹp stream");
      stream.getTracks().forEach((track) => {
        track.stop();
        console.log(`🧹 [Media] Đã dừng track: ${track.kind}`);
      });
      setStream(null);
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
      if (e.candidate) {
        console.log("❄️ [Peer] Gửi ICE candidate tới:", targetId, "Candidate:", e.candidate);
        socket.emit("ice-candidate", { targetUserId: targetId, candidate: e.candidate });
      }
    };
    pc.ontrack = (e) => {
      console.log("📹 [Peer] Nhận stream từ:", targetId, "Tracks:", e.streams[0].getTracks());
      setRemoteStreams((prev) => ({
        ...prev,
        [targetId]: e.streams[0],
      }));
    };
    pc.oniceconnectionstatechange = () => {
      console.log("🌐 [Peer] Trạng thái ICE của", targetId, ":", pc.iceConnectionState);
      if (pc.iceConnectionState === "disconnected" || pc.iceConnectionState === "failed") {
        cleanupPeer(targetId);
      } else if (pc.iceConnectionState === "connected") {
        setCallStatus("in-call");
      }
    };
    pc.onsignalingstatechange = () => {
      console.log("📡 [Peer] Trạng thái signaling của", targetId, ":", pc.signalingState);
    };
    return pc;
  };

  const startCall = async (targetUserIds) => {
    console.log("📞 [Call] Bắt đầu cuộc gọi với:", targetUserIds);
    if (!targetUserIds || callStatus !== "idle") {
      console.log("⚠️ [Call] Không thể gọi: ", { targetUserIds, callStatus });
      return;
    }

    setCallStatus("calling");
    setIsCallModalOpen(true);

    try {
      console.log("📹 [Media] Đang cố gắng lấy stream...");
      const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log("✅ [Media] Đã lấy stream thành công:", userStream);
      setStream(userStream);
      setTargetUserIds(targetUserIds);
      socket.emit("startCall", { targetUserIds });

      const ids = targetUserIds.split(",").map((id) => id.trim());
      for (const targetId of ids) {
        if (targetId !== userCurrent._id && !peerConnections.current[targetId]) {
          peerConnections.current[targetId] = createPeerConnection(targetId);
          const offer = await peerConnections.current[targetId].createOffer();
          await peerConnections.current[targetId].setLocalDescription(offer);
          console.log("📡 [Socket] Gửi offer tới:", targetId, "SDP:", offer);
          socket.emit("offer", { targetUserId: targetId, sdp: offer });
        }
      }
    } catch (err) {
      console.error("❌ [Call] Lỗi khi lấy stream:", err.name, err.message);
      setError(`Không thể truy cập camera hoặc micro! Lỗi: ${err.name} - ${err.message}`);
      setCallStatus("error");
    }
  };

  const acceptCall = async (callerId, group) => {
    console.log("✅ [Call] Chấp nhận cuộc gọi từ:", callerId, "group:", group);
    setCallStatus("in-call");
    setIsCallModalOpen(true);

    try {
      console.log("📹 [Media] Đang cố gắng lấy stream (acceptCall)...");
      const userStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log("✅ [Media] Đã lấy stream thành công (acceptCall):", userStream);
      setStream(userStream);

      group.forEach((id) => {
        if (id !== userCurrent._id && !peerConnections.current[id]) {
          const pc = createPeerConnection(id);
          peerConnections.current[id] = pc;
          if (userStream) {
            userStream.getTracks().forEach((track) => {
              console.log("➕ [Peer] Thêm track vào PeerConnection (acceptCall):", track.kind);
              pc.addTrack(track, userStream);
            });
          }
        }
      });
    } catch (err) {
      console.error("❌ [Call] Lỗi chấp nhận cuộc gọi:", err.name, err.message);
      setError(`Không thể truy cập camera hoặc micro! Lỗi: ${err.name} - ${err.message}`);
      setCallStatus("error");
      socket.emit("rejectCall", { callerId });
    }
  };

  const endCall = () => {
    console.log("🚫 [Socket] Gửi endCall");
    Object.keys(peerConnections.current).forEach((targetId) => cleanupPeer(targetId));
    socket.emit("endCall");
    cleanupStream();
    setCallStatus("idle");
    setIsCallModalOpen(false);
    setTargetUserIds(null);
    setError(null);
  };

  useEffect(() => {
    socket.on("incomingCall", ({ from, group }) => {
      console.log("📞 [Socket] Nhận incomingCall từ:", from, "group:", group);
      const accept = window.confirm(`📞 Cuộc gọi từ ${from}, chấp nhận?`);
      if (accept) {
        acceptCall(from, group);
      } else {
        socket.emit("rejectCall", { callerId: from });
      }
    });

    socket.on("callRejected", ({ from }) => {
      console.log("❌ [Socket] Nhận callRejected từ:", from);
      alert(`❌ Cuộc gọi từ ${from} đã bị từ chối`);
      cleanupPeer(from);
      cleanupStream();
      setCallStatus("idle");
      setIsCallModalOpen(false);
      setTargetUserIds(null);
      setError(null);
    });

    socket.on("callEnded", ({ from }) => {
      console.log("🚫 [Socket] Nhận callEnded từ:", from);
      alert(`🚫 Cuộc gọi kết thúc bởi ${from}`);
      cleanupPeer(from);
      cleanupStream();
      setCallStatus("idle");
      setIsCallModalOpen(false);
      setTargetUserIds(null);
      setError(null);
    });

    socket.on("callUnavailable", ({ message }) => {
      console.log("❌ [Socket] Nhận callUnavailable:", message);
      alert(`❌ ${message}`);
      cleanupStream();
      setCallStatus("idle");
      setIsCallModalOpen(false);
      setTargetUserIds(null);
      setError(null);
    });

    socket.on("offer", async ({ from, sdp }) => {
      console.log("📡 [Socket] Nhận offer từ:", from, "SDP:", sdp);
      try {
        if (!peerConnections.current[from]) {
          peerConnections.current[from] = createPeerConnection(from);
        }
        const pc = peerConnections.current[from];
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log("📡 [Socket] Gửi answer tới:", from, "SDP:", answer);
        socket.emit("answer", { targetUserId: from, sdp: answer });

        if (iceCandidatesBuffer.current[from]) {
          for (const candidate of iceCandidatesBuffer.current[from]) {
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
      console.log("📡 [Socket] Nhận answer từ:", from, "SDP:", sdp);
      try {
        const pc = peerConnections.current[from];
        if (!pc) return;
        if (pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          if (iceCandidatesBuffer.current[from]) {
            for (const candidate of iceCandidatesBuffer.current[from]) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
            delete iceCandidatesBuffer.current[from];
          }
        } else {
          console.warn(`⚠️ [Peer] Cannot set remote answer SDP in state: ${pc.signalingState}`);
        }
      } catch (error) {
        console.error("❌ [Socket] Lỗi xử lý answer:", error);
        cleanupPeer(from);
      }
    });

    socket.on("ice-candidate", async ({ from, candidate }) => {
      console.log("❄️ [Socket] Nhận ICE candidate từ:", from, "Candidate:", candidate);
      try {
        const pc = peerConnections.current[from];
        if (!pc || !pc.remoteDescription) {
          if (!iceCandidatesBuffer.current[from]) iceCandidatesBuffer.current[from] = [];
          iceCandidatesBuffer.current[from].push(candidate);
          return;
        }
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("❌ [Socket] Lỗi xử lý ICE candidate:", error);
      }
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callRejected");
      socket.off("callEnded");
      socket.off("callUnavailable");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [stream, userCurrent._id]);

  const [isMessengerPath, SetIsMessengerPath] = useState(true);
  const location = useLocation();
  useEffect(() => {
    SetIsMessengerPath(/^\/messenger(\/|$)/.test(location.pathname));
  }, [location]);

  const handleTestCall = () => {
    console.log("🔘 [Button] Nhấn nút Thử gọi");
    const targetIds = prompt("Nhập ID người dùng (cách nhau bằng dấu phẩy):");
    if (targetIds) {
      startCall(targetIds);
    } else {
      console.log("⚠️ [Button] Không nhập targetIds");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <UserProvider>
        <Navbar />
        <div className="navbar"></div>
        <div className="container mx-auto flex">
          {isMessengerPath ? (
            <div className="hidden md:block">
              <SideBar />
            </div>
          ) : (
            <div className="hidden md:block md:w-1/5 lg:w-1/6 xl:w-1/6">
              <SideBar />
            </div>
          )}
          <main className="bg-background w-full">
            <button onClick={handleTestCall}>Thử gọi</button>
            <Outlet />
            <ToastContainer position="bottom-left" autoClose={3000} />
          </main>
        </div>
      </UserProvider>
      {isCallModalOpen && (
        <Call
          isOpen={isCallModalOpen}
          onClose={endCall}
          stream={stream}
          remoteStreams={remoteStreams}
          status={callStatus}
          error={error}
        />
      )}
    </div>
  );
}