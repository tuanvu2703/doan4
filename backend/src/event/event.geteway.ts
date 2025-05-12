// import {
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
import { AuththenticationSoket } from '../user/guard/authSocket.guard'; // Kiểm tra lại đường dẫn
import { WebRTCService } from './webrtc.service';
import { createClient, RedisClientType } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { Logger, Injectable, Inject, forwardRef, OnModuleDestroy } from '@nestjs/common';
import { EventService } from './event.service';

@WebSocketGateway({
    cors: {
        origin: (origin, callback) => {
            const allowedOrigins = ['http://localhost:3000', 'https://nemo-mocha.vercel.app', process.env.CLIENT_URL].filter(Boolean);
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ['GET', 'POST'],
        allowedHeaders: ['Authorization'],
        credentials: true,
    },
    // perMessageDeflate: true, // Cân nhắc kỹ về hiệu năng
})
@Injectable()
export class EventGeteWay implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleDestroy {
    @WebSocketServer() server: Server; // server sẽ được NestJS tự inject

    // Các client này dành riêng cho adapter
    private adapterPubClient: RedisClientType;
    private adapterSubClient: RedisClientType;

    // Map client.id (socketId) với userId cho instance hiện tại
    private clientToUser = new Map<string, string>();
    // Map userId với một Set các socketId của user đó trên instance hiện tại
    // Dùng để theo dõi khi nào user không còn kết nối nào trên instance này
    private userConnectionsOnInstance = new Map<string, Set<string>>();

    private readonly logger = new Logger(EventGeteWay.name);

    constructor(
        private readonly authenticationSoket: AuththenticationSoket,
        private readonly webrtcService: WebRTCService,
        @Inject(forwardRef(() => EventService)) // EventService cần server từ Gateway
        private readonly eventService: EventService,
    ) { }

    async afterInit(server: Server) {
        // this.server = server; // Không cần gán lại, NestJS đã inject @WebSocketServer()
        const redisUrl = process.env.REDIS_URL_UPSTASH;
        if (!redisUrl) {
            this.logger.error('❌ REDIS_URL_UPSTASH is not defined for adapter! WebSocket might not scale.');
            // Quyết định có throw error hay không tùy thuộc vào yêu cầu ứng dụng
            // throw new Error('REDIS_URL_UPSTASH is not defined for adapter!');
            // Nếu không có Redis URL, server sẽ chạy ở chế độ standalone (không scale)
            this.webrtcService.setServer(this.server);
            this.eventService.setSocketServer(this.server); // Vẫn set server cho EventService
            this.logger.warn('⚠️ WebSocket server initialized WITHOUT Redis Adapter due to missing REDIS_URL_UPSTASH.');
            return;
        }

        this.adapterPubClient = createClient({ url: redisUrl });
        this.adapterSubClient = this.adapterPubClient.duplicate();

        this.adapterPubClient.on('error', (err) => this.logger.error('❌ Adapter Redis Pub Client Error', err.stack));
        this.adapterSubClient.on('error', (err) => this.logger.error('❌ Adapter Redis Sub Client Error', err.stack));

        try {
            await Promise.all([this.adapterPubClient.connect(), this.adapterSubClient.connect()]);
            this.server.adapter(createAdapter(this.adapterPubClient, this.adapterSubClient));
            this.logger.log('✅ WebSocket server initialized with Upstash Redis Adapter');
        } catch (error) {
            this.logger.error('❌ Failed to connect adapter Redis clients or set up adapter', error.stack);
            // Nếu lỗi kết nối adapter, server vẫn có thể chạy nhưng không scale được.
            // Cân nhắc có nên throw error để dừng ứng dụng hay không.
        }

        this.webrtcService.setServer(this.server);
        this.eventService.setSocketServer(this.server); // Rất quan trọng!
    }

    async onModuleDestroy() {
        try {
            if (this.adapterSubClient?.isOpen) await this.adapterSubClient.quit();
            if (this.adapterPubClient?.isOpen) await this.adapterPubClient.quit();
            this.logger.log('🚪 Adapter Redis clients disconnected');
        } catch (error) {
            this.logger.error('❌ Error disconnecting Adapter Redis clients', error.stack);
        }
    }

    async handleConnection(client: Socket) {
        this.logger.log(`🔌 Client attempting to connect: ${client.id}`);
        try {
            const user = await this.authenticationSoket.authenticate(client);
            if (!user || !user._id) {
                this.logger.warn(`🚫 Unauthorized connection attempt by ${client.id}. Disconnecting.`);
                client.emit('connectionError', { message: 'Authentication failed' });
                client.disconnect(true);
                return;
            }

            const userId = user._id.toString();
            this.clientToUser.set(client.id, userId);

            if (!this.userConnectionsOnInstance.has(userId)) {
                this.userConnectionsOnInstance.set(userId, new Set());
            }
            const userSocketsOnThisInstance = this.userConnectionsOnInstance.get(userId);
            this.logger.log(`🔌 Client ${client.id} authenticated as User ${userId}.`);

            // Chỉ gọi notifyUserOnline nếu đây là kết nối đầu tiên của user trên instance này
            // và có khả năng user này chưa được đánh dấu online toàn cục.
            // notifyUserOnline trong EventService đã có logic NX (set if not exists) nên khá an toàn.
            if (userSocketsOnThisInstance.size === 0) {
                // Thông báo user online. EventService sẽ lo việc ghi vào Redis và publish sự kiện.
                this.logger.log(`👉 First connection for user ${userId} on this instance, calling notifyUserOnline`);
                await this.eventService.notifyUserOnline(userId);
            }
            userSocketsOnThisInstance.add(client.id);
            // Client join vào room của chính mình
            client.join(`user:${userId}`);
            this.logger.log(`✅ Client ${client.id} (User ${userId}) connected and joined room user:${userId}. Total on instance: ${userSocketsOnThisInstance.size}`);

            // Lấy danh sách bạn bè và cho client join vào room của họ
            // để nhận cập nhật trạng thái (userOnline, userOffline) do EventService phát đi
            const friends = await this.eventService.getFriends(userId);
            friends.forEach((friendId: string) => {
                client.join(`user:${friendId}`); // Join room của bạn để nhận status update
            });
            this.logger.log(`User ${userId} joined rooms for ${friends.length} friends to receive their status updates.`);

            // Gửi trạng thái online hiện tại của bạn bè cho client vừa kết nối
            if (friends.length > 0) {
                const friendStatuses = await this.eventService.getOnlineStatus(friends);
                const onlineFriends = friendStatuses.filter(status => status.isOnline);

                if (onlineFriends.length > 0) {
                     // Gửi một mảng các user đang online thay vì từng event lẻ
                    client.emit('initialFriendStatuses', onlineFriends.map(f => ({ userId: f.userId, isOnline: true, timestamp: Date.now() })));
                    this.logger.log(`Sent initial online status of ${onlineFriends.length} friends to ${userId}`);
                }
                // Bạn cũng có thể gửi trạng thái offline nếu client cần
                // const offlineFriends = friendStatuses.filter(status => !status.isOnline);
                // client.emit('initialOfflineFriendStatuses', offlineFriends.map(f => ({ userId: f.userId, isOnline: false, timestamp: Date.now() })));

            } else {
                this.logger.log(`User ${userId} has no friends to get initial statuses from.`);
            }

        } catch (error) {
            this.logger.error(`❌ Error during connection for client ${client.id}: ${error.message}`, error.stack);
            client.emit('connectionError', { message: 'Error processing connection' });
            client.disconnect(true);
        }
    }

    async handleDisconnect(client: Socket) {
        const userId = this.clientToUser.get(client.id);
        if (!userId) {
            this.logger.log(`⚠️ Client ${client.id} disconnected but was not mapped to a user or already processed.`);
            return;
        }

        this.clientToUser.delete(client.id);
        const userSocketsOnThisInstance = this.userConnectionsOnInstance.get(userId);

        if (userSocketsOnThisInstance) {
            userSocketsOnThisInstance.delete(client.id);
            this.logger.log(`🔌 Client ${client.id} (User ${userId}) disconnected. Sockets remaining on instance for user: ${userSocketsOnThisInstance.size}`);

            if (userSocketsOnThisInstance.size === 0) {
                this.userConnectionsOnInstance.delete(userId); // Xóa user khỏi map của instance này
                this.logger.log(`User ${userId} has no more connections on this instance.`);

                // Quan trọng: Kiểm tra xem user còn kết nối nào trên các instance khác không
                // trước khi đánh dấu là offline hoàn toàn.
                // Adapter giúp `allSockets()` hoạt động cross-instance.
                const roomName = `user:${userId}`;
                let allSocketsForUserCount = 0;
                try {
                    const allSocketsForUser = await this.server.in(roomName).allSockets();
                    allSocketsForUserCount = allSocketsForUser.size;
                } catch (e) {
                    this.logger.error(`Error fetching all sockets for user ${userId} during disconnect: ${e.message}`);
                    // Nếu không kiểm tra được, có thể tạm thời không notify offline để tránh sai sót,
                    // hoặc dựa vào TTL của key 'user:online:' trong Redis.
                    // Trong trường hợp này, chúng ta vẫn sẽ thử notifyUserOffline,
                    // vì Redis key sẽ có TTL.
                }


                if (allSocketsForUserCount === 0) {
                    this.logger.log(`User ${userId} has no connections across any instance. Notifying offline.`);
                    await this.eventService.notifyUserOffline(userId);
                } else {
                    this.logger.log(`User ${userId} still has ${allSocketsForUserCount} connections on other instances. Not marking globally offline yet.`);
                }
            }
        } else {
            this.logger.warn(`⚠️ User ${userId} (socket ${client.id}) not found in userConnectionsOnInstance map during disconnect. Possibly already cleaned up.`);
        }
    }

    // Các hàm WebRTC giữ nguyên
    @SubscribeMessage('startCall')
    handleStartCall(client: Socket, data: { targetUserIds: string[] }) {
        const userId = this.clientToUser.get(client.id);
        if (!userId) throw new WsException('User not authenticated for startCall');
        return this.webrtcService.startCall(client, data,); // Truyền thêm userId nếu cần
    }

    @SubscribeMessage('rejectCall')
    handleRejectCall(client: Socket, data: { callerId: string }) {
        const userId = this.clientToUser.get(client.id);
        if (!userId) throw new WsException('User not authenticated for rejectCall');
        return this.webrtcService.rejectCall(client, data, );
    }

    @SubscribeMessage('endCall')
    handleEndCall(client: Socket) {
        const userId = this.clientToUser.get(client.id);
        if (!userId) throw new WsException('User not authenticated for endCall');
        return this.webrtcService.endCall(client, );
    }

    @SubscribeMessage('offer')
    handleOffer(client: Socket, data: { targetUserId: string; sdp: any }) {
        const userId = this.clientToUser.get(client.id);
        if (!userId) throw new WsException('User not authenticated for offer');
        return this.webrtcService.handleOffer(client, data, );
    }

    @SubscribeMessage('answer')
    handleAnswer(client: Socket, data: { targetUserId: string; sdp: any }) {
        const userId = this.clientToUser.get(client.id);
        if (!userId) throw new WsException('User not authenticated for answer');
        return this.webrtcService.handleAnswer(client, data, );
    }

    @SubscribeMessage('ice-candidate')
    handleIceCandidate(client: Socket, data: { targetUserId: string; candidate: any }) {
        const userId = this.clientToUser.get(client.id);
        if (!userId) throw new WsException('User not authenticated for ice-candidate');
        return this.webrtcService.handleIceCandidate(client, data, );
    }

    getServerInstance(): Server { // Đổi tên hàm để rõ ràng hơn là không phải server của WebRTC
        return this.server;
    }
}

//   WebSocketGateway,


//   SubscribeMessage,
//   WebSocketServer,
//   OnGatewayInit,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   WsException,
// } from '@nestjs/websockets';
// import { Socket, Server } from 'socket.io';
// import { AuththenticationSoket } from '../user/guard/authSocket.guard';
// import { WebRTCService } from './webrtc.service';
// import { createClient } from 'redis';
// import { createAdapter } from '@socket.io/redis-adapter';
// import { Logger, Injectable, Inject, forwardRef } from '@nestjs/common';
// import { EventService } from './event.service';

// @WebSocketGateway({
//   cors: {
//     origin: (origin, callback) => {
//       const allowedOrigins = ['http://localhost:3000', 'https://nemo-mocha.vercel.app'];
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error('Not allowed by CORS'));
//       }
//     },
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['Authorization'],
//     credentials: true,
//   },
//   perMessageDeflate: true,
// })
// @Injectable()
// export class EventGeteWay implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer() server: Server;
//   private activeUsers = new Map<string, Set<string>>();
//   private clientToUser = new Map<string, string>();
//   private readonly logger = new Logger(EventGeteWay.name);

//   constructor(
//     private readonly authenticationSoket: AuththenticationSoket,
//     private readonly webrtcService: WebRTCService,
//     @Inject(forwardRef(() => EventService))
//     private readonly eventService: EventService,
//   ) {}

//   async afterInit(server: Server) {
//     const redisUrl = process.env.REDIS_URL_UPSTASH;
//     const pubClient = createClient({ url: redisUrl });
//     const subClient = pubClient.duplicate();

//     try {
//       await Promise.all([pubClient.connect(), subClient.connect()]);
//       server.adapter(createAdapter(pubClient, subClient));
//       this.logger.log('✅ WebSocket server initialized with Upstash Redis');
//       this.webrtcService.setServer(server);
//       this.eventService.setRedisClients(pubClient, subClient);
//       await this.eventService.setupRedisSubscriptions(server);
//     } catch (error) {
//       this.logger.error('❌ Failed to connect to Upstash Redis', error.stack);
//       throw new Error('Redis connection failed');
//     }
//   }

//   async handleConnection(client: Socket) {
//     try {
//       const user = await this.authenticationSoket.authenticate(client);
//       if (!user) {
//         throw new WsException('Unauthorized');
//       }
  
//       const userId = user._id.toString();
  
//       if (!this.activeUsers.has(userId)) {
//         this.activeUsers.set(userId, new Set());
//       }
  
//       this.activeUsers.get(userId).add(client.id);
//       this.clientToUser.set(client.id, userId);
  
//       client.join(`user:${userId}`);
  
//       const friends = await this.eventService.getFriends(userId);
//       friends.forEach((friendId: string) => {
//         client.join(`user:${friendId}`);
//         this.logger.log(`Client ${client.id} joined room user:${friendId}`);
//       });
  
//       await this.eventService.subscribeToFriends(userId);
//       this.logger.log(`{ ${userId}: [${Array.from(this.activeUsers.get(userId)).join(', ')}] }`);
  
//       // Phát userOnline
//       await this.eventService.notifyUserOnline(userId);
  
//       // Gửi trạng thái online của bạn bè
//       const friendStatuses = await this.eventService.getOnlineStatus(friends);
//       friendStatuses.forEach(status => {
//         if (status.isOnline) {
//           client.emit('userOnline', { userId: status.userId });
//           this.logger.log(`Sent userOnline to ${userId} for friend ${status.userId}`);
//         }
//       });
//     } catch (error) {
//       this.logger.error('❌ Error during connection', error.stack);
//       client.disconnect();
//     }
//   }

//   async handleDisconnect(client: Socket) {
//     const userId = this.clientToUser.get(client.id);
//     if (!userId) return;

//     const userSockets = this.activeUsers.get(userId);
//     if (userSockets) {
//       userSockets.delete(client.id);
//       this.clientToUser.delete(client.id);
//       this.logger.log(`🔌 Disconnect: ${client.id} from ${userId}`);

//       if (userSockets.size === 0) {
//         this.activeUsers.delete(userId);
//         await this.eventService.notifyUserOffline(userId);
//         await this.eventService.unsubscribeFromFriends(userId);
//         this.logger.log(`{ ${userId}: [] }`);
//       } else {
//         this.logger.log(`{ ${userId}: [${Array.from(userSockets).join(', ')}] }`);
//       }
//     }
//   }

//   @SubscribeMessage('startCall')
//   handleStartCall(client: Socket, data: { targetUserIds: string[] }) {
//     return this.webrtcService.startCall(client, data);
//   }

//   @SubscribeMessage('rejectCall')
//   handleRejectCall(client: Socket, data: { callerId: string }) {
//     return this.webrtcService.rejectCall(client, data);
//   }

//   @SubscribeMessage('endCall')
//   handleEndCall(client: Socket) {
//     return this.webrtcService.endCall(client);
//   }

//   @SubscribeMessage('offer')
//   handleOffer(client: Socket, data: { targetUserId: string; sdp: any }) {
//     return this.webrtcService.handleOffer(client, data);
//   }

//   @SubscribeMessage('answer')
//   handleAnswer(client: Socket, data: { targetUserId: string; sdp: any }) {
//     return this.webrtcService.handleAnswer(client, data);
//   }

//   @SubscribeMessage('ice-candidate')
//   handleIceCandidate(client: Socket, data: { targetUserId: string; candidate: any }) {
//     return this.webrtcService.handleIceCandidate(client, data);
//   }

//   getServer(): Server {
//     return this.server;
//   }
// }