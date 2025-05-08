import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { createClient, RedisClientType } from 'redis'; // Sẽ được mock
import { EventService } from './event.service';
import { UserService } from '../user/user.service';
import { User } from '../user/schemas/user.schemas';
import { Logger } from '@nestjs/common';

// --- Mocking Redis Client ---
// Biến để lưu trữ callback của redisSubClient.subscribe
let redisSubscribeCallback: ((message: string, channel: string) => Promise<void>) | null = null;

const mockRedisClientInstance = {
  connect: jest.fn().mockResolvedValue(undefined),
  quit: jest.fn().mockResolvedValue(undefined),
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue(null),
  del: jest.fn().mockResolvedValue(1),
  mGet: jest.fn().mockResolvedValue([]),
  publish: jest.fn().mockResolvedValue(1),
  subscribe: jest.fn().mockImplementation((channel, callback) => {
    if (channel === 'userStatusUpdate') { // Giả sử kênh này được subscribe
      redisSubscribeCallback = callback;
    }
    return Promise.resolve();
  }),
  unsubscribe: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  isOpen: true, // Giả lập client đang mở
  duplicate: jest.fn(),
  expire: jest.fn().mockResolvedValue(1),
};
// Khi duplicate() được gọi, nó trả về chính mock đó (cho redisSubClient)
mockRedisClientInstance.duplicate.mockReturnValue(mockRedisClientInstance);

jest.mock('redis', () => ({
  createClient: jest.fn(() => mockRedisClientInstance),
  // Thêm các export khác của 'redis' nếu cần mock
}));

// --- Mocking Socket.IO Server ---
const mockSocketInstance = {
  disconnect: jest.fn(),
  join: jest.fn(),
  leave: jest.fn(),
  emit: jest.fn(),
  // Thêm các thuộc tính/phương thức khác của Socket nếu cần
  id: 'mock-socket-id',
};

const mockIoServer = {
  to: jest.fn().mockReturnThis(), // Cho phép chaining: server.to(room).emit(...)
  in: jest.fn().mockReturnThis(),  // Cho phép chaining: server.in(room).fetchSockets()
  emit: jest.fn(),
  fetchSockets: jest.fn().mockResolvedValue([]), // Mặc định không có socket nào trong room
  sockets: {
    sockets: new Map(), // Dùng Map để giả lập collection các sockets
    adapter: {
      rooms: new Map(), // Dùng Map để giả lập collection các rooms
    },
  },
  // Thêm các phương thức khác của Server (Socket.IO) nếu cần
};
// Thiết lập lại mockIoServer.sockets.sockets.get để trả về mockSocketInstance khi cần
// (sẽ làm trong beforeEach hoặc từng test case)


describe('EventService', () => {
  let service: EventService;
  let userService: UserService;
  let userModel: Model<User>;
  let mockServer: Server;

  // Các hằng số dùng trong test
  const USER_ONLINE_KEY_PREFIX = 'user:online:';
  const USER_FRIENDS_KEY_PREFIX = 'user:friends:';
  const USER_STATUS_CHANGE_CHANNEL = 'userStatusUpdate';

  beforeEach(async () => {
    // Reset tất cả các mock trước mỗi test
    jest.clearAllMocks();
    redisSubscribeCallback = null; // Reset callback

    // Tạo mock cho Server một cách "sạch sẽ" hơn mỗi lần
    mockIoServer.to = jest.fn().mockReturnThis();
    mockIoServer.in = jest.fn().mockReturnThis();
    mockIoServer.emit = jest.fn();
    mockIoServer.fetchSockets = jest.fn().mockResolvedValue([]);
    mockIoServer.sockets.sockets = new Map(); // Clear map sockets
    mockIoServer.sockets.adapter.rooms = new Map();


    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: UserService,
          useValue: { // Mock các phương thức của UserService mà EventService sử dụng
            getMyFriendIds: jest.fn().mockResolvedValue([]),
            // Thêm các mock khác nếu EventService dùng nhiều phương thức hơn từ UserService
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: { // Mock Model<User>
            new: jest.fn(),
            constructor: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            // Thêm các mock khác nếu cần
          },
        },
        // Logger có thể được mock nếu bạn muốn kiểm tra output hoặc tắt nó đi
        // { provide: Logger, useValue: { log: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn(), verbose: jest.fn() }}
      ],
    }).compile();

    // Tắt logger thực sự của service để tránh nhiễu console khi chạy test
    // Nếu bạn không inject Logger vào service thì không cần dòng này
    // module.get(Logger).localInstance.setLogLevels([]);


    service = module.get<EventService>(EventService);
    userService = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(getModelToken(User.name));

    // Gán mock server cho service
    // @ts-expect-error : Bỏ qua lỗi type vì chúng ta đang dùng mock object
    mockServer = mockIoServer as Server;
    service.setSocketServer(mockServer);

    // Quan trọng: Vì redisClient và redisSubClient được tạo trong constructor của EventService,
    // chúng ta cần đảm bảo jest.mock('redis') ở trên cùng đã thiết lập mock createClient đúng cách.
    // Và service.redisClient và service.redisSubClient sẽ là mockRedisClientInstance.
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect redis clients and subscribe to status channel', async () => {
      await service.onModuleInit();
      expect(mockRedisClientInstance.connect).toHaveBeenCalledTimes(2); // 1 cho client, 1 cho subClient
      expect(mockRedisClientInstance.subscribe).toHaveBeenCalledWith(
        USER_STATUS_CHANGE_CHANNEL,
        expect.any(Function), // hàm handleUserStatusChange đã được bind
      );
      expect(redisSubscribeCallback).toBeInstanceOf(Function); // Callback đã được gán
    });
  });

  describe('onModuleDestroy', () => {
    it('should quit redis clients and unsubscribe', async () => {
      // Giả lập client đã mở để quit có thể được gọi
      (mockRedisClientInstance as any).isOpen = true;
      await service.onModuleInit(); // Để subscribe trước
      await service.onModuleDestroy();

      expect(mockRedisClientInstance.unsubscribe).toHaveBeenCalledWith(USER_STATUS_CHANGE_CHANNEL);
      expect(mockRedisClientInstance.quit).toHaveBeenCalledTimes(2);
    });
  });

  describe('notifyUserOnline', () => {
    const userId = 'user123';
    const redisKey = `${USER_ONLINE_KEY_PREFIX}${userId}`;

    it('should set user online in Redis and publish if not already online', async () => {
      mockRedisClientInstance.set.mockResolvedValueOnce('OK'); // Giả lập set thành công (NX)

      await service.notifyUserOnline(userId);

      expect(mockRedisClientInstance.set).toHaveBeenCalledWith(redisKey, '1', { EX: 3600, NX: true });
      expect(mockRedisClientInstance.publish).toHaveBeenCalledWith(
        USER_STATUS_CHANGE_CHANNEL,
        JSON.stringify({ event: 'userOnline', userId, timestamp: expect.any(Number) }),
      );
      expect(mockRedisClientInstance.expire).not.toHaveBeenCalled();
    });

    it('should refresh TTL and not publish if user already online', async () => {
      mockRedisClientInstance.set.mockResolvedValueOnce(null); // Giả lập key đã tồn tại (NX thất bại)

      await service.notifyUserOnline(userId);

      expect(mockRedisClientInstance.set).toHaveBeenCalledWith(redisKey, '1', { EX: 3600, NX: true });
      expect(mockRedisClientInstance.expire).toHaveBeenCalledWith(redisKey, 3600);
      expect(mockRedisClientInstance.publish).not.toHaveBeenCalled();
    });
  });

  describe('notifyUserOffline', () => {
    const userId = 'user123';
    const redisKey = `${USER_ONLINE_KEY_PREFIX}${userId}`;

    it('should delete user from Redis and publish if user was online', async () => {
      mockRedisClientInstance.del.mockResolvedValueOnce(1); // Giả lập key đã được xóa

      await service.notifyUserOffline(userId);

      expect(mockRedisClientInstance.del).toHaveBeenCalledWith(redisKey);
      expect(mockRedisClientInstance.publish).toHaveBeenCalledWith(
        USER_STATUS_CHANGE_CHANNEL,
        JSON.stringify({ event: 'userOffline', userId, timestamp: expect.any(Number) }),
      );
    });

    it('should not publish if user was not online in Redis', async () => {
      mockRedisClientInstance.del.mockResolvedValueOnce(0); // Key không tồn tại hoặc không xóa được

      await service.notifyUserOffline(userId);

      expect(mockRedisClientInstance.del).toHaveBeenCalledWith(redisKey);
      expect(mockRedisClientInstance.publish).not.toHaveBeenCalled();
    });
  });

  describe('getOnlineStatus', () => {
    it('should fetch online statuses using mGet', async () => {
      const userIds = ['user1', 'user2', 'user3'];
      const expectedKeys = userIds.map(id => `${USER_ONLINE_KEY_PREFIX}${id}`);
      // Giả sử user1 online, user2 offline (null), user3 online
      mockRedisClientInstance.mGet.mockResolvedValueOnce(['1', null, '1']);

      const statuses = await service.getOnlineStatus(userIds);

      expect(mockRedisClientInstance.mGet).toHaveBeenCalledWith(expectedKeys);
      expect(statuses).toEqual([
        { userId: 'user1', isOnline: true },
        { userId: 'user2', isOnline: false },
        { userId: 'user3', isOnline: true },
      ]);
    });

    it('should return empty array if userIds is empty', async () => {
        const statuses = await service.getOnlineStatus([]);
        expect(mockRedisClientInstance.mGet).not.toHaveBeenCalled();
        expect(statuses).toEqual([]);
    });
  });

  describe('getFriends', () => {
    const userId = 'userWithFriends';
    const userIdObj = new Types.ObjectId(userId); // Giả sử userId là valid ObjectId string
    const cacheKey = `${USER_FRIENDS_KEY_PREFIX}${userId}`;
    const mockFriendsFromDb = ['friend1', 'friend2'];

    it('should return friends from cache if available', async () => {
      mockRedisClientInstance.get.mockResolvedValueOnce(JSON.stringify(mockFriendsFromDb));

      const friends = await service.getFriends(userId);

      expect(mockRedisClientInstance.get).toHaveBeenCalledWith(cacheKey);
      expect(userService.getMyFriendIds).not.toHaveBeenCalled();
      expect(friends).toEqual(mockFriendsFromDb);
    });

    it('should fetch friends from UserService and cache them if not in cache', async () => {
      mockRedisClientInstance.get.mockResolvedValueOnce(null); // Cache miss
      (userService.getMyFriendIds as jest.Mock).mockResolvedValueOnce(mockFriendsFromDb);

      const friends = await service.getFriends(userId);

      expect(mockRedisClientInstance.get).toHaveBeenCalledWith(cacheKey);
      // Mong đợi getMyFriendIds được gọi với ObjectId
      expect(userService.getMyFriendIds).toHaveBeenCalledWith(expect.any(Types.ObjectId));
      expect(mockRedisClientInstance.set).toHaveBeenCalledWith(cacheKey, JSON.stringify(mockFriendsFromDb), { EX: 3600 });
      expect(friends).toEqual(mockFriendsFromDb);
    });

     it('should return empty array and cache it if user has no friends in DB', async () => {
      mockRedisClientInstance.get.mockResolvedValueOnce(null);
      (userService.getMyFriendIds as jest.Mock).mockResolvedValueOnce([]);

      const friends = await service.getFriends(userId);

      expect(userService.getMyFriendIds).toHaveBeenCalled();
      expect(mockRedisClientInstance.set).toHaveBeenCalledWith(cacheKey, JSON.stringify([]), { EX: 3600 });
      expect(friends).toEqual([]);
    });

    it('should return empty array for invalid userId for ObjectId conversion', async () => {
        const invalidUserId = 'invalid-user-id-format';
        const friends = await service.getFriends(invalidUserId);
        expect(friends).toEqual([]);
        expect(userService.getMyFriendIds).not.toHaveBeenCalled(); // Vì lỗi ObjectId trước đó
    });
  });


  describe('handleUserStatusChange (triggered by Redis subscription)', () => {
    const userIdWhoChangedStatus = 'userOnline1';
    const friendsOfUser = ['friendA', 'friendB'];

    beforeEach(async () => {
      // Cần gọi onModuleInit để redisSubscribeCallback được gán
      await service.onModuleInit();
      // Mock getFriends để trả về danh sách bạn bè cụ thể
      jest.spyOn(service, 'getFriends').mockResolvedValue(friendsOfUser);
    });

    it('should notify friends when a user comes online', async () => {
      const message = JSON.stringify({ event: 'userOnline', userId: userIdWhoChangedStatus, timestamp: Date.now() });

      // Đảm bảo callback đã được thiết lập
      expect(redisSubscribeCallback).not.toBeNull();
      if (redisSubscribeCallback) {
        await redisSubscribeCallback(message, USER_STATUS_CHANGE_CHANNEL);
      }

      expect(service.getFriends).toHaveBeenCalledWith(userIdWhoChangedStatus);
      expect(mockServer.to).toHaveBeenCalledTimes(friendsOfUser.length);
      friendsOfUser.forEach(friendId => {
        expect(mockServer.to).toHaveBeenCalledWith(`user:${friendId}`);
        expect(mockServer.emit).toHaveBeenCalledWith('userOnline', { userId: userIdWhoChangedStatus, timestamp: expect.any(Number) });
      });
    });

    it('should notify friends when a user goes offline', async () => {
        const message = JSON.stringify({ event: 'userOffline', userId: userIdWhoChangedStatus, timestamp: Date.now() });

        if (redisSubscribeCallback) {
            await redisSubscribeCallback(message, USER_STATUS_CHANGE_CHANNEL);
        }
        expect(service.getFriends).toHaveBeenCalledWith(userIdWhoChangedStatus);
        friendsOfUser.forEach(friendId => {
            expect(mockServer.to).toHaveBeenCalledWith(`user:${friendId}`);
            expect(mockServer.emit).toHaveBeenCalledWith('userOffline', { userId: userIdWhoChangedStatus, timestamp: expect.any(Number) });
        });
    });

    it('should not emit if user has no friends', async () => {
        (service.getFriends as jest.Mock).mockResolvedValueOnce([]);
        const message = JSON.stringify({ event: 'userOnline', userId: userIdWhoChangedStatus, timestamp: Date.now() });

        if (redisSubscribeCallback) {
            await redisSubscribeCallback(message, USER_STATUS_CHANGE_CHANNEL);
        }
        expect(mockServer.to).not.toHaveBeenCalled();
    });

     it('should not emit if socketServer is not set', async () => {
        (service as any).socketServer = null; // Tạm thời unset để test
        const message = JSON.stringify({ event: 'userOnline', userId: userIdWhoChangedStatus, timestamp: Date.now() });

        if (redisSubscribeCallback) {
            await redisSubscribeCallback(message, USER_STATUS_CHANGE_CHANNEL);
        }
        expect(mockServer.to).not.toHaveBeenCalled(); // Vì socketServer là null
        // Khôi phục lại server cho các test khác
        service.setSocketServer(mockServer);
    });
  });

  describe('Socket Notification/Disconnection Methods', () => {
    it('notificationAllClients should emit to all sockets', () => {
        const data = { message: 'hello all' };
        service.notificationAllClients(data);
        expect(mockServer.emit).toHaveBeenCalledWith('events', data);
    });

    it('notificationToUser should emit to a specific user room', () => {
        const userId = 'targetUser';
        const event = 'newMessage';
        const data = { content: 'hi there' };
        service.notificationToUser(userId, event, data);
        expect(mockServer.to).toHaveBeenCalledWith(`user:${userId}`);
        expect(mockServer.emit).toHaveBeenCalledWith(event, data);
    });

    it('disconnectClientId should disconnect a specific client', async () => {
        const clientId = 'clientToDisconnect';
        const mockClientSocket = { id: clientId, disconnect: jest.fn() };
        // @ts-expect-error: Mocking the internal sockets map for testing purposes
        mockServer.sockets.sockets.set(clientId, mockClientSocket as Socket);

        await service.disconnectClientId(clientId);
        expect(mockClientSocket.disconnect).toHaveBeenCalledWith(true);
    });

     it('disconnectClientId should warn if client not found', async () => {
        const loggerSpy = jest.spyOn(service['logger'], 'warn');
        await service.disconnectClientId('nonExistentClient');
        expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('Client not found'));
    });


    it('disconnectUserId should disconnect all sockets for a user', async () => {
        const userId = 'userToDisconnect';
        const mockSocket1 = { id: 's1', disconnect: jest.fn() };
        const mockSocket2 = { id: 's2', disconnect: jest.fn() };
        // @ts-expect-error: fetchSockets is mocked for testing purposes and may not match the expected type
        mockServer.fetchSockets.mockResolvedValueOnce([mockSocket1 as Socket, mockSocket2 as Socket]);

        await service.disconnectUserId(userId);

        expect(mockServer.in).toHaveBeenCalledWith(`user:${userId}`);
        expect(mockServer.fetchSockets).toHaveBeenCalled();
        expect(mockSocket1.disconnect).toHaveBeenCalledWith(true);
        expect(mockSocket2.disconnect).toHaveBeenCalledWith(true);
    });
  });

});