import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { UserModule } from '../user/user.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuththenticationSoket } from '../user/guard/authSocket.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schema/message.schema';
import { GroupMessage, GroupMessageSchema } from './schema/groupMessage.schema';
import { EventModule } from '../event/event.module';
import { GroupSchema } from './schema/group.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';


@Module({
  imports: [
    UserModule,
    EventModule,
    CloudinaryModule,
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema}]),
    MongooseModule.forFeature([{ name: 'GroupMessage', schema: GroupMessageSchema }]),
    MongooseModule.forFeature([{ name: 'Group', schema: GroupSchema }]),

  ],
  controllers: [ChatController],
  providers: [ChatService, JwtModule, JwtService, AuththenticationSoket],
})
export class ChatModule {}  
