import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { UserModule } from '../user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuththenticationSoket } from '../user/guard/authSocket.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schema/message.schema';
import { GroupMessage, GroupMessageSchema } from './schema/groupMessage.schema';
import { GroupSchema } from './schema/group.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ConsumerModule } from '../kafka/consumer/consumer.module';
import { ProducerModule } from '../kafka/producer/producer.module';


@Module({
  imports: [
    UserModule,
    CloudinaryModule,
    ConsumerModule,
    ProducerModule,
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema}]),
    MongooseModule.forFeature([{ name: 'GroupMessage', schema: GroupMessageSchema }]),
    MongooseModule.forFeature([{ name: 'Group', schema: GroupSchema }]),

  ],
  controllers: [ChatController],
  providers: [ChatService,],
})
export class ChatModule {}  
