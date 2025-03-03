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
    
  async handleNotification(payload: any) {
    console.log("📨 Notification received:", payload);
}


  async handleKafkaMessage(message: any, shouldSave = true, skipSaveForTopics: string[] = []) {
    try {
      const parsedMessage = JSON.parse(message.value);
  
      // Chuyển đổi ObjectId nếu có
      ['userId', 'ownerId', 'sender', 'reportedId'].forEach((field) => {
        if (parsedMessage[field] && Types.ObjectId.isValid(parsedMessage[field])) {
          parsedMessage[field] = new Types.ObjectId(parsedMessage[field]);
        }
      });
  
      if (parsedMessage.data?.postId && Types.ObjectId.isValid(parsedMessage.data.postId)) {
        parsedMessage.data.postId = new Types.ObjectId(parsedMessage.data.postId);
      }
  
      // Nếu topic nằm trong danh sách bỏ qua => Không lưu vào DB
      if (skipSaveForTopics.includes(parsedMessage.topic)) {
        console.log(`🛑 Skipping save for topic: ${parsedMessage.topic}`);
        return;
      }
  
      // Kiểm tra xem có cần lưu không
      if (!shouldSave) {
        console.log('🚀 Processing message without saving:', parsedMessage);
        return;
      }
  
      // Lưu vào MongoDB nếu chưa có
      const existingNotification = await this.notificationModel.findOne({
        messageId: parsedMessage.messageId,
      });
  
      if (!existingNotification) {
        await this.notificationModel.create(parsedMessage);
        console.log('✅ Notification saved:', parsedMessage);
      } else {
        console.log('⚠️ Duplicate message detected, skipping:', parsedMessage);
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
                await this.handleNotification(parsedMessage);
                return; // Không gọi handleKafkaMessage

            case 'mypost':
                await this.handlePostEvent(parsedMessage);
                break;

            default:
                console.warn(`⚠️ Unknown topic: ${topic}`);
        }

        await this.handleKafkaMessage(message, topic !== 'chat', ['chat', 'notification']);

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
