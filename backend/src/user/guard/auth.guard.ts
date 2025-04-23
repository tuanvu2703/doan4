import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user.service';
import { TokenExpiredError } from 'jsonwebtoken'; // Import TokenExpiredError

@Injectable()
export class AuthGuardD implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
        const authorizationHeader = request.headers.authorization;
        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            throw new ForbiddenException('Please provide a valid access token');
        }

        const token = authorizationHeader.split(' ')[1];
        if (!token) {
            throw new ForbiddenException('Token missing from authorization header');
        }

        // Xác minh token
        const payload = await this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_SECRET,
        });

        // Tìm người dùng từ cơ sở dữ liệu
        const user = await this.userService.findById(payload.userId);
        //console.log('Authenticated User:', user); // Log thông tin người dùng tìm thấy

        if (!user) {
            throw new BadRequestException('User not found for the token, please try again');
        }

        // Gán người dùng hiện tại vào request
        request.currentUser = user;
        //console.log('User set in request:', request.currentUser); // Log để kiểm tra
    } catch (error) {
        
        if (error instanceof TokenExpiredError) {
            throw new ForbiddenException('Token has expired, please log in again');
        }
        throw new ForbiddenException('Invalid token or expired');
    }

    return true;
    }
}