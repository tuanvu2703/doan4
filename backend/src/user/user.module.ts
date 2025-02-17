import { Global, Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schemas';
import { FriendRequest, FriendRequestSchema } from './schemas/friendRequest.schema';
import { OtpModule } from '../otp/otp.module';
import { OtpService } from 'src/otp/otp.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FriendSchema } from './schemas/friend.schema';
import { EventModule } from '../event/event.module';
import { EventService } from '../event/event.service';

@Global()
@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get<string | number>('JWT_EXPIRES'),
          },
        };
      },
    }),
    OtpModule,

    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'FriendRequest', schema:FriendRequestSchema}]),
    MongooseModule.forFeature([{ name: 'Friend', schema:FriendSchema}]),

  ],
  controllers: [UserController],
  providers: [UserService, OtpService, CloudinaryService, EventService],
  exports:[UserService,JwtModule,UserModule, MongooseModule]
})
export class UserModule {}
