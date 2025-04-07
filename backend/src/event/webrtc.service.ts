import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuththenticationSoket } from '../user/guard/authSocket.guard';
import { WsException } from '@nestjs/websockets';

interface CallGroup {
  roomId: string;
  users: Set<string>;
}

@Injectable()
export class WebRTCService {
  private server: Server;
  private activeCalls = new Map<string, CallGroup>(); 

  constructor(private readonly authenticationSoket: AuththenticationSoket) {}

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

    if (this.activeCalls.has(callerId)) {
      return client.emit('callUnavailable', { message: 'Bạn đang trong một cuộc gọi khác' });
    }

    if (this.activeCalls.size > 100) {
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

    const roomId = Math.random().toString(36).substr(2, 8);
    const callUsers = new Set([callerId, ...targetUserIds]);

    const callGroup: CallGroup = { roomId, users: callUsers };
    callUsers.forEach(id => this.activeCalls.set(id, callGroup));

    client.join(roomId);
    targetUserIds.forEach(targetUserId => {
      server.to(`user:${targetUserId}`).emit('incomingCall', { from: callerId, roomId, group: Array.from(callUsers) });
    });

    console.log(`📞 Cuộc gọi nhóm ${roomId} giữa ${Array.from(callUsers).join(', ')}`);
    this.logActiveCalls();
  }

  async rejectCall(client: Socket, data: { callerId: string }) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    const userId = user._id.toString();
    console.log(`❌ ${userId} từ chối cuộc gọi từ ${data.callerId}`);

    const server = this.getServer();
    server.to(`user:${data.callerId}`).emit('callRejected', { from: userId });

    this.activeCalls.delete(userId);
  }

  async endCall(client: Socket) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    const userId = user._id.toString();
    if (!this.activeCalls.has(userId)) return;

    const callGroup = this.activeCalls.get(userId);
    const server = this.getServer();

    callGroup.users.forEach(targetUserId => {
      server.to(`user:${targetUserId}`).emit('callEnded', { from: userId });
      this.activeCalls.delete(targetUserId);
    });

    console.log(`🚫 Cuộc gọi nhóm ${callGroup.roomId} kết thúc`);
    this.logActiveCalls();
  }

  async handleOffer(client: Socket, { targetUserId, sdp }) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    this.getServer().to(`user:${targetUserId}`).emit('offer', { from: user._id, sdp });
  }

  async handleAnswer(client: Socket, { targetUserId, sdp }) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    this.getServer().to(`user:${targetUserId}`).emit('answer', { from: user._id, sdp });
  }

  async handleIceCandidate(client: Socket, { targetUserId, candidate }) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    this.getServer().to(`user:${targetUserId}`).emit('ice-candidate', { from: user._id, candidate });
  }

  private cleanupUser(userId: string) {
    if (!this.activeCalls.has(userId)) return;

    const callGroup = this.activeCalls.get(userId);
    const server = this.getServer();

    callGroup.users.forEach(targetUserId => {
      server.to(`user:${targetUserId}`).emit('callEnded', { from: userId });
      this.activeCalls.delete(targetUserId);
    });

    console.log(`🧹 Cleaned up active calls for user ${userId}`);
    this.logActiveCalls();
  }

  private logActiveCalls() {
    console.log('📞 Danh sách các cuộc gọi đang diễn ra:');
    const loggedRooms = new Set();
    this.activeCalls.forEach(call => {
      if (!loggedRooms.has(call.roomId)) {
        loggedRooms.add(call.roomId);
        console.log(`Room: ${call.roomId} [${Array.from(call.users).join(', ')}]`);
      }
    });
  }
}
