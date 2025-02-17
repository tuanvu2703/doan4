// useWebSocket.js
import { useEffect } from "react";
import socket from "../components/socket"; // Import từ file socket.js

const useWebSocket = (onMessageReceived) => {
  useEffect(() => {
    // Kết nối WebSocket
    socket.on("connect", () => {
      console.log("Connected to WebSocket server with ID:", socket.id);
    });

    // Lắng nghe sự kiện 'events'
    socket.on("events", (data) => {
      console.log("Received event:", data);
    });

    // Lắng nghe sự kiện 'newmessage'
    socket.on("newmessage", (data) => {
      console.log("Received new message:", data);
      if (onMessageReceived) {
        onMessageReceived(data); // Gọi callback khi có tin nhắn mới
      }
    });

    // Xử lý khi ngắt kết nối
    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    // Cleanup function khi component bị hủy
    return () => {
      socket.off("connect");
      socket.off("events");
      socket.off("newmessage");
      socket.off("disconnect");
    };
  }, [onMessageReceived]);

  const sendMessage = (message) => {
    socket.emit("sendMessage", { content: message });
  };

  return { sendMessage };
};

export default useWebSocket;
