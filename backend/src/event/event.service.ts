import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { UserService } from '../user/user.service';
import { Model, Types } from 'mongoose';
import { User } from '../user/schemas/user.schemas';
import { Server } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
// Friend model có thể không cần thiết trực tiếp ở đây nữa nếu getFriends chỉ dựa vào UserService và cache
// import { Friend } from 'src/user/schemas/friend.schema';

const USER_ONLINE_KEY_PREFIX = 'user:online:';
const USER_FRIENDS_KEY_PREFIX = 'user:friends:';
const USER_STATUS_CHANGE_CHANNEL = 'userStatusUpdate'; // Kênh Redis chung cho cập nhật trạng thái

@Injectable()
export class EventService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(EventService.name);
    public redisClient: RedisClientType;
    private redisSubClient: RedisClientType; // Dùng để lắng nghe USER_STATUS_CHANGE_CHANNEL

    private socketServer: Server; // Sẽ được inject từ EventGateway

    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        // @InjectModel(Friend.name) private FriendModel: Model<Friend>, // Xem xét có cần không
        private readonly userService: UserService,
    ) {
        const redisUrl = process.env.REDIS_URL_UPSTASH;
        if (!redisUrl) {
            this.logger.error('❌ REDIS_URL_UPSTASH is not defined!');
            throw new Error('REDIS_URL_UPSTASH is not defined!');
        }
        this.redisClient = createClient({ url: redisUrl });
        this.redisSubClient = this.redisClient.duplicate(); // Dùng duplicate client cho subscriber

        this.redisClient.on('error', (err) => this.logger.error('❌ EventService Redis Client Error', err.stack));
        this.redisSubClient.on('error', (err) => this.logger.error('❌ EventService Redis Subscriber Client Error', err.stack));
    }

    async onModuleInit() {
        try {
            await this.redisClient.connect();
            this.logger.log('🤡 EventService Redis client connected');
            await this.redisSubClient.connect();
            this.logger.log('🤡 EventService Redis subscriber client connected');

            // Lắng nghe kênh chung cho các thay đổi trạng thái user
            await this.redisSubClient.subscribe(USER_STATUS_CHANGE_CHANNEL, this.handleUserStatusChange.bind(this));
            this.logger.log(`🤡 EventService subscribed to Redis channel: ${USER_STATUS_CHANGE_CHANNEL}`);
        } catch (err) {
            this.logger.error('❌ Failed to connect EventService Redis clients or subscribe', err.stack);
        }
    }

    async onModuleDestroy() {
        try {
            if (this.redisSubClient.isOpen) {
                await this.redisSubClient.unsubscribe(USER_STATUS_CHANGE_CHANNEL);
                await this.redisSubClient.quit();
                this.logger.log('🚪 EventService Redis subscriber client disconnected');
            }
            if (this.redisClient.isOpen) {
                await this.redisClient.quit();
                this.logger.log('🚪 EventService Redis client disconnected');
            }
        } catch (error) {
            this.logger.error('❌ Error disconnecting EventService Redis clients', error.stack);
        }
    }

    public setSocketServer(server: Server): void {
        this.socketServer = server;
        this.logger.log('☑️ Socket.IO Server instance set in EventService');
    }

    private async handleUserStatusChange(message: string, channel: string): Promise<void> {
        if (channel === USER_STATUS_CHANGE_CHANNEL) {
            this.logger.log(`Received message on ${channel}: ${message}`);
            try {
                const { userId, event, timestamp } = JSON.parse(message); // event là 'userOnline' hoặc 'userOffline'

                if (!userId || !event) {
                    this.logger.warn('⚠️ Invalid message structure on userStatusUpdate channel');
                    return;
                }

                if (!this.socketServer) {
                    this.logger.warn('⚠️ SocketServer not yet initialized in EventService. Cannot propagate status change.');
                    return;
                }

                const friends = await this.getFriends(userId); // Lấy danh sách bạn bè của user vừa thay đổi trạng thái
                if (friends && friends.length > 0) {
                    friends.forEach(friendId => {
                        // Gửi sự kiện đến room của từng người bạn. Adapter sẽ lo việc phát sóng.
                        // Quan trọng: Đảm bảo client của những người bạn này đã join room `user:${friendId}`
                        // và room của chính user `userId` (ví dụ: `user:${userId}`) để nhận thông báo
                        // từ `event` (ví dụ `userOnline`, `userOffline`)
                        this.socketServer.to(`user:${friendId}`).emit(event, { userId, timestamp });
                        this.logger.log(`📢 Relayed ${event} for ${userId} to friend ${friendId}'s room (user:${friendId})`);
                    });
                } else {
                    this.logger.log(`User ${userId} has no friends to notify about status change, or an error occurred fetching friends.`);
                }
            } catch (error) {
                this.logger.error(`❌ Error processing message from ${channel}: ${message}`, error.stack);
            }
        }
    }

    notificationAllClients(data: any): void {
        if (this.socketServer) {
            this.socketServer.emit('events', data); // Adapter sẽ broadcast
            this.logger.log('📢 Notified all clients via adapter');
        } else {
            this.logger.warn("⚠️ SocketServer not available for notificationAllClients");
        }
    }

    async disconnectClientId(clientId: string): Promise<void> {
        if (!this.socketServer) {
            this.logger.warn(`⚠️ SocketServer not available to disconnect client: ${clientId}`);
            return;
        }
        try {
            // Lấy socket trực tiếp từ server instance
            const socket = this.socketServer.sockets.sockets.get(clientId);
            if (socket) {
                socket.disconnect(true);
                this.logger.log(`🔌 Disconnected client: ${clientId}`);
            } else {
                this.logger.warn(`⚠️ Client not found for disconnection: ${clientId}`);
            }
        } catch (error) {
            this.logger.error(`❌ Error disconnecting client ${clientId}`, error.stack);
        }
    }

    async disconnectUserId(userId: string): Promise<void> {
        if (!this.socketServer) {
            this.logger.warn(`⚠️ SocketServer not available to disconnect user: ${userId}`);
            return;
        }
        try {
            const roomName = `user:${userId}`;
            // fetchSockets() trả về các socket trong room đó trên tất cả các instance (nhờ adapter)
            const sockets = await this.socketServer.in(roomName).fetchSockets();
            sockets.forEach((socket) => socket.disconnect(true));
            this.logger.log(`🔌 Disconnected ${sockets.length} sockets for user: ${userId} from room ${roomName}`);
        } catch (error) {
            this.logger.error(`❌ Error disconnecting user ${userId}`, error.stack);
        }
    }

    notificationToUser(userId: string, event: string, data: any): void {
        if (!this.socketServer) {
            this.logger.warn(`⚠️ SocketServer not available to notify user: ${userId}`);
            return;
        }
        try {
            const roomName = `user:${userId}`;
            this.socketServer.to(roomName).emit(event, data);
            this.logger.log(`📢 Notified user ${userId} in room ${roomName} with event ${event}`);
        } catch (error) {
            this.logger.error(`❌ Error notifying user ${userId}`, error.stack);
        }
    }

    async notifyUserOnline(userId: string): Promise<void> {
        if (!this.redisClient.isOpen) {
            this.logger.error('❌ Redis client is not connected. Cannot notify user online.');
            return;
        }
        try {
            const redisKey = `${USER_ONLINE_KEY_PREFIX}${userId}`;
            // SET key value NX (set only if not exists) EX (expire in seconds)
            this.logger.log(`👉 Attempting to set online key ${redisKey} for ${userId}`);
            const setResult = await this.redisClient.set(redisKey, '1', { EX: 3600, NX: true });

            if (setResult === 'OK') { // User chuyển từ offline sang online
                this.logger.log(`✔️ Set online key ${redisKey} successfully, publishing userOnline for ${userId}`);
                await this.redisClient.publish(
                    USER_STATUS_CHANGE_CHANNEL,
                    JSON.stringify({ event: 'userOnline', userId, timestamp: Date.now() }),
                );
                this.logger.log(`🗿 Published userOnline for ${userId} to ${USER_STATUS_CHANGE_CHANNEL}`);
            } else {
                // User đã online, có thể chỉ cần refresh TTL nếu có cơ chế heartbeat
                await this.redisClient.expire(redisKey, 3600);
                this.logger.log(`User ${userId} already online or recently reconnected, refreshed TTL.`);
            }
        } catch (error) {
            this.logger.error(`❎ Error notifying user online: ${userId}`, error.stack);
        }
    }

    async notifyUserOffline(userId: string): Promise<void> {
        if (!this.redisClient.isOpen) {
            this.logger.error('❎ Redis client is not connected. Cannot notify user offline.');
            return;
        }
        try {
            const redisKey = `${USER_ONLINE_KEY_PREFIX}${userId}`;
            const delResult = await this.redisClient.del(redisKey);

            if (delResult > 0) { // Key đã được xóa (user thực sự offline)
                await this.redisClient.publish(
                    USER_STATUS_CHANGE_CHANNEL,
                    JSON.stringify({ event: 'userOffline', userId, timestamp: Date.now() }),
                );
                this.logger.log(`🗿 Published userOffline for ${userId} to ${USER_STATUS_CHANGE_CHANNEL}`);
            } else {
                this.logger.log(`User ${userId} was not marked as online in Redis or key already deleted.`);
            }
        } catch (error) {
            this.logger.error(`❌ Error notifying user offline: ${userId}`, error.stack);
        }
    }

    // Hàm subscribeToFriends và unsubscribeFromFriends không còn cần thiết nữa.
    // Việc client join/leave room sẽ được EventGateway quản lý, adapter sẽ lo phần Redis.
    // setupRedisSubscriptions cũng không cần, vì đã có handleUserStatusChange.

    async getOnlineStatus(userIds: string[]): Promise<{ userId: string; isOnline: boolean }[]> {
        if (!this.redisClient.isOpen) {
            this.logger.error('❌ Redis client is not connected. Cannot get online status.');
            return userIds.map((userId) => ({ userId, isOnline: false }));
        }
        if (!userIds || userIds.length === 0) return [];
        try {
            const keys = userIds.map(id => `${USER_ONLINE_KEY_PREFIX}${id}`);
            if (keys.length === 0) return [];

            const results = await this.redisClient.mGet(keys);
            return userIds.map((userId, index) => ({
                userId,
                isOnline: !!results[index], // Nếu key tồn tại (value không null) thì là online
            }));
        } catch (error) {
            this.logger.error('❌ Error getting online status using MGET', error.stack);
            return userIds.map((userId) => ({ userId, isOnline: false }));
        }
    }

    async getFriends(userId: string): Promise<string[]> {
        if (!this.redisClient.isOpen && !process.env.BYPASS_REDIS_FOR_FRIENDS) { // Thêm biến môi trường để fallback nếu Redis lỗi nặng
            this.logger.error('❌ Redis client is not connected. Attempting to fetch friends from DB directly.');
            // Fallback to DB if Redis is down, but log heavily
        }

        const cacheKey = `${USER_FRIENDS_KEY_PREFIX}${userId}`;
        try {
            if (this.redisClient.isOpen) {
                const cached = await this.redisClient.get(cacheKey);
                if (cached) {
                    // this.logger.log(`Cached friends for ${userId} retrieved.`);
                    return JSON.parse(cached);
                }
            }
        } catch (redisError) {
            this.logger.error(`❌ Error getting friends from Redis cache for ${userId}`, redisError.stack);
            // Tiếp tục để lấy từ DB
        }

        try {
            let userIdObject: Types.ObjectId;
            try {
                userIdObject = new Types.ObjectId(userId);
            } catch (error) {
                this.logger.error(`Invalid userId ${userId} for ObjectId conversion`, error.stack);
                return [];
            }

            const friendIds: string[] = await this.userService.getMyFriendIds(userIdObject); // Giả sử hàm này trả về string[]
            // this.logger.log(`DB friend IDs fetched for ${userId}: ${friendIds.length}`);

            if (this.redisClient.isOpen) {
                try {
                    await this.redisClient.set(cacheKey, JSON.stringify(friendIds), { EX: 3600 }); // Cache 1 giờ
                } catch (redisSetError) {
                    this.logger.error(`❌ Error setting friends to Redis cache for ${userId}`, redisSetError.stack);
                }
            }
            return friendIds;
        } catch (dbError) {
            this.logger.error(`❌ Error getting friends from DB for ${userId}`, dbError.stack);
            return []; // Trả về mảng rỗng nếu có lỗi
        }
    }
}

// import { Injectable , Logger, forwardRef, Inject} from '@nestjs/common';
// import { EventGeteWay } from './event.geteway';
// import { createClient } from 'redis';
// import { UserService } from 'src/user/user.service';
// import { Model, Types } from 'mongoose';
// import { User } from 'src/user/schemas/user.schemas';
// import { Server } from 'socket.io';
// import { InjectModel } from '@nestjs/mongoose';
// import { Friend } from 'src/user/schemas/friend.schema';


// @Injectable()
//     export class EventService {
//         private readonly logger = new Logger(EventService.name);
//         private redisClient = createClient({ url: process.env.REDIS_URL_UPSTASH });
//         private redisSubClient = createClient({ url: process.env.REDIS_URL_UPSTASH });
        
//         constructor(
//             @InjectModel(User.name) private UserModel : Model<User>,
//             @InjectModel(Friend.name) private FriendModel: Model<Friend>,
//             @Inject(forwardRef(() => EventGeteWay))
//             private readonly socket: EventGeteWay,
//             private readonly userService: UserService,
//         )
        
//         {
//         this.redisClient.connect().catch((err) => {
//             this.logger.error('❌ Failed to connect to Redis (client)', err.stack);
//             });
//             this.redisSubClient.connect().catch((err) => {
//             this.logger.error('❌ Failed to connect to Redis (subscriber)', err.stack);
//             });
//         this.redisClient.connect().catch((err) => {
//             this.logger.error('❌ Failed to connect to Redis', err.stack);
//             });
//         }

//     setRedisClients(pubClient: any, subClient: any) {
//         this.redisClient = pubClient;
//         this.redisSubClient = subClient;
//     }

    
//     async setupRedisSubscriptions(server: Server): Promise<void> {
//         try {
//             this.redisSubClient.on('message', (channel, message) => {
//             this.logger.log(`Received message on channel ${channel}: ${message}`); // Log message từ Redis
//             const match = channel.match(/^user:status:(\w+)$/);
//             if (!match) {
//                 this.logger.log(`No match for channel ${channel}`);
//                 return;
//             }
        
//             const userId = match[1];
//             const data = JSON.parse(message);
//             this.logger.log(`Parsed data for ${userId}: ${JSON.stringify(data)}`);
//             server.to(`user:${userId}`).emit(data.event, { userId });
//             const room = server.sockets.adapter.rooms.get(`user:${userId}`);
//             this.logger.log(`Room user:${userId} has ${room ? room.size : 0} clients`);
//             this.logger.log(`📢 Forwarded ${data.event} for ${userId} to user:${userId}`);
//             });
//             this.logger.log('✅ Setup Redis subscriptions');
//         } catch (error) {
//             this.logger.error('❌ Error setting up Redis subscriptions', error.stack);
//         }
//     }

//     notificationAllClients(data: any): void {
//         this.socket.server.emit('events', data);
//         this.logger.log('📢 Notified all clients');
//     }

//     async disconnectClientId(clientId: string): Promise<void> {
//         try {
//           const socket = this.socket.server.sockets.sockets.get(clientId);
//           if (socket) {
//             socket.disconnect(true);
//             this.logger.log(`🔌 Disconnected client: ${clientId}`);
//           } else {
//             this.logger.warn(`⚠️ Client not found: ${clientId}`);
//           }
//         } catch (error) {
//           this.logger.error(`❌ Error disconnecting client ${clientId}`, error.stack);
//         }
//       }
    
//     async disconnectUserId(userId: string): Promise<void> {
//     try {
//         const sockets = await this.socket.server.in(`user:${userId}`).fetchSockets();
//         sockets.forEach((socket) => socket.disconnect(true));
//         this.logger.log(`🔌 Disconnected ${sockets.length} sockets for user: ${userId}`);
//     } catch (error) {
//         this.logger.error(`❌ Error disconnecting user ${userId}`, error.stack);
//     }
//     }


//     notificationToUser(userId: string, event: string, data: any): void {
//     try {
//         const clients = this.socket.server.sockets.adapter.rooms.get(`user:${userId}`);
//         if (clients && clients.size > 0) {
//         this.socket.server.to(`user:${userId}`).emit(event, data);
//         this.logger.log(`📢 Notified user ${userId} with event ${event}`);
//         } else {
//         this.logger.log(`⚠️ No clients found for user ${userId}`);
//         }
//     } catch (error) {
//         this.logger.error(`❌ Error notifying user ${userId}`, error.stack);
//     }
//     }

//     async notifyUserOffline(userId: string): Promise<void> {
//         try {
//           const redisKey = `user:online:${userId}`;
//           await this.redisClient.del(redisKey);
    
//           // Publish trạng thái offline tới kênh Redis
//           await this.redisClient.publish(
//             `user:status:${userId}`,
//             JSON.stringify({ event: 'userOffline', userId }),
//           );
//           this.logger.log(`🗿 Published userOffline for ${userId}`);
//         } catch (error) {
//           this.logger.error(`❌ Error notifying user offline: ${userId}`, error.stack);
//         }
//     }

//     async subscribeToFriends(userId: string): Promise<void> {
//         try {
//           const friends = await this.getFriends(userId);
//           if (friends.length === 0) {
//             this.logger.log(`No friends to subscribe for user ${userId}`);
//             return;
//           }
      
//           const subscriptionKey = `user:subscriptions:${userId}`;
//           await this.redisClient.set(subscriptionKey, JSON.stringify(friends), { EX: 3600 });
      
//           const listener = (message: string, channel: string) => {
//             this.logger.log(`Listener received on ${channel}: ${message}`);
//           };
//           await Promise.all(
//             friends.slice(0, 100).map((friendId: string) => {
//               this.logger.log(`Subscribing to channel user:status:${friendId}`);
//               return this.redisSubClient.subscribe(`user:status:${friendId}`, listener);
//             }),
//           );
//           this.logger.log(`🗿 Subscribed to ${friends.length} friends for ${userId}`);
//         } catch (error) {
//           this.logger.error(`❌ Error subscribing to friends for ${userId}`, error.stack);
//         }
//       }

      
//     async notifyUserOnline(userId: string): Promise<void> {
//         try {
//         const redisKey = `user:online:${userId}`;
//         const isAlreadyOnline = await this.redisClient.get(redisKey);

//         if (isAlreadyOnline) {
//             this.logger.log(`User ${userId} already online, skipping notification`);
//             return;
//         }

//         await this.redisClient.set(redisKey, '1', { EX: 3600 });

//         // Publish trạng thái online tới kênh Redis
//         await this.redisClient.publish(
//             `user:status:${userId}`,
//             JSON.stringify({ event: 'userOnline', userId }),
//         );
//         this.logger.log(`🗿 Published userOnline for ${userId}`);
//         } catch (error) {
//         this.logger.error(`❌ Error notifying user online: ${userId}`, error.stack);
//         }
//     }

//       async unsubscribeFromFriends(userId: string): Promise<void> {
//         try {
//           const subscriptionKey = `user:subscriptions:${userId}`;
//           const friendsJson = await this.redisClient.get(subscriptionKey);
//           if (!friendsJson) return;
    
//           const friends = JSON.parse(friendsJson);
//           await this.redisClient.del(subscriptionKey);
    
//           // Unsubscribe khỏi kênh trạng thái của bạn bè
//           await Promise.all(
//             friends.map((friendId) =>
//               this.redisSubClient.unsubscribe(`user:status:${friendId}`),
//             ),
//           );
//           this.logger.log(`📢 Unsubscribed from ${friends.length} friends for ${userId}`);
//         } catch (error) {
//           this.logger.error(`❌ Error unsubscribing from friends for ${userId}`, error.stack);
//         }
//       }

//       async getOnlineStatus(userIds: string[]): Promise<{ userId: string; isOnline: boolean }[]> {
//         try {
//           const statusPromises = userIds.map(async (userId) => {
//             const redisKey = `user:online:${userId}`;
//             const isOnline = await this.redisClient.get(redisKey);
//             return { userId, isOnline: !!isOnline };
//           });
//           return Promise.all(statusPromises);
//         } catch (error) {
//           this.logger.error('❌ Error getting online status', error.stack);
//           return userIds.map((userId) => ({ userId, isOnline: false }));
//         }
//       }

//       async getFriends(userId: string): Promise<string[]> {
//         try {
//           const cacheKey = `user:friends:${userId}`;
//           const cached = await this.redisClient.get(cacheKey);
//           if (cached) {
//             const friends = JSON.parse(cached);
//             this.logger.log(`Cached friends for ${userId}: ${JSON.stringify(friends)}`);
//             return friends;
//           }
      
//           let userIdObject: Types.ObjectId;
//           try {
//             userIdObject = new Types.ObjectId(userId);
//           } catch (error) {
//             this.logger.error(`Invalid userId ${userId} for ObjectId conversion`, error.stack);
//             return [];
//           }
      
//           const friendIds = await this.userService.getMyFriendIds(userIdObject);
//           this.logger.log(`DB friend IDs for ${userId}: ${JSON.stringify(friendIds)}`);
//           if (!friendIds || friendIds.length === 0) {
//             this.logger.log(`No friends found for user ${userId}`);
//             return [];
//           }
      
//           await this.redisClient.set(cacheKey, JSON.stringify(friendIds), { EX: 3600 });
//           return friendIds;
//         } catch (error) {
//           this.logger.error(`❌ Error getting friends for ${userId}`, error.stack);
//           return [];
//         }
//       }
    

// }