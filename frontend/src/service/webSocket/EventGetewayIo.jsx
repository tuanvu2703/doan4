import React, { useEffect } from "react";
import socket from "./socket"; // Import từ file socket.js

const EventGetewayIo = () => {
  useEffect(() => {
    // Kết nối WebSocket
    socket.on("connect", () => {
      console.log("Connected to WebSocket server with ID test socket:", socket.id);
    });

    // Lắng nghe sự kiện 'events'
    socket.on("events", (data) => {
      console.log("Received event test socket:", data);
    });

    // Lắng nghe sự kiện 'newmessage'
    socket.on("newmessage", (data) => {
      console.log("Received new message test socket:", data);
    });

    // Xử lý khi ngắt kết nối
    socket.on("disconnect test socket", () => {
      console.log("Disconnected from server");
    });

    // Cleanup function khi component bị hủy
    return () => {
      socket.off("connect");
      socket.off("events");
      socket.off("newmessage");
      socket.off("disconnect");
    };
  }, []);

  const sendMessage = () => {
    socket.emit("sendMessage", { content: "Hello, Server!" });
  };

  return (
    <div>
      <h2>Group Chat</h2>
      <button onClick={sendMessage}>Send Message</button>
    </div>
  );
};

export default EventGetewayIo;
