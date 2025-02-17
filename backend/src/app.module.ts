import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { OtpController } from './otp/otp.controller';
import { OtpModule } from './otp/otp.module';
import { MailModule } from './mail/mail.module';
import { MailController } from './mail/mail.controller';
import { MailService } from './mail/mail.service';
import { OtpService } from './otp/otp.service';
import { SmsModule } from './sms/sms.module';
import { ChatModule } from './chat/chat.module';
import { FriendModule } from './friend/friend.module';
import { EventModule } from './event/event.module';
import { EventService } from './event/event.service';


@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    UserModule,
    PostModule,
    CommentModule,
    CloudinaryModule,
    OtpModule,
    MailModule,
    SmsModule,
    ChatModule,
    FriendModule,
    EventModule,
  ],
  controllers: [AppController, OtpController, MailController],
  providers: [AppService, MailService, OtpService],
})
export class AppModule {}
