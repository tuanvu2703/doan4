import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuththenticationSoket } from '../user/guard/authSocket.guard';
import { WsException } from '@nestjs/websockets';
import { EventGeteWay } from './event.geteway';

@Injectable()
export class WebRTCService {
  private server: Server;
  private activeCalls = new Map<string, Set<string>>(); 

  constructor(

    private readonly authenticationSoket: AuththenticationSoket,
  ) {}

  setServer(server: Server) {
    this.server = server;
    this.server.on('userDisconnected', ({ userId }) => this.cleanupUser(userId));
  }

  private getServer(): Server {
    if (!this.server) {
      throw new Error('Server not initialized');
    }
    return this.server;
  }
  async startCall(client: Socket, data: { targetUserIds: string[] }) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    const callerId = user._id.toString();
    const { targetUserIds } = data;

    if (this.activeCalls.has(callerId) && this.activeCalls.get(callerId).size > 0) {
      return client.emit('callUnavailable', { message: 'Bạn đang trong một cuộc gọi khác' });
    }

    if (this.activeCalls.size > 100) { // Giới hạn 100 cuộc gọi đồng thời
      return client.emit('callUnavailable', { message: 'Server quá tải' });
    }

    if (targetUserIds.length > 5) {
      return client.emit('callUnavailable', { message: 'Tối đa 5 người trong nhóm' });
    }

    const server = this.getServer();
    const offlineUsers = targetUserIds.filter(id => !server.sockets.adapter.rooms.has(`user:${id}`));
    if (offlineUsers.length > 0) {
      return client.emit('callUnavailable', { message: `Users offline: ${offlineUsers.join(', ')}` });
    }

    if (!this.activeCalls.has(callerId)) this.activeCalls.set(callerId, new Set());
    targetUserIds.forEach(id => this.activeCalls.get(callerId).add(id));

    client.join('call'); // Join room 'call' khi bắt đầu cuộc gọi
    targetUserIds.forEach(targetUserId => {
      if (!this.activeCalls.has(targetUserId)) this.activeCalls.set(targetUserId, new Set());
      this.activeCalls.get(targetUserId).add(callerId);
      console.log(`📞 ${callerId} gọi ${targetUserId}`);
      server.to(`user:${targetUserId}`).emit('incomingCall', { from: callerId, group: targetUserIds });
    });
  }

  async rejectCall(client: Socket, data: { callerId: string }) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    const userId = user._id.toString();
    console.log(`❌ ${userId} từ chối cuộc gọi từ ${data.callerId}`);

    const server = this.getServer();
    server.to(`user:${data.callerId}`).emit('callRejected', { from: userId });
    this.activeCalls.get(data.callerId)?.delete(userId);
    this.activeCalls.get(userId)?.delete(data.callerId);
  }

  async endCall(client: Socket) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    const userId = user._id.toString();
    console.log(`🚫 ${userId} kết thúc cuộc gọi`);

    const server = this.getServer();
    if (this.activeCalls.has(userId)) {
      const connectedUsers = this.activeCalls.get(userId);
      connectedUsers.forEach(targetUserId => {
        server.to(`user:${targetUserId}`).emit('callEnded', { from: userId });
        this.activeCalls.get(targetUserId)?.delete(userId);
      });
      this.activeCalls.delete(userId);
      client.leave('call'); // Rời room 'call' khi kết thúc
    }
  }

  async handleOffer(client: Socket, { targetUserId, sdp }) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    console.log(`📡 ${user._id} gửi OFFER đến ${targetUserId}`);
    this.getServer().to(`user:${targetUserId}`).emit('offer', { from: user._id, sdp });
  }

  async handleAnswer(client: Socket, { targetUserId, sdp }) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    console.log(`📡 ${user._id} gửi ANSWER đến ${targetUserId}`);
    this.getServer().to(`user:${targetUserId}`).emit('answer', { from: user._id, sdp });
  }

  async handleIceCandidate(client: Socket, { targetUserId, candidate }) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    console.log(`❄️ ICE Candidate từ ${user._id} gửi đến ${targetUserId}`);
    this.getServer().to(`user:${targetUserId}`).emit('ice-candidate', { from: user._id, candidate });
  }

  private cleanupUser(userId: string) {
    if (this.activeCalls.has(userId)) {
      const connectedUsers = this.activeCalls.get(userId);
      connectedUsers.forEach(targetUserId => {
        this.getServer().to(`user:${targetUserId}`).emit('callEnded', { from: userId });
        this.activeCalls.get(targetUserId)?.delete(userId);
      });
      this.activeCalls.delete(userId);
      console.log(`🧹 Cleaned up active calls for user ${userId}`);
    }
  }
}