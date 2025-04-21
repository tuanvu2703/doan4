import { HttpException, Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './schema/message.schema';
import { GroupMessage } from './schema/groupMessage.schema';
import { User } from '../user/schemas/user.schemas';
import { CreateGroupDto } from './dto/createGroup.dto';
import { SendMessageDto } from './dto/sendMessage.dto';
import * as crypto from 'crypto';
import { Group } from './schema/group.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { addMembersToGroupDto } from './dto/addMemberGroup.dto';
import { buffer } from 'stream/consumers';


@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Message.name) private readonly MessageModel: Model<Message>,
        @InjectModel(GroupMessage.name) private readonly GroupMessageModel: Model<GroupMessage>,
        @InjectModel(Group.name) private readonly GroupModel: Model<Group>,
        @InjectModel(User.name) private readonly UserModel: Model<User>,
        private readonly cloudinaryService : CloudinaryService,
    ){}


    private encryptMessage(text: string): string {
      const IV_LENGTH = parseInt(process.env.IV_LENGTH);
      const iv = crypto.randomBytes(IV_LENGTH); 
      const cipher = crypto.createCipheriv(
        process.env.ENCRYPTION_ALGORITHM, 
        Buffer.from(process.env.ENCRYPTION_KEY, 'utf-8'), 
        iv
      );
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
    
      return iv.toString('hex') + ':' + encrypted; 
    }
    

    private decryptMessage(text: string): string {
      const [iv, encrypted] = text.split(':');
    
      if (!/^[0-9a-fA-F]{32}$/.test(iv)) {
        throw new Error('Invalid IV format');
      }
    
      const decipher = crypto.createDecipheriv(
        process.env.ENCRYPTION_ALGORITHM, 
        Buffer.from(process.env.ENCRYPTION_KEY, 'utf-8'), 
        Buffer.from(iv, 'hex') // Chuyển IV từ chuỗi hex thành Buffer
      );
    
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    }
    
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
    
      const encryptedContent = this.encryptMessage(content);

      const swagerGroupId = new Types.ObjectId(groupId);
      const groupMessage = new this.GroupMessageModel({
        group: swagerGroupId,
        sender: userId,
        content : encryptedContent,
        reading: [],
      });
    

      if (files && files.length > 0) {
        try {
          
          const uploadedMedia = await Promise.all(files.map(file => this.cloudinaryService.uploadFile(file)));
          
          groupMessage.mediaURL = uploadedMedia;
          
        } catch (error) {
          throw new HttpException('Failed to upload images', HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }
      return await groupMessage.save();
    }
    

    async getGroupMessages(groupId: Types.ObjectId, userId: Types.ObjectId ): Promise<{ group: any; messages: GroupMessage[] }> {
     
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
      //
      if(!group.participants.some((participant) => participant._id.toString() === userId.toString())) {
        throw new HttpException('You are not a member of this group', HttpStatus.UNAUTHORIZED);

      }

      //ok chưa đổi groupid thành objectId
      const messages = await this.GroupMessageModel.find({ group: groupId })
        .populate({ 
          path: 'sender', 
          select: 'firstName lastName avatar' 
        })
        .exec();
    
      if (!messages.length) { 
        throw new HttpException('Group has no messages', HttpStatus.NOT_FOUND);
      }
      messages.forEach((message) => {
        message.content = this.decryptMessage(message.content);
      });
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

        throw new HttpException('Failed to fetch group members', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    
    async getMylistChat(
      userId: Types.ObjectId,
    ): Promise<{ Group: any[]; Participants: any[] }> {
      try {

    
        // Lấy danh sách userId mà user đã nhắn tin
        const distinctUserIds = await this.MessageModel.aggregate([
          {
            $match: { $or: [{ sender: userId }, { receiver: userId }] },
          },
          {
            $group: {
              _id: null,
              userIds: {
                $addToSet: {
                  $cond: [{ $eq: ['$sender', userId] }, '$receiver', '$sender'],
                },
              },
            },
          },
        ]).then((result) => (result.length ? result[0].userIds : []).map(String));
        const normalizeIds = (ids: (string | Types.ObjectId)[]) =>
          ids.map((id) =>
            typeof id === 'string' && Types.ObjectId.isValid(id)
              ? new Types.ObjectId(id)
              : id,
          );
    
        const participants = await this.UserModel.find({
          _id: { $in: normalizeIds(distinctUserIds), $ne: userId },
        }).select('firstName lastName avatar');

        const groups = await this.GroupModel.find({
          participants: { $in: [userId] },
        })
          .select('name avatarGroup')
          .lean();
    
        const latestMessages = await this.MessageModel.aggregate([
          {
            $match: { $or: [{ sender: userId }, { receiver: userId }] },
          },
          {
            $sort: { createdAt: -1 },
          },
          {
            $set: {
              chatPartner: {
                $cond: [{ $eq: ['$sender', userId] }, '$receiver', '$sender'],
              },
            },
          },
          {
            $group: {
              _id: '$chatPartner', 
              messageId: { $first: '$_id' },
              content: { $first: '$content' },
              mediaURL: { $first: '$mediaURL' },
              createdAt: { $first: '$createdAt' },
              sender: { $first: '$sender' },
              receiver: { $first: '$receiver' },
            },
          },
        ]);
        await this.MessageModel.populate(latestMessages, [
          { path: 'sender', select: 'firstName lastName avatar' },
          { path: 'receiver', select: 'firstName lastName avatar' },
        ]);
    
        latestMessages.forEach((msg) => {
          if (msg.content) {
            msg.content = this.decryptMessage(msg.content);
          }
        });

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
    
        await this.GroupMessageModel.populate(latestGroupMessages, {
          path: 'sender',
          select: 'firstName lastName avatar',
        });
    
        latestGroupMessages.forEach((msg) => {
          if (msg.content) {
            msg.content = this.decryptMessage(msg.content);
          }
        });
    
        const participantData = participants.map((participant) => {
          const latestMessage = latestMessages.find(
            (msg) => msg._id.toString() === participant._id.toString(),
          );
          return {
            ...participant.toObject(),
            latestMessage: latestMessage || null,
          };
        });
    
        const groupData = groups.map((group) => {
          const latestMessage = latestGroupMessages.find(
            (msg) => msg._id.toString() === group._id.toString(),
          );
          return {
            ...group,
            latestMessage: latestMessage || null,
          };
        });
    
        const sortedParticipants = participantData.sort(
          (a, b) =>
            new Date(b.latestMessage?.createdAt || 0).getTime() -
            new Date(a.latestMessage?.createdAt || 0).getTime(),
        );
    
        const sortedGroups = groupData.sort(
          (a, b) =>
            new Date(b.latestMessage?.createdAt || 0).getTime() -
            new Date(a.latestMessage?.createdAt || 0).getTime(),
        );
    
        return {
          Group: sortedGroups,
          Participants: sortedParticipants,
        };
      } catch (error) {

        throw new Error('Failed to retrieve chat list');
      }
    }
    
    
    //bug
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
      const encryptedContent = this.encryptMessage(content);
      const Message = new this.MessageModel({
        sender: senderId,
        receiver: receiverId,
        content:encryptedContent,
      });
    
      // Upload files if provided
      if (files && files.length > 0) {
        try {
          const uploadedMedia = await Promise.all(files.map(file => this.cloudinaryService.uploadFile(file)));
          Message.mediaURL = uploadedMedia;  
        } catch (error) {

          throw new HttpException('Failed to upload images', HttpStatus.INTERNAL_SERVER_ERROR);
        }
      }
      if (Types.ObjectId.isValid(receiverId)) {
        const receiverObjectId = new Types.ObjectId(receiverId); 

      } else {

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
        const messageObject = message.toObject(); // Chuyển document MongoDB thành object thuần
    
        if (!messageObject.isLive) {
          messageObject.content = 'The message has been revoked';
        } else {
          try {
            messageObject.content = this.decryptMessage(messageObject.content);
          } catch (error) {
            messageObject.content = '[Decryption Failed]';
          }
        }
    
        return messageObject;
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

