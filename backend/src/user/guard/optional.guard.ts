import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization;

    // Nếu không có token, cho phép tiếp tục mà không xác thực
    if (!authorizationHeader) {
      request.currentUser = null; // Gán currentUser là null khi không có token
      return true;
    }

    try {
      // Nếu có token, thực hiện xác thực
      const token = authorizationHeader.split(' ')[1];
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Gán thông tin người dùng đã xác thực vào request
      request.currentUser = payload;
      return true;
    } catch (error) {

      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
