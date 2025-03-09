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
  private activeCalls = new Map<string, string>();  

  constructor(private readonly authenticationSoket: AuththenticationSoket) {}

  afterInit(server: Server) {
    console.log('✅ WebRTC Gateway initialized');
  }
  //logic
  //1. user connect call và được cho join vào 1 room user(tương tự event)
  //2. user tạo cuộc gọi thì sẽ được join vào room activeCalls(cả nhận và gửi)
  //khi cuộc gọi chấp nhận sẽ được thì 2 cháu đang offer chủ yếu là giao tiếp = spd

  async handleConnection(client: Socket) {
    try {
      const user = await this.authenticationSoket.authenticate(client);
      if (!user) throw new WsException('Unauthorized');

      const userId = user._id.toString();
      this.activeUsers.set(userId, client.id); 
      
      client.join(`user:${userId}`);
      console.log(`✅ User ${userId} connected: ${client.id}`);

      client.emit("userId", { userId });
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
        const targetUserId = this.activeCalls.get(userId);
        this.server.to(`user:${targetUserId}`).emit('callEnded', { from: userId });
        this.activeCalls.delete(userId);
        this.activeCalls.delete(targetUserId);
      }
    }
  }

  @SubscribeMessage('startCall')
  async handleStartCall(client: Socket, data: { targetUserId: string }) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    const callerId = user._id.toString();
    const { targetUserId } = data;

    if (!this.activeUsers.has(targetUserId)) {
      return client.emit('callUnavailable', { message: 'User is offline' });
    }

    this.activeCalls.set(callerId, targetUserId);
    this.activeCalls.set(targetUserId, callerId);

    console.log(`📞 ${callerId} gọi ${targetUserId}`);
    this.server.to(`user:${targetUserId}`).emit('incomingCall', { from: callerId });
  }

  @SubscribeMessage('rejectCall')
  async handleRejectCall(client: Socket, data: { callerId: string }) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    console.log(`❌ ${user._id} từ chối cuộc gọi từ ${data.callerId}`);

    this.server.to(`user:${data.callerId}`).emit('callRejected', { from: user._id });
    this.activeCalls.delete(data.callerId);
    this.activeCalls.delete(user._id.toString());
  }

  @SubscribeMessage('endCall')
  async handleEndCall(client: Socket, data: { targetUserId: string }) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    console.log(`🚫 ${user._id} kết thúc cuộc gọi với ${data.targetUserId}`);

    this.server.to(`user:${data.targetUserId}`).emit('callEnded', { from: user._id });
    this.server.to(`user:${user._id}`).emit('callEnded', { from: data.targetUserId });

    this.activeCalls.delete(user._id.toString());
    this.activeCalls.delete(data.targetUserId);
  }
  //lý thuyêt: thực chất server chỉ tạo connect giữa 2 user, Signaling, RTC nằm ở client, truyền và nhận đữ liệu
  /** 
   * WebRTC Signaling - Offer
   */
  @SubscribeMessage('offer')
  async handleOffer(client: Socket, { targetUserId, sdp }) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    console.log(`📡 ${user._id} gửi OFFER đến ${targetUserId}`);
    this.server.to(`user:${targetUserId}`).emit('offer', { from: user._id, sdp });
  }

  /** 
   * WebRTC Signaling - Answer
   */
  @SubscribeMessage('answer')
  async handleAnswer(client: Socket, { targetUserId, sdp }) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    console.log(`📡 ${user._id} gửi ANSWER đến ${targetUserId}`);
    this.server.to(`user:${targetUserId}`).emit('answer', { from: user._id, sdp });
  }

  /** 
   * WebRTC Signaling - ICE Candidate
   */
  @SubscribeMessage('ice-candidate')
  async handleIceCandidate(client: Socket, { targetUserId, candidate }) {
    const user = await this.authenticationSoket.authenticate(client);
    if (!user) throw new WsException('Unauthorized');

    console.log(`❄️ ICE Candidate từ ${user._id} gửi đến ${targetUserId}`);
    this.server.to(`user:${targetUserId}`).emit('ice-candidate', { from: user._id, candidate });
  }
}
