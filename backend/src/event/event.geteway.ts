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
import { WebRTCService } from './webrtc.service';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = ["http://localhost:3000", "https://nemo-mocha.vercel.app"];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
    credentials: true, 
  },
  perMessageDeflate: true,
})
export class EventGeteWay implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private activeUsers = new Map<string, Set<string>>();
  private clientToUser = new Map<string, string>();

  constructor(
    private readonly authenticationSoket: AuththenticationSoket,
    private readonly webrtcService: WebRTCService,
  ) {}

  async afterInit(server: Server) {
    const redisUrl = process.env.REDIS_URL_UPSTASH;
    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();

    try {
      await Promise.all([pubClient.connect(), subClient.connect()]);
      server.adapter(createAdapter(pubClient, subClient));
      console.log('WebSocket server initialized with Upstash Redis');
      this.webrtcService.setServer(server);
    } catch (error) {
      console.error('Failed to connect to Upstash Redis:', error);
      throw new Error('Redis connection failed');
    }
  }

  async handleConnection(client: Socket) {
    try {
      const user = await this.authenticationSoket.authenticate(client);
      if (!user) {
        throw new WsException('Unauthorized');
      }

      const userId = user._id.toString();

      if (!this.activeUsers.has(userId)) {
        this.activeUsers.set(userId, new Set());
      }

      this.activeUsers.get(userId).add(client.id);
      this.clientToUser.set(client.id, userId);

      client.join(`user:${userId}`);
      console.log(`{ ${userId}: [${Array.from(this.activeUsers.get(userId)).join(', ')}] }`);
    } catch (error) {
      console.error('Error during connection:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.clientToUser.get(client.id);

    if (userId) {
      const userSockets = this.activeUsers.get(userId);
      if (userSockets) {
        userSockets.delete(client.id);
        this.clientToUser.delete(client.id);

        // Log disconnect
        console.log(`disconnect: ${client.id} from ${userId}`);

        if (userSockets.size === 0) {
          this.activeUsers.delete(userId);
          this.server.emit('userDisconnected', { userId });
          console.log(`{ ${userId}: [] }`);
        } else {
          console.log(`{ ${userId}: [${Array.from(userSockets).join(', ')}] }`);
        }
      }
    }
  }

  @SubscribeMessage('startCall')
  handleStartCall(client: Socket, data: { targetUserIds: string[] }) {
    return this.webrtcService.startCall(client, data);
  }

  @SubscribeMessage('rejectCall')
  handleRejectCall(client: Socket, data: { callerId: string }) {
    return this.webrtcService.rejectCall(client, data);
  }

  @SubscribeMessage('endCall')
  handleEndCall(client: Socket) {
    return this.webrtcService.endCall(client);
  }

  @SubscribeMessage('offer')
  handleOffer(client: Socket, data: { targetUserId: string; sdp: any }) {
    return this.webrtcService.handleOffer(client, data);
  }

  @SubscribeMessage('answer')
  handleAnswer(client: Socket, data: { targetUserId: string; sdp: any }) {
    return this.webrtcService.handleAnswer(client, data);
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(client: Socket, data: { targetUserId: string; candidate: any }) {
    return this.webrtcService.handleIceCandidate(client, data);
  }

  getServer(): Server {
    return this.server;
  }
}