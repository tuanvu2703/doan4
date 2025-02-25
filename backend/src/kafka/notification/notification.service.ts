import { Injectable } from '@nestjs/common';
import { EventService } from '../../event/event.service';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './schema/notification.schema';

@Injectable()
export class NotificationService {
  
  constructor(
    @InjectModel(Notification.name, 'sinkDB')
    private readonly notificationModel: Model<Notification>,
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
  
      // Chuyển đổi ObjectId nếu cần
      if (parsedMessage.userId && !(parsedMessage.userId instanceof Types.ObjectId) && Types.ObjectId.isValid(parsedMessage.userId)) {
        parsedMessage.userId = new Types.ObjectId(parsedMessage.userId);
      }
      if (parsedMessage.ownerId && !(parsedMessage.ownerId instanceof Types.ObjectId) && Types.ObjectId.isValid(parsedMessage.ownerId)) {
        parsedMessage.ownerId = new Types.ObjectId(parsedMessage.ownerId);
      }
      
  
      // Kiểm tra nếu là hành động "like" hoặc "unlike"
      if (parsedMessage.type === 'like' || parsedMessage.type === 'unlike') {
        const existingNotification = await this.notificationModel.findOne({
          userId: parsedMessage.userId,
          postId: parsedMessage.postId,
          type: 'like',
        });
  
        if (parsedMessage.type === 'like') {
          if (!existingNotification) {
            await this.notificationModel.create(parsedMessage);
            console.log('✅ Notification saved:', parsedMessage);
          } else {
            // Nếu đã tồn tại, cập nhật thời gian
            await this.notificationModel.updateOne(
              { _id: existingNotification._id },
              { $set: { updatedAt: new Date() } }
            );
            console.log('🔄 Updated existing notification:', parsedMessage);
          }
        } else if (parsedMessage.type === 'unlike' && existingNotification) {
          // Nếu unlike, xóa thông báo
          await this.notificationModel.deleteOne({ _id: existingNotification._id });
          console.log('🗑️ Removed unlike notification:', parsedMessage);
        }
      } else {
        // Nếu là loại thông báo khác, kiểm tra ID trước khi lưu
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
  

  async getUserNotifications(userId: string) {
    return await this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(notificationId: string) {
    return await this.notificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }

}
