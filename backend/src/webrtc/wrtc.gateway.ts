import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AuththenticationSoket } from '../user/guard/authSocket.guard';

@WebSocketGateway({
  namespace: '/call',
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
  },
})
export class CallGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private activeUsers = new Map<string, string>(); 
  private activeCalls = new Map<string, Set<string>>(); 

  constructor(private readonly authenticationSoket: AuththenticationSoket) {}

  afterInit(server: Server) {
    console.log('✅ WebRTC Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const user = await this.authenticationSoket.authenticate(client);
      if (!user) throw new WsException('Unauthorized');

      const userId = user._id.toString();
      this.activeUsers.set(userId, client.id);

      client.join(`user:${userId}`);
      console.log(`✅ User ${userId} connected: ${client.id}`);

      client.emit('userId', { userId });
    } catch (error) {
      console.error('Error during connection:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.activeUsers.entries()].find(([_, socketId]) => socketId === client.id)?.[0];
    if (userId) {
      this.activeUsers.delete(userId);
      console.log(`❌ User ${userId} disconnected: ${client.id}`);

      if (this.activeCalls.has(userId)) {
        const connectedUsers = this.activeCalls.get(userId);
        connectedUsers.forEach(targetUserId => {
          this.server.to(`user:${targetUserId}`).emit('callEnded', { from: userId });
          this.activeCalls.get(targetUserId)?.delete(userId);
        });
        this.activeCalls.delete(userId);
      }
    }
  }

  @SubscribeMessage('startCall')
  async handleStartCall(client: Socket, data: { targetUserIds: string[] }) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    const callerId = user._id.toString();
    const { targetUserIds } = data;

    if (this.activeCalls.has(callerId) && this.activeCalls.get(callerId).size > 0) {
      return client.emit('callUnavailable', { message: 'Bạn đang trong một cuộc gọi khác' });
    }

    if (targetUserIds.length > 5) {
      return client.emit('callUnavailable', { message: 'Tối đa 5 người trong nhóm' });
    }

    const offlineUsers = targetUserIds.filter(id => !this.activeUsers.has(id));
    if (offlineUsers.length > 0) {
      return client.emit('callUnavailable', { message: `Users offline: ${offlineUsers.join(', ')}` });
    }

    if (!this.activeCalls.has(callerId)) this.activeCalls.set(callerId, new Set());
    targetUserIds.forEach(id => this.activeCalls.get(callerId).add(id));

    targetUserIds.forEach(targetUserId => {
      if (!this.activeCalls.has(targetUserId)) this.activeCalls.set(targetUserId, new Set());
      this.activeCalls.get(targetUserId).add(callerId);
      console.log(`📞 ${callerId} gọi ${targetUserId}`);
      this.server.to(`user:${targetUserId}`).emit('incomingCall', { from: callerId, group: targetUserIds });
    });
  }

  @SubscribeMessage('rejectCall')
  async handleRejectCall(client: Socket, data: { callerId: string }) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    const userId = user._id.toString();
    console.log(`❌ ${userId} từ chối cuộc gọi từ ${data.callerId}`);

    this.server.to(`user:${data.callerId}`).emit('callRejected', { from: userId });
    this.activeCalls.get(data.callerId)?.delete(userId);
    this.activeCalls.get(userId)?.delete(data.callerId);
  }

  @SubscribeMessage('endCall')
  async handleEndCall(client: Socket) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    const userId = user._id.toString();
    console.log(`🚫 ${userId} kết thúc cuộc gọi`);

    if (this.activeCalls.has(userId)) {
      const connectedUsers = this.activeCalls.get(userId);
      connectedUsers.forEach(targetUserId => {
        this.server.to(`user:${targetUserId}`).emit('callEnded', { from: userId });
        this.activeCalls.get(targetUserId)?.delete(userId);
      });
      this.activeCalls.delete(userId);
    }
  }

  @SubscribeMessage('offer')
  async handleOffer(client: Socket, { targetUserId, sdp }) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    console.log(`📡 ${user._id} gửi OFFER đến ${targetUserId}`);
    this.server.to(`user:${targetUserId}`).emit('offer', { from: user._id, sdp });
  }

  @SubscribeMessage('answer')
  async handleAnswer(client: Socket, { targetUserId, sdp }) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    console.log(`📡 ${user._id} gửi ANSWER đến ${targetUserId}`);
    this.server.to(`user:${targetUserId}`).emit('answer', { from: user._id, sdp });
  }

  @SubscribeMessage('ice-candidate')
  async handleIceCandidate(client: Socket, { targetUserId, candidate }) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    console.log(`❄️ ICE Candidate từ ${user._id} gửi đến ${targetUserId}`);
    this.server.to(`user:${targetUserId}`).emit('ice-candidate', { from: user._id, candidate });
  }
}