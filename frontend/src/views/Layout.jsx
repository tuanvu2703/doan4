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
import { CallProvider, useCall } from "../components/CallContext";
import user from "../service/user";
import { set } from "lodash";
// Main Layout component
export default function Layout() {
  return (
    <UserProvider>
      <CallProvider>
        <LayoutContent />
      </CallProvider>
    </UserProvider>
  );
}

// Inner component that uses the call context
function LayoutContent() {
  const navigate = useNavigate();
  const [userCurrent, setUserCurrent] = useState({});
  const [disconnect, setDisconnect] = useState(true);
  const [users, setUsers] = useState([]);
  const { callState, acceptIncomingCall, endCall } = useCall();
  const [showCallConfirm, setShowCallConfirm] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState(null);

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
      const reponseUser = await user.getAllUser();
      setUsers(reponseUser.data);
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
  }, [navigate]);  // Handle incoming calls
  useEffect(() => {
    // Set up incomingCall handler
    socket.on("incomingCall", ({ from, group }) => {
      console.log("📞 [Socket] Nhận incomingCall từ:", from, "group:", group);

      // Get our current user ID (to compare with the caller)
      const currentUserId = userCurrent?._id;
      console.log("👤 Current user ID:", currentUserId, "Caller ID:", from);

      // First check if the incoming call is from ourselves 
      // (this happens due to socket broadcast)
      if (currentUserId && String(currentUserId) === String(from)) {
        console.log("🔄 [Socket] Bỏ qua cuộc gọi từ chính mình");
        return;
      }

      // Check if we're already in a call with someone else
      // Only reject if we're not the one making this call
      if (callState.isOpen && callState.status !== 'calling') {
        console.log("❌ [Socket] Tự động từ chối cuộc gọi vì đang trong cuộc gọi khác");
        socket.emit("rejectCall", { callerId: from });
        return;
      }

      // Check if this is part of our existing outgoing call
      // Nếu trạng thái hiện tại là 'calling' và người gọi đến nằm trong danh sách
      // targetUserIds, thì bỏ qua notification này
      const targetIds = callState.targetUserIds ? callState.targetUserIds.split(',').map(id => id.trim()) : [];
      const isPartOfOutgoingCall = callState.status === 'calling' && targetIds.length > 0;
      if (isPartOfOutgoingCall) {
        console.log("🔄 [Socket] Bỏ qua incomingCall vì liên quan đến cuộc gọi đi hiện tại");
        return;
      }
      // Hiển thị thông báo cuộc gọi đến
      console.log("📱 [Socket] Hiển thị thông báo cuộc gọi đến từ:", from);
      setIncomingCallData({ from, group });
      setShowCallConfirm(true);
    });

    // Set up callRejected handler
    socket.on("callRejected", ({ from }) => {
      console.log("❌ [Socket] Nhận callRejected từ:", from);
      toast.error(`Cuộc gọi bị từ chối bởi ${from}`, NotificationCss.Fail);
      endCall(); // Close the call modal
    });    // Cleanup event listeners
    return () => {
      socket.off("incomingCall");
      socket.off("callRejected");
    };
  }, [endCall, callState.isOpen, callState.targetUserIds, callState.status, userCurrent?._id]);
  // Handle call acceptance
  const handleAcceptCall = () => {
    if (incomingCallData) {
      acceptIncomingCall(incomingCallData.from, incomingCallData.group);
      setShowCallConfirm(false);
      setIncomingCallData(null);
    }
  };

  // Handle call rejection
  const handleRejectCall = () => {
    if (incomingCallData) {
      console.log("❌ [Socket] Gửi rejectCall tới:", incomingCallData.from);
      socket.emit("rejectCall", { callerId: incomingCallData.from });
      setShowCallConfirm(false);
      setIncomingCallData(null);
    }
  };
  // When callState changes, ensure the incoming call dialog is hidden if we're in a call
  useEffect(() => {
    if (callState.isOpen && showCallConfirm) {
      setShowCallConfirm(false);
      setIncomingCallData(null);
    }
  }, [callState.isOpen, showCallConfirm]);

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


  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <Navbar />
      <div className="navbar"></div>
      {/* SideBar component outside the container for full-height display */}
      <SideBar />

      <div className="flex relative">
        {/* Main content with padding adjustment for sidebar */}
        <main className="bg-background w-full px-2 sm:px-4 md:ml-[16.666667%] lg:ml-[16.666667%] transition-all duration-300">
          <Outlet />
          <ToastContainer
            position="bottom-left"
            autoClose={3000}
            limit={3}
            newestOnTop
          />
        </main>
      </div>

      {/* Call Confirmation Dialog */}
      {showCallConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Cuộc gọi đến</h3>
            <div className="flex items-center gap-4 mb-6">
              {users.find(user => user._id === incomingCallData?.from) && (
                <img
                  src={users.find(user => user._id === incomingCallData?.from).avatar || imgUser}
                  alt="Caller"
                  className="w-16 h-16 rounded-full border-2 border-gray-200"
                />
              )}
              <p>
                Bạn có cuộc gọi từ
              </p>
              <p className="font-bold">{
                users.find(user => user._id === incomingCallData?.from)
                  ? `${users.find(user => user._id === incomingCallData?.from).lastName || ''} ${users.find(user => user._id === incomingCallData?.from).firstName || ''}`.trim()
                  : incomingCallData?.from
              }
              </p>

            </div>
            <div className="flex justify-end gap-3 sm:gap-4">
              <button
                onClick={handleRejectCall}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm sm:text-base"
              >
                Từ chối
              </button>
              <button
                onClick={handleAcceptCall}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm sm:text-base"
              >
                Chấp nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Call Component */}
      {callState.isOpen && (
        <Call
          isOpen={callState.isOpen}
          targetUserIds={callState.targetUserIds}
          status={callState.status}
          onClose={endCall}
        />
      )}
    </div>
  );
}