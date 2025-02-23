import {
  Controller, Post, Body, UseGuards, Put,
  HttpException, HttpStatus, Param, Get, Type, Delete,
  UseInterceptors, UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ChatService } from './chat.service';
import { ObjectId, Types } from 'mongoose';
import { AuthGuardD } from 'src/user/guard/auth.guard';
import { CurrentUser } from 'src/user/decorator/currentUser.decorator';
import { User } from 'src/user/schemas/user.schemas';
import { CreateGroupDto } from './dto/createGroup.dto';
import { SendMessageDto } from './dto/sendMessage.dto';
import { EventService } from '../event/event.service';
import { authorize } from 'passport';
import { addMembersToGroupDto } from './dto/addMemberGroup.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly eventService: EventService
  ) { }

  @Post('creategroup')
  @UseGuards(AuthGuardD)
  async createGroupChat(
    @CurrentUser() currentUser: User,
    @Body() createGroupDto: CreateGroupDto,
  ) {
    if (!currentUser) {
      throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
    }
    const owner = new Types.ObjectId(currentUser._id.toString());
    return this.chatService.createGroup(createGroupDto, owner);
  }

  @Post('sendmessagetoGroup/:groupId')
  @UseGuards(AuthGuardD)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]))
  async sendMessageToGroup(
    @CurrentUser() currentUser: User,
    @Param('groupId') groupId: Types.ObjectId,
    @Body() sendMessageDto: SendMessageDto,
    @UploadedFiles() files: { files: Express.Multer.File[] },
  ) {
    if (!currentUser) {
      throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
    }
    const currentUserID = new Types.ObjectId(currentUser._id as string);

    const message = await this.chatService.sendMessageToGroup(sendMessageDto, currentUserID, groupId, files?.files);

    const messageSee = {
      ...sendMessageDto,
      mediaURL: message.mediaURL,
      _id: message._id,
      forGroup: groupId,
      sender: {
        _id: currentUser._id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        avatar: currentUser.avatar
      },

    };

    const groupParticipants = await this.chatService.getMemberGroup(groupId);

    if (!Array.isArray(groupParticipants)) {
      throw new HttpException('Invalid group participants data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  
    groupParticipants.forEach((participant) => {

      this.eventService.notificationToUser(participant._id.toString(), 'newmessagetogroup', messageSee);

    });

    return message;
  }


  @Get('getmessagegroup/:groupId')
  @UseGuards(AuthGuardD)
  async getMessageGroup(
    @Param('groupId') groupId: string, //dữ liệu đầu vào là string
    @CurrentUser() currentUSer: User,

  ) {
    if(!CurrentUser){
      throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
    }
    const swagerGroupId = new Types.ObjectId(groupId.toString()); // đổi obj
    const swageUserId = new Types.ObjectId(currentUSer._id.toString());
    const messages = await this.chatService.getGroupMessages(swagerGroupId,swageUserId);
    return messages;
  }

  @Get('MembersGroup/:idgr')
  @UseGuards(AuthGuardD)
  async getMembersGroup(
    @CurrentUser() currentUser: User,
    @Param('idgr') idgr: Types.ObjectId,
  ) {
    return await this.chatService.getMemberGroup(idgr);

  }

  @Get('getMylistChat')
  @UseGuards(AuthGuardD)
  async getListMessage(
    @CurrentUser() currentUser: User,
  ) {
    const currentUserOBJ = new Types.ObjectId(currentUser._id.toString());
    return await this.chatService.getMylistChat(currentUserOBJ);
  }

  @Put('removeMemBerInGroup/:groupId')
  @UseGuards(AuthGuardD)
  async removeMemberInGroup(
    @CurrentUser() currentUser: User,
    @Param('groupId') groupId: Types.ObjectId,
    @Body('userId') userId: Types.ObjectId,
  ) {
    const swageUserId = new Types.ObjectId(currentUser._id.toString());
    return await this.chatService.removeMemberInGroup(groupId, swageUserId, userId);
  }

  @Post('sendmessageToUser/:userId')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]))
  @UseGuards(AuthGuardD)

  async sendMessageToUser(
    @CurrentUser() currentUser: User,
    @Param('userId') userId: Types.ObjectId,
    @Body() sendMessageDto: SendMessageDto,
    @UploadedFiles() files: { files: Express.Multer.File[] },
  ) {

    try {
      // const checkTypeReceiver = userId;
      // if (Types.ObjectId.isValid(userId)) {

      // } else {

      // }

      const currentUserOBJ = new Types.ObjectId(currentUser._id.toString());
      const UserOBJ = new Types.ObjectId(userId.toString());
      const message = await this.chatService.sendMesageToUser(currentUserOBJ, UserOBJ, sendMessageDto, files?.files);

      const currentAuthor = {
        _id: currentUser._id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        avatar: currentUser.avatar,
      };

      const notificationUsers = [
        { user: userId.toString(), author: currentUser._id.toString() },
        { user: currentUser._id.toString(), author: currentUser._id.toString() },
      ];

      const messageSee = {
        ...sendMessageDto,
        mediaURL: message.mediaURL,
        author: currentAuthor,
        _id: message._id,
        sender: {
          _id: currentUser._id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          avatar: currentUser.avatar
        },
      };

      notificationUsers.map(async (notif) => {
        this.eventService.notificationToUser(notif.user, 'newmessage', messageSee);
      });

      return message;
    }
    catch (error) {
      console.error('Error uploading images to Cloudinary:', error);
      throw new HttpException('Failed to upload images', HttpStatus.INTERNAL_SERVER_ERROR);

    }

  }

  @Get('getmessagestouser/:userId')
  @UseGuards(AuthGuardD)
  async getMessageUser(
    @CurrentUser() currentUser: User,
    @Param('userId') userId: Types.ObjectId,
  ) {
    const currentUserOBJ = new Types.ObjectId(currentUser._id.toString());
    const userIdOBJ = new Types.ObjectId(userId.toString());
    return await this.chatService.getMessagesToUser(currentUserOBJ, userIdOBJ);
  }

  @Put('revokedMesage/:messageId')
  @UseGuards(AuthGuardD)
  async revokeAMessage(
    @CurrentUser() currentUser: User,
    @Param('messageId') messageId: Types.ObjectId,
  ) {
    const messageOBJ = new Types.ObjectId(messageId.toString());
    const currentUserOBJ = new Types.ObjectId(currentUser._id.toString());
    return await this.chatService.revokeAMessage(messageOBJ, currentUserOBJ);
  }

  @Put('addMembersTogroup/:groupId')
  @UseGuards(AuthGuardD)
  async addMembersToGroup(
    @CurrentUser() currentUser: User,
    @Param('groupId') groupId: Types.ObjectId,
    @Body() addMembersToGroupDto: addMembersToGroupDto, // Lấy toàn bộ DTO
  ) {
    try {
      if (!currentUser) {
        throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
      }
  
      if (!addMembersToGroupDto || !Array.isArray(addMembersToGroupDto.participants)) {
        throw new HttpException('Invalid participants data', HttpStatus.BAD_REQUEST);
      }
  
      return await this.chatService.addMembersToGroup(addMembersToGroupDto, groupId);
    } catch (error) {
      console.error('error in chatcontroller /addMembersTogroup', error);
      throw error;
    }
  }

  
  @Delete('deleteGroup/:groupId')
  @UseGuards(AuthGuardD)
  async deleteGroup(
    @CurrentUser() currentUser: User,
    @Param('groupId') groupId: Types.ObjectId,
  ) {
    try {
      if (!currentUser) {
        throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
      }
      const swageUserId = new Types.ObjectId(currentUser._id.toString());
      return await this.chatService.deleteGroup(groupId,swageUserId);
    } catch (error) {
      console.error('error in chatcontroller /deleteGroup', error);
      throw error;
    }
  }



}