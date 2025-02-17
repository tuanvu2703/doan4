import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Socket } from 'socket.io';
import { User, UserDocument } from '../schemas/user.schemas';
import { UserService } from '../user.service';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class AuththenticationSoket {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @InjectModel(User.name) private readonly usermodel: Model<UserDocument>,
  ) {}

  /**
   * Xác thực người dùng từ kết nối WebSocket.
   * @param client - Đối tượng Socket của WebSocket
   * @returns Thông tin người dùng nếu xác thực thành công
   */
  async authenticate(client: Socket): Promise<UserDocument> {
    try {
      // Lấy token từ headers
      const token = client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new WsException('Missing authentication token');
      }

      // Xác thực token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Tra cứu người dùng từ MongoDB
      const user = await this.userService.findById(payload.userId);

      if (!user) {
        throw new WsException('User not found');
      }

      return user;
    } catch (error) {
     
      throw new WsException('Invalid or expired token');
    }
  }
}
