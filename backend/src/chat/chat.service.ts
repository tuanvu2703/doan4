import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './schema/message.schema';
import { GroupMessage } from './schema/groupMessage.schema';
import { User } from '../user/schemas/user.schemas';
import { CreateGroupDto } from './dto/createGroup.dto';
import { SendMessageDto } from './dto/sendMessage.dto';
import { content } from 'googleapis/build/src/apis/content';
import { Group } from './schema/group.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { RoomChat } from './schema/roomChat.schema';
import { addMembersToGroupDto } from './dto/addMemberGroup.dto';
import { Exception } from 'handlebars';
import { Type } from 'class-transformer';
import { GroupWithLastMessage } from './interFace/lastmessage.interface';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Message.name) private readonly MessageModel: Model<Message>,
        @InjectModel(GroupMessage.name) private readonly GroupMessageModel: Model<GroupMessage>,
        @InjectModel(Group.name) private readonly GroupModel: Model<Group>,
        @InjectModel(User.name) private readonly UserModel: Model<User>,
        @InjectModel(RoomChat.name) private readonly RoomChatModel: Model<RoomChat>,
        private readonly cloudinaryService : CloudinaryService,
    ){}


    async createGroup(createGroupDto: CreateGroupDto, userId: Types.ObjectId){
        const { name, avatarGroup, participants } = createGroupDto;
        const participantIds = participants.map(participant =>
          new Types.ObjectId(participant)
      );
        const group = new this.GroupModel({
          name,
          avatarGroup,
          owner: userId,
          participants: [...participantIds, userId],
        });
    
        return await group.save();
    }


    async sendMessageToGroup(
      sendMessageDto: SendMessageDto, 
      userId: Types.ObjectId, 
      groupId: Types.ObjectId, 
      files?: Express.Multer.File[]
    ): Promise<GroupMessage> {
      const { content, mediaURL } = sendMessageDto;
    

      const groupMessage = new this.GroupMessageModel({
        group: groupId,
        sender: userId,

        content,
        reading: [],
      });
    

      if (files && files.length > 0) {
        try {
          
          const uploadedMedia = await Promise.all(files.map(file => this.cloudinaryService.uploadFile(file)));
          
          groupMessage.mediaURL = uploadedMedia;
          
         
        } catch (error) {
          console.error('Error uploading images to Cloudinary:', error);
          throw new HttpException('Failed to upload images', HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }
      return await groupMessage.save();
    }
    

    async getGroupMessages(groupId: Types.ObjectId): Promise<{ group: any; messages: GroupMessage[] }> {
     
      const group = await this.GroupModel.findById(groupId)
        .populate({ 
          path: 'owner', 
          select: 'firstName lastName avatar' 
        })
        .populate({ 
          path: 'participants', 
          select: 'firstName lastName avatar'
        })
        .exec();
    
      if (!group) {
        throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
      }

      const messages = await this.GroupMessageModel.find({ group: groupId })
        .populate({ 
          path: 'sender', 
          select: 'firstName lastName avatar' 
        })
        .exec();
    
      if (!messages.length) { 
        throw new HttpException('Group has no messages', HttpStatus.NOT_FOUND);
      }

      return { group, messages };
    }

    async getMemberGroup(groupId: Types.ObjectId): Promise<User[]> {
      try {
        const swagerGroupId = new Types.ObjectId(groupId);
        const group = await this.GroupModel.findById(swagerGroupId)
          .populate({
            path: 'participants',
             model: 'User',
            select: '_id firstName lastName avatar', // chọn các trường muốn hiển thị
          })
          .exec();
    
        if (!group) {
          throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
        }
  
        return group.participants;
      } catch (error) {
        console.error('Error fetching group members:', error);
        throw new HttpException('Failed to fetch group members', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    
    async getMylistChat(
      userId: string | Types.ObjectId,
    ): Promise<{ Group: any[]; Participants: any[] }> {
      const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    
      // Lấy danh sách userId mà user đã nhắn tin
      const distinctUserIds = await this.MessageModel.distinct('sender', {
        $or: [{ sender: userObjectId }, { receiver: userObjectId }],
      }).then((ids) => ids.map((id) => id.toString()));
    
      // Hàm chuẩn hóa ObjectId
      const normalizeIds = (ids: (string | Types.ObjectId)[]) =>
        ids.map((id) => (typeof id === 'string' && Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id));
    
      const participants = await this.UserModel.find({
        _id: { $in: normalizeIds(distinctUserIds), $ne: userObjectId },
      }).select('firstName lastName avatar');
    
      // Lấy nhóm mà user tham gia
      const groups = await this.GroupModel.find({
        participants: { $in: [userObjectId] },
      })
        .select('name avatarGroup')
        .lean();
    
      // Lấy tin nhắn mới nhất giữa user và mỗi participant
      const latestMessages = await this.MessageModel.aggregate([
        {
          $match: {
            $or: [
              { sender: userObjectId },
              { receiver: userObjectId },
            ],
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ['$sender', userObjectId] },
                '$receiver',
                '$sender',
              ],
            },
            messageId: { $first: '$_id' },
            content: { $first: '$content' },
            mediaURL: { $first: '$mediaURL' },
            createdAt: { $first: '$createdAt' },
            sender: { $first: '$sender' },
            receiver: { $first: '$receiver' },
          },
        },
      ]);
    
      // Lấy tin nhắn mới nhất trong từng group
      const latestGroupMessages = await this.GroupMessageModel.aggregate([
        {
          $match: {
            group: { $in: groups.map((g) => g._id) },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $group: {
            _id: '$group',
            messageId: { $first: '$_id' },
            content: { $first: '$content' },
            mediaURL: { $first: '$mediaURL' },
            createdAt: { $first: '$createdAt' },
            sender: { $first: '$sender' },
          },
        },
      ]);
    
      // Gắn tin nhắn mới nhất vào danh sách participants
      const participantData = participants.map((participant) => {
        const latestMessage = latestMessages.find(
          (msg) => msg._id.toString() === participant._id.toString(),
        );
        return {
          ...participant.toObject(),
          latestMessage: latestMessage || null,
        };
      });
    
      // Gắn tin nhắn mới nhất vào danh sách groups
      const groupData = groups.map((group) => {
        const latestMessage = latestGroupMessages.find(
          (msg) => msg._id.toString() === group._id.toString(),
        );
        return {
          ...group,
          latestMessage: latestMessage || null,
        };
      });
    
      // Sắp xếp theo thời gian nhận tin nhắn mới nhất
      const sortedParticipants = participantData.sort(
        (a, b) => new Date(b.latestMessage?.createdAt || 0).getTime() - new Date(a.latestMessage?.createdAt || 0).getTime(),
      );
    
      const sortedGroups = groupData.sort(
        (a, b) => new Date(b.latestMessage?.createdAt || 0).getTime() - new Date(a.latestMessage?.createdAt || 0).getTime(),
      );
    
      return {
        Group: sortedGroups,
        Participants: sortedParticipants,
      };
    }
    
    
    
    

    async removeMemberInGroup(groupId: Types.ObjectId, Owner: Types.ObjectId, member : Types.ObjectId): Promise<Group> {
      const group = await this.GroupModel.findById(groupId);
      if (!group) {
        throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
      }
    
      if (group.owner.toString() !== Owner.toString()) {
        throw new HttpException('You are not the owner of this group', HttpStatus.UNAUTHORIZED);
      }
    
      group.participants = group.participants.filter((id) => id.toString() !== member.toString());
      return await group.save();
    }
    

    async sendMesageToUser(
      senderId: Types.ObjectId,
      receiverId: Types.ObjectId, 
      sendMessageDto: SendMessageDto,
      files?: Express.Multer.File[]
    ): Promise<Message> {
      const { content } = sendMessageDto;
      const user = await this.UserModel.findById(receiverId);
      
      // Ensure the receiver exists
      if (!user) {
        throw new HttpException('Receiver not found', HttpStatus.NOT_FOUND);
      }

      const Message = new this.MessageModel({
        sender: senderId,
        receiver: receiverId,
        content,
      });
    
      // Upload files if provided
      if (files && files.length > 0) {
        try {
          const uploadedMedia = await Promise.all(files.map(file => this.cloudinaryService.uploadFile(file)));
          Message.mediaURL = uploadedMedia;  
        } catch (error) {
          console.error('Error uploading images to Cloudinary:', error);
          throw new HttpException('Failed to upload images', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
      if (Types.ObjectId.isValid(receiverId)) {
        const receiverObjectId = new Types.ObjectId(receiverId); 
        console.log('Converted receiverId to ObjectId:', receiverObjectId);
      } else {
        console.log('receiverId is not a valid ObjectId string');
      }
    
      // Save and return the message
      return await Message.save();
    }

    async getMessagesToUser(userId: Types.ObjectId, receiverId: Types.ObjectId): Promise<any[]> {
      const messages = await this.MessageModel.find({
        $or: [
          { sender: userId, receiver: receiverId },
          { sender: receiverId, receiver: userId },
        ],
      })
        .sort({ createdAt: 1 })
        .exec();
    
      if (!messages.length) {
        throw new HttpException('No messages found', HttpStatus.NOT_FOUND);
      }
      const processedMessages = messages.map((message) => {
        if (!message.isLive) {
          return {
            _id: message._id,
            sender: message.sender,
            receiver: message.receiver,
            content: 'The message has been revoked', 
          };
        }
        return message;
      });
    
      return processedMessages;
    }
    

    async revokeAMessage(messageId: Types.ObjectId, userId: Types.ObjectId): Promise<Message | GroupMessage> {
      // Tìm tin nhắn trong MessageModel
      let message = await this.MessageModel.findById(messageId);
      let messageSource = 'MessageModel';
    

      if (!message) {
        message = await this.GroupMessageModel.findById(messageId);
        messageSource = 'GroupMessageModel';
      }
    

      if (!message) {
        throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
      }
    

      if (message.sender.toString() !== userId.toString()) {
        throw new HttpException('You are not authorized to revoke this message', HttpStatus.FORBIDDEN);
      }
    
      
      const updateFields = {
        isLive: false,
        content: null,
        mediaURL: null,
      };
    
      if (messageSource === 'MessageModel') {
        message = await this.MessageModel.findByIdAndUpdate(messageId, updateFields, { new: true });
      } else if (messageSource === 'GroupMessageModel') {
        message = await this.GroupMessageModel.findByIdAndUpdate(messageId, updateFields, { new: true });
      }
    

      return message;
    }
    
    


    async addMembersToGroup(
      addMembersToGroupDto: addMembersToGroupDto,
      groupId: Types.ObjectId,

    ): Promise<Group> {
      const { participants } = addMembersToGroupDto;
    
      const group = await this.GroupModel.findById(groupId);
      if (!group) {
        throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
      }
    
      const newParticipantIds = participants.map(
        (participant) => new Types.ObjectId(participant),
      );
    
      const existingParticipantIds = group.participants.map((id) =>
        id.toString(),
      );
      const uniqueParticipantIds = newParticipantIds.filter(
        (id) => !existingParticipantIds.includes(id.toString()),
      );
    
      if (uniqueParticipantIds.length === 0) {
        throw new HttpException(
          'All users are already in the group',
          HttpStatus.BAD_REQUEST,
        );
      }
    
      
      group.participants.push(...(uniqueParticipantIds as any));
    
      return await group.save();
    }
    
    async deleteGroup(groupId : Types.ObjectId, userId : Types.ObjectId): Promise<Group> {
      const group = await this.GroupModel.findById(groupId);
      if (!group) {
        throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
      }
      if(group.owner.toString() != userId.toString()){
        throw new HttpException('You do not have permission to delete this group', HttpStatus.UNAUTHORIZED);
      }

      await this.GroupMessageModel.deleteMany({ group: groupId });
      await this.GroupModel.findByIdAndDelete(groupId);
      return group;
    }
    
}

