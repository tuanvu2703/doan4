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
    cors: {
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization"],
    },
  })
  export class CallGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private activeCalls = new Map<string, Set<string>>();
  
    constructor(private readonly authenticationSoket: AuththenticationSoket) {}
  
    afterInit(server: Server) {
      console.log('Call WebSocket server initialized');
    }
  
    async handleConnection(client: Socket) {
      try {
        const user = await this.authenticationSoket.authenticate(client);
        if (!user) {
          throw new WsException('Unauthorized');
        }
  
        const userId = user._id.toString();
        if (!this.activeCalls.has(userId)) {
          this.activeCalls.set(userId, new Set());
        }
        this.activeCalls.get(userId).add(client.id);
        client.join(`call:${userId}`);
  
        console.log(`✅ User ${userId} connected to call: ${client.id}`);
      } catch (error) {
        console.error('❌ Call connection error:', error);
        client.disconnect();
      }
    }
  
    handleDisconnect(client: Socket) {
      const userId = Array.from(this.activeCalls.entries()).find(([_, clientIds]) =>
        clientIds.has(client.id)
      )?.[0];
  
      if (userId) {
        const userSockets = this.activeCalls.get(userId);
        if (userSockets) {
          userSockets.delete(client.id);
          if (userSockets.size === 0) {
            this.activeCalls.delete(userId);
          }
        }
        console.log(`❌ User ${userId} disconnected from call: ${client.id}`);
      }
    }
  
    // 🚀 BẮT ĐẦU CUỘC GỌI
    @SubscribeMessage('startCall')
    async handleStartCall(client: Socket, targetUserId: string) {
      const user = await this.authenticationSoket.authenticate(client);
      if (!user) {
        throw new WsException('Unauthorized');
      }
  
      const callerId = user._id.toString();
      console.log(`📞 User ${callerId} is calling User ${targetUserId}`);
  
      this.server.to(`call:${targetUserId}`).emit('incomingCall', { from: callerId });
    }
  
    // 🚀 TRAO ĐỔI SDP (Session Description Protocol)
    @SubscribeMessage('offer')
    async handleOffer(client: Socket, { targetUserId, sdp }) {
      const user = await this.authenticationSoket.authenticate(client);
      if (!user) {
        throw new WsException('Unauthorized');
      }
  
      console.log(`📡 User ${user._id} gửi OFFER đến ${targetUserId}`);
      this.server.to(`call:${targetUserId}`).emit('offer', { from: user._id, sdp });
    }
  
    @SubscribeMessage('answer')
    async handleAnswer(client: Socket, { targetUserId, sdp }) {
      const user = await this.authenticationSoket.authenticate(client);
      if (!user) {
        throw new WsException('Unauthorized');
      }
  
      console.log(`📡 User ${user._id} gửi ANSWER đến ${targetUserId}`);
      this.server.to(`call:${targetUserId}`).emit('answer', { from: user._id, sdp });
    }
  
    // 🚀 TRAO ĐỔI ICE CANDIDATES
    @SubscribeMessage('ice-candidate')
    async handleIceCandidate(client: Socket, { targetUserId, candidate }) {
      const user = await this.authenticationSoket.authenticate(client);
      if (!user) {
        throw new WsException('Unauthorized');
      }
  
      console.log(`❄️ ICE Candidate từ ${user._id} gửi đến ${targetUserId}`);
      this.server.to(`call:${targetUserId}`).emit('ice-candidate', { from: user._id, candidate });
    }
  }
  