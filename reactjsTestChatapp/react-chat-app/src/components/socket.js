import { io } from "socket.io-client";

const URL = "http://localhost:3001"; // Địa chỉ WebSocket server của bạn
const socket = io(URL, {
  extraHeaders: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzZhMmNmYTA1NTdlZTcxYWEzZTYwNDciLCJpYXQiOjE3MzUwOTExNzQsImV4cCI6MTczNTE3NzU3NH0.sF69Oi0QH5pk82FKQPwOuH6PYqr6UPn_EoHew-_e0z8`,
  },
});

export { socket };
