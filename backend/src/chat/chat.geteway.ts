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
import { User } from '../user/schemas/user.schemas';
import { ChatService } from './chat.service';
import { CurrentUser } from 'src/user/decorator/currentUser.decorator';
import { Types } from 'mongoose';
import { SendMessageDto } from './dto/sendMessage.dto';

@WebSocketGateway(3002, { cors: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private activeUsers = new Map<string, string>(); // clientId -> userId

  constructor(
    private readonly authenticationSoket: AuththenticationSoket,
    private readonly chatService : ChatService,
  ) {}

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  async handleConnection(client: Socket) {
    console.log('New connection: ', client.id);

    try {
      // Xác thực người dùng từ header hoặc token
      const user = await this.authenticationSoket.authenticate(client);

      if (!user) {
        throw new WsException('Unauthorized');
      }

      // Lưu thông tin người dùng vào Map activeUsers
      this.activeUsers.set(client.id, user._id.toString());
      console.log(`User ${user.firstName} ${user.lastName} connected with client ID ${client.id}`);
    } catch (error) {
      console.error('Error during connection:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Disconnected client:', client.id);
    this.activeUsers.delete(client.id); // Xóa kết nối người dùng khi ngắt kết nối
  }

  @SubscribeMessage('joinGroup')
  handleJoinGroup(client: Socket, groupId: string) {
    const userId = this.activeUsers.get(client.id);
    if (!userId) {
      throw new WsException('Unauthorized');
    }

    client.join(groupId);
    console.log(`User ${userId} joined group ${groupId}`);
  }

  @SubscribeMessage('leaveGroup')
  handleLeaveGroup(client: Socket, groupId: string) {
    const userId = this.activeUsers.get(client.id);
    if (!userId) {
      throw new WsException('Unauthorized');
    }

    client.leave(groupId);
    console.log(`User ${userId} left group ${groupId}`);
  }

  // @SubscribeMessage('sendMessage')
  // async handleSendMessage(client: Socket, { groupId, content, img, video }: { groupId: string, content: string, img: string, video: string }) {
  //   const userId = this.activeUsers.get(client.id);
  //   if (!userId) {
  //     throw new WsException('Unauthorized');
  //   }

  //   const sendMessageDto: SendMessageDto = {
  //     content,
  //     img,
  //     video
  //   };
  //   const exTypeGroup = new Types.ObjectId(groupId as string);

  //   // Lưu tin nhắn vào cơ sở dữ liệu thông qua ChatService
  //   const message = await this.chatService.sendMessageToGroup(userId, exTypeGroup,sendMessageDto);

  //   // Phát lại tin nhắn đến tất cả những người tham gia nhóm
  //   this.server.to(groupId).emit('receiveMessage', message);
  //   console.log(`User ${userId} sent message to group ${groupId}`);
  // }

  // async notifyNewMessage(groupId: string, message: any) {
  //   this.server.to(groupId).emit('newMessage', message); // Phát thông báo tin nhắn mới
  //   console.log(`New message notification sent to group ${groupId}`);
  // }


}
  // @SubscribeMessage('sendMessage')
  // async handleSendMessage(
  //   client: Socket,
  //   data: { idGroup: string; content: string; img?: string; video?: string },
  //   @CurrentUser() currentUser: User
  // ) {
  //   let updatedGroup: any; 
  
  //   try {
  //     if (!currentUser) {
  //       throw new WsException('Unauthorized');
  //     }
  
  //     const { idGroup, content, img, video } = data;
  
  //     const authorId = new Types.ObjectId(currentUser._id.toString());
  //     console.log('currentUser._id type:', typeof currentUser._id);
  
  //     // Gọi service để lưu tin nhắn vào database
  //     updatedGroup = await this.chatService.sendMessageToGroup(
  //       idGroup,
  //       authorId,
  //       content,
  //       img,
  //       video
  //     );
  
  //     client.emit('messageSent', {
  //       success: true,
  //       groupId: updatedGroup._id,
  //       message: updatedGroup.messages[updatedGroup.messages.length - 1],
  //     });
  
  //     // Phát tin nhắn đến các thành viên trong nhóm
  //     updatedGroup.members.forEach((member) => {
  //       const receiverSocketId = [...this.activeUsers.entries()].find(
  //         ([_, userId]) => userId.toString() === member.toString()
  //       )?.[0];
  
  //       if (receiverSocketId) {
  //         this.server.to(receiverSocketId).emit('newMessage', {
  //           groupId: updatedGroup._id,
  //           message: updatedGroup.messages[updatedGroup.messages.length - 1],
  //         });
  //       }
  //     });
  
  //     console.log('Data received:', data);
  //     console.log('Current User:', currentUser);
  //     console.log('Updated Group:', updatedGroup);
  //     console.log('Active Users:', this.activeUsers);
  
  //   } catch (error) {
  //     console.error('Error:', error);
  //     if (updatedGroup) {
  //       client.emit('messageSent', {
  //         success: true,
  //         groupId: updatedGroup._id,
  //         message: updatedGroup.messages[updatedGroup.messages.length - 1],
  //       });
  //     } else {
  //       client.emit('messageSent', {
  //         success: false,
  //         error: error.message,
  //       });
  //     }
  //   }
  // }
  

