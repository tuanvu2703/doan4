import { io } from 'socket.io-client';
import apiuri from '../service/apiuri';
const URL = apiuri.Socketuri()
// Kết nối đến WebSocket server
const socket = io(URL, {
  extraHeaders: {
    Authorization: `Bearer ${authToken.getToken()}`,
  },
});

// Lắng nghe sự kiện kết nối thành công
socket.on('connect', () => {
  console.log('Connected to WebSocket server with ID:', socket.id);

  // Gửi một sự kiện test đến server
  socket.emit('testEvent', { message: 'Hello from client' });
});

// Lắng nghe sự kiện từ server
socket.on('events', (data) => {
  console.log('Received event from server:', data);
});

// Gửi thông báo đến một user cụ thể (test notificationToUser)
function notifyUser(userId) {
  socket.emit('notifyUser', { userId, message: 'Hello specific user!' });
}

// Gửi thông báo đến tất cả clients (test notificationAllClients)
function notifyAllClients() {
  socket.emit('notifyAll', { message: 'Hello everyone!' });
}

// Ngắt kết nối client (test disconnectClientId)
function disconnectClient() {
  socket.disconnect();
  console.log('Disconnected from server.');
}

// Xử lý sự kiện ngắt kết nối
socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});

// Gọi thử các hàm
notifyAllClients();
notifyUser('user123'); // Thay 'user123' bằng ID user cụ thể để test
disconnectClient();
