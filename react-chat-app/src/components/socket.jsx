import { io } from "socket.io-client";


const token = localStorage.getItem("token"); 


if (!token) {
  console.error("No token found in localStorage");
}

const URL = "http://localhost:3001"; 

const socket = io(URL, {
  extraHeaders: {
    Authorization: `Bearer ${token}`, 
  },
});

// socket.on("connect", () => {
//   console.log("Connected to WebSocket server with ID in socket.jsx:", socket.id);
// });

// socket.on("disconnect", () => {
//   console.log("Disconnected from WebSocket server");
// });

export default socket;
