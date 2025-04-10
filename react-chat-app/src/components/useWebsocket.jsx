// useWebSocket.js
import { useEffect } from "react";
import socket from "./socket"; // Import từ file socket.js

const useWebSocket = (onMessageReceived) => {
  useEffect(() => {
    // Kết nối WebSocket
    socket.on("connect", () => {
      console.log("Connected to WebSocket server with ID:", socket.id); // Log khi kết nối thành công
    });

    // Lắng nghe sự kiện 'newmessagetogroup' (tên sự kiện phải khớp với sự kiện từ server)
    socket.on("newmessagetogroup", (data) => {
      console.log("Received new message:", data); // Log khi nhận được tin nhắn mới
      if (onMessageReceived) {
        onMessageReceived(data); // Gọi callback khi có tin nhắn mới
      }
    });

    // Lắng nghe sự kiện 'disconnect' khi ngắt kết nối
    socket.on("disconnect", () => {
      console.log("Disconnected from server"); // Log khi ngắt kết nối
    });

    // Lắng nghe sự kiện 'error' để log các lỗi
    socket.on("error", (error) => {
      console.error("WebSocket error:", error); // Log lỗi nếu có
    });

    // Lắng nghe sự kiện 'reconnect' khi WebSocket cố gắng kết nối lại
    socket.on("reconnect", (attempt) => {
      console.log("Reconnected to server, attempt:", attempt); // Log khi kết nối lại
    });

    // Xử lý khi ngắt kết nối
    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    // Cleanup function khi component bị hủy
    return () => {
      socket.off("connect");
      socket.off("newmessagetogroup");
      socket.off("disconnect");
      socket.off("error");
      socket.off("reconnect");
    };
  }, [onMessageReceived]);

  const sendMessage = (groupId, messageContent) => {
    console.log("Sending message:", { groupId, messageContent }); // Log khi gửi tin nhắn
    socket.emit("sendMessage", { groupId, content: messageContent });
  };

  return { sendMessage };
};

export default useWebSocket;
