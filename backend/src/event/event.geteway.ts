import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Socket, Server, Namespace } from 'socket.io';
import { AuththenticationSoket } from '../user/guard/authSocket.guard';
import { User } from '../user/schemas/user.schemas';
import { CurrentUser } from 'src/user/decorator/currentUser.decorator';
import { Types } from 'mongoose';

@WebSocketGateway({


  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = ["http://localhost:3000",];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
  },
  
})

export class EventGeteWay implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private activeUsers = new Map<string, Set <string>>(); 

  constructor(
    private readonly authenticationSoket: AuththenticationSoket,
  ) {}

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
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
  
      client.join(`user:${userId}`);
  
    } catch (error) {
      console.error('Error during connection:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {

    const userId = Array.from(this.activeUsers.entries()).find(([_, clientIds]) =>
        clientIds.has(client.id)
    )?.[0];

    if (userId) {
        const userSockets = this.activeUsers.get(userId);

        if (userSockets) {

            userSockets.delete(client.id);

            if (userSockets.size === 0) {
                this.activeUsers.delete(userId);
            }
        }

        console.log(`❌ User ${userId} disconnected: ${client.id}`);
    }
}

}