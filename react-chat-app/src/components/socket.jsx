import { io } from "socket.io-client";

// Lấy token từ localStorage
const token = localStorage.getItem("token"); 

// Kiểm tra xem token có tồn tại hay không
if (!token) {
  console.error("No token found in localStorage");
}

const URL = "https://social-network-jbtx.onrender.com"; // Địa chỉ WebSocket server của bạn

// Kết nối WebSocket với token từ localStorage
const socket = io(URL, {
  extraHeaders: {
    Authorization: `Bearer ${token}`, // Dùng token từ localStorage
  },
});

socket.on("connect", () => {
  console.log("Connected to WebSocket server with ID:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected from WebSocket server");
});

export default socket;
