import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule,  } from '@nestjs/mongoose';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { OtpController } from './otp/otp.controller';
import { OtpModule } from './otp/otp.module';
import { MailModule } from './mail/mail.module';
import { MailController } from './mail/mail.controller';
import { MailService } from './mail/mail.service';
import { OtpService } from './otp/otp.service';
import { ChatModule } from './chat/chat.module';
import { FriendModule } from './friend/friend.module';
import { EventModule } from './event/event.module';
import { EventService } from './event/event.service';
import { ConsumerModule } from './kafka/consumer/consumer.module';
import { ProducerModule } from './kafka/producer/producer.module';
import { ScylladbModule } from './scylladb/scylladb.module';
import { NotificationModule } from './kafka/notification/notification.module';
import { PublicGroupService } from './public-group/public-group.service';
import { PublicGroupController } from './public-group/public-group.controller';
import { PublicGroupModule } from './public-group/public-group.module';



@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    MongooseModule.forRoot(process.env.MONGODB_URI_SINK, { connectionName: 'sinkDB' }),


    UserModule,
    PostModule,
    CommentModule,
    CloudinaryModule,
    OtpModule,
    MailModule,
    ChatModule,
    FriendModule,
    EventModule,
    ConsumerModule,
    ProducerModule,
    // ScylladbModule,
    NotificationModule,
    PublicGroupModule,
  ],
  controllers: [AppController, OtpController, MailController, PublicGroupController],
  providers: [AppService, MailService, OtpService, PublicGroupService],
})
export class AppModule {}
