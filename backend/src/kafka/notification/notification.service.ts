import { Injectable } from '@nestjs/common';
import { EventService } from '../../event/event.service';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './schema/notification.schema';

@Injectable()
export class NotificationService {
  
  constructor(
    @InjectModel(Notification.name)private readonly notificationModel: Model<Notification>,
    private eventService: EventService
  ) {}

  // 🔹 Xử lý tin nhắn nhóm
  async handleChatMessage(payload) {
    const { senderId, groupId, content, mediaURL, recipients, messageId } = payload;
    
    for (const userId of recipients) {
      if (userId !== senderId) {
        this.eventService.notificationToUser(userId, 'newmessagetogroup', {
          messageId,
          groupId,
          senderId,
          content,
          mediaURL,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  // 🔹 Xử lý bình luận bài viết

  async handlePostEvent(payload) {
    const { postId, userId, ownerId, message, timestamp } = payload;
  
    if (userId !== ownerId) {
      this.eventService.notificationToUser(ownerId, 'newpostevent', {
        postId,
        userId,
        message,
        timestamp,
      });
    }
  }

  async handleKafkaMessage(message: any) {
    try {
      const parsedMessage = JSON.parse(message.value);
  
      // Chuyển đổi ObjectId
      if (parsedMessage.userId && Types.ObjectId.isValid(parsedMessage.userId)) {
        parsedMessage.userId = new Types.ObjectId(parsedMessage.userId);
      }
      if (parsedMessage.ownerId && Types.ObjectId.isValid(parsedMessage.ownerId)) {
        parsedMessage.ownerId = new Types.ObjectId(parsedMessage.ownerId);
      }
      if (parsedMessage.data.postId && Types.ObjectId.isValid(parsedMessage.data.postId)) {
        parsedMessage.data.postId = new Types.ObjectId(parsedMessage.data.postId);
      }
  
      // Kiểm tra nếu là hành động "like" hoặc "unlike"
      if (parsedMessage.type === 'like' || parsedMessage.type === 'unlike') {
        const existingNotification = await this.notificationModel.findOne({
          userId: parsedMessage.userId,
          'data.postId': parsedMessage.data.postId, // Kiểm tra chính xác post
          type: 'like',
        });
  
        if (parsedMessage.type === 'like') {
          if (!existingNotification) {
            // Nếu chưa tồn tại, tạo mới
            await this.notificationModel.create(parsedMessage);
            console.log('✅ Notification saved:', parsedMessage);
          } else {
            // Nếu đã tồn tại, cập nhật timestamp
            await this.notificationModel.updateOne(
              { _id: existingNotification._id },
              { $set: { 'data.timestamp': new Date() } }
            );
            console.log('🔄 Updated existing notification:', parsedMessage);
          }
        } else if (parsedMessage.type === 'unlike' && existingNotification) {
          // Nếu unlike, xóa thông báo
          await this.notificationModel.deleteOne({ _id: existingNotification._id });
          console.log('🗑️ Removed unlike notification:', parsedMessage);
        }
      } else {
        // Xử lý các loại thông báo khác
        const existingNotification = await this.notificationModel.findOne({
          messageId: parsedMessage.messageId,
        });
  
        if (!existingNotification) {
          await this.notificationModel.create(parsedMessage);
          console.log('✅ Notification saved:', parsedMessage);
        } else {
          console.log('⚠️ Duplicate message detected, skipping:', parsedMessage);
        }
      }
    } catch (error) {
      console.error('❌ Error handling Kafka message:', error);
    }
  }
  
  
  
  async handleKafkaEvent(topic: string, message: any) {
    try {
      const parsedMessage = JSON.parse(message.value.toString());
  
      console.log(`📥 Received message from "${topic}":`, parsedMessage);
  
      switch (topic) {
        case 'notification':
          await this.handleChatMessage(parsedMessage);
          break;
  
        case 'mypost':
          await this.handlePostEvent(parsedMessage);
          break;
  
        default:
          console.warn(`⚠️ Unknown topic: ${topic}`);
      }
      await this.handleKafkaMessage(message);
      // 🔹 Kiểm tra và lưu vào MongoDB nếu không bị trùng
      if (parsedMessage.messageId) {
        const existingNotification = await this.notificationModel.findOne({
          messageId: parsedMessage.messageId,
        });
  
        if (!existingNotification) {
          await this.notificationModel.create(parsedMessage);
          console.log('✅ Notification saved:', parsedMessage);
        } else {
          console.log('⚠️ Duplicate message detected, skipping:', parsedMessage);
        }
      }
  
    } catch (error) {
      console.error(`❌ Error processing Kafka message from ${topic}:`, error);
    }
  }
  

  async getUserNotifications(userId: Types.ObjectId) {
    return await this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(notificationId: Types.ObjectId) {
    return await this.notificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }

}
