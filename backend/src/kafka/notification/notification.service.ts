import { Injectable, UnauthorizedException } from '@nestjs/common';
import { EventService } from '../../event/event.service';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './schema/notification.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private readonly notificationModel: Model<Notification>,
    private eventService: EventService,
  ) {}

  // 🔹 Xử lý tin nhắn nhóm
  async handleChatMessage(payload: any) {
    const { senderId, groupId, content, mediaURL, recipients, messageId } = payload;

    if (!recipients || recipients.length === 0) {
      console.log('🛑 No recipients for chat message, skipping:', payload);
      return;
    }

    const targetUserIds = recipients
      .filter((userId: string) => userId !== senderId && Types.ObjectId.isValid(userId))
      .map((userId: string) => new Types.ObjectId(userId));

    if (targetUserIds.length === 0) {
      console.log('🛑 No valid recipients for chat message after filtering, skipping:', payload);
      return;
    }

    for (const userId of targetUserIds) {
      this.eventService.notificationToUser(userId.toString(), 'newmessagetogroup', {
        messageId,
        groupId,
        senderId,
        content,
        mediaURL,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // 🔹 Xử lý sự kiện bài viết (mypost)
  async handlePostEvent(payload: any) {
    const { targetIds, ownerId, data } = payload;
    const { postId, message, timestamp } = data;

    if (!targetIds || targetIds.length === 0) {
      console.log('🛑 No targetIds for post event, skipping:', payload);
      return;
    }

    const targetUserIds = targetIds
      .filter((userId: string) => userId.toString() !== ownerId.toString() && Types.ObjectId.isValid(userId))
      .map((userId: string) => new Types.ObjectId(userId));

    if (targetUserIds.length === 0) {
      console.log('🛑 No valid targetIds for post event after filtering, skipping:', payload);
      return;
    }

    const notificationData = {
      type: 'NEW_POST',
      ownerId: new Types.ObjectId(ownerId),
      targetUserIds,
      data: {
        postId,
        message: message || `${payload.ownerName || 'A friend'} just posted something new!`,
        timestamp: timestamp || new Date().toISOString(),
      },
      readBy: [],
    };

    await this.handleKafkaMessage({ value: JSON.stringify(notificationData) });
  }

  // 🔹 Xử lý thông báo từ topic 'notification'
  async handleNotification(payload: any) {
    console.log('📨 Notification received:', payload);

    const { ownerId, targetUserId, targetUserIds, type, data } = payload;

    const hasRecipients =
      (targetUserId && Types.ObjectId.isValid(targetUserId)) ||
      (targetUserIds && Array.isArray(targetUserIds) && targetUserIds.length > 0);

    if (!hasRecipients) {
      console.log('🛑 No recipients for notification, skipping:', payload);
      return;
    }

    if (targetUserId && targetUserIds?.length > 0) {
      console.log('🛑 Cannot set both targetUserId and targetUserIds, skipping:', payload);
      return;
    }

    const notificationData = {
      type: type || 'notification',
      ownerId: new Types.ObjectId(ownerId),
      ...(targetUserId ? { targetUserId: new Types.ObjectId(targetUserId) } : {}),
      ...(targetUserIds ? { targetUserIds: targetUserIds.map((id: string) => new Types.ObjectId(id)) } : {}),
      data: data || {},
      readBy: [],
    };

    await this.handleKafkaMessage({ value: JSON.stringify(notificationData) });
  }

  // 🔹 Xử lý tin nhắn Kafka
  async handleKafkaMessage(message: any, shouldSave = true, skipSaveForTopics: string[] = []) {
    try {
      const parsedMessage = JSON.parse(message.value);

      // Chuyển đổi ObjectId cho các trường đơn
      ['ownerId', 'sender', 'reportedId'].forEach((field) => {
        if (parsedMessage[field] && Types.ObjectId.isValid(parsedMessage[field])) {
          parsedMessage[field] = new Types.ObjectId(parsedMessage[field]);
        }
      });

      // Chuyển đổi targetUserId thành ObjectId
      if (parsedMessage.targetUserId && Types.ObjectId.isValid(parsedMessage.targetUserId)) {
        parsedMessage.targetUserId = new Types.ObjectId(parsedMessage.targetUserId);
      } else if (parsedMessage.targetUserId) {
        console.warn(`Invalid targetUserId: ${parsedMessage.targetUserId}`);
        parsedMessage.targetUserId = undefined;
      }

      // Chuyển đổi targetUserIds thành ObjectId
      if (parsedMessage.targetUserIds && Array.isArray(parsedMessage.targetUserIds)) {
        parsedMessage.targetUserIds = parsedMessage.targetUserIds
          .map((id: string) => {
            if (Types.ObjectId.isValid(id)) {
              return new Types.ObjectId(id);
            }
            console.warn(`Invalid ObjectId in targetUserIds: ${id}`);
            return null;
          })
          .filter((id: Types.ObjectId | null) => id !== null);
      }

      // Nếu có targetIds (từ tin nhắn gốc), chuyển thành targetUserIds
      if (parsedMessage.targetIds && Array.isArray(parsedMessage.targetIds) && !parsedMessage.targetUserIds) {
        parsedMessage.targetUserIds = parsedMessage.targetIds
          .map((id: string) => {
            if (Types.ObjectId.isValid(id)) {
              return new Types.ObjectId(id);
            }
            console.warn(`Invalid ObjectId in targetIds: ${id}`);
            return null;
          })
          .filter((id: Types.ObjectId | null) => id !== null);
        delete parsedMessage.targetIds; // Xóa targetIds sau khi chuyển đổi
      }

      // Kiểm tra xem có người nhận hay không
      const hasRecipients =
        (parsedMessage.targetUserId && Types.ObjectId.isValid(parsedMessage.targetUserId)) ||
        (parsedMessage.targetUserIds && Array.isArray(parsedMessage.targetUserIds) && parsedMessage.targetUserIds.length > 0);

      if (!hasRecipients) {
        console.log('🛑 No recipients (targetUserId or targetUserIds) found, skipping save:', parsedMessage);
        return;
      }

      // Kiểm tra không được set cả targetUserId và targetUserIds
      if (parsedMessage.targetUserId && parsedMessage.targetUserIds?.length > 0) {
        console.log('🛑 Cannot set both targetUserId and targetUserIds, skipping save:', parsedMessage);
        return;
      }

      // Chuyển đổi postId trong data
      if (parsedMessage.data?.postId && Types.ObjectId.isValid(parsedMessage.data.postId)) {
        parsedMessage.data.postId = new Types.ObjectId(parsedMessage.data.postId);
      }

      if (skipSaveForTopics.includes(parsedMessage.topic)) {
        console.log(`🛑 Skipping save for topic: ${parsedMessage.topic}`);
        return;
      }

      if (!shouldSave) {
        console.log('🚀 Processing message without saving:', parsedMessage);
        return;
      }

      const timeThreshold = 5 * 60 * 1000;
      const timestamp = parsedMessage.data?.timestamp ? new Date(parsedMessage.data.timestamp) : new Date();
      if (isNaN(timestamp.getTime())) {
        console.warn('Invalid timestamp, using current time:', parsedMessage);
        timestamp.setTime(new Date().getTime());
      }

      const existingNotification = await this.notificationModel.findOne({
        'data.postId': parsedMessage.data?.postId,
        ownerId: parsedMessage.ownerId,
        type: parsedMessage.type || 'post',
        'data.timestamp': {
          $gte: new Date(timestamp.getTime() - timeThreshold),
          $lte: timestamp,
        },
      });

      if (!existingNotification) {
        parsedMessage.readBy = parsedMessage.readBy || [];
        await this.notificationModel.create(parsedMessage);
        console.log('✅ Notification saved:', parsedMessage);
      } else {
        console.log('⚠️ Duplicate message detected within 5 minutes, skipping:', parsedMessage);
      }
    } catch (error) {
      console.error('❌ Error handling Kafka message:', error);
    }
  }

  // 🔹 Xử lý sự kiện Kafka
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
          return; // Không gọi handleKafkaMessage

        case 'chat':
          await this.handleChatMessage(parsedMessage);
          return; // Không gọi handleKafkaMessage

        default:
          console.warn(`⚠️ Unknown topic: ${topic}`);
      }

      // Chỉ gọi handleKafkaMessage cho các topic không được xử lý ở trên
      await this.handleKafkaMessage(message, topic !== 'chat', ['chat', 'notification']);
    } catch (error) {
      console.error(`❌ Error processing Kafka message from ${topic}:`, error);
    }
  }

  async getUserNotifications(userId: Types.ObjectId) {
    return await this.notificationModel
      .find({
        $or: [
          { targetUserId: userId },
          { targetUserIds: userId },
        ],
        readBy: { $ne: userId },
      })
      .sort({ createdAt: -1 })
      .populate('ownerId')
      .populate('targetUserId')
      .populate('targetUserIds')
      .exec();
  }

  async markAsRead(notificationId: Types.ObjectId, user: any) {
    const userId = user?.userId;
    if (!userId || !Types.ObjectId.isValid(userId)) {
      throw new UnauthorizedException('Invalid user ID from token');
    }

    const notification = await this.notificationModel.findById(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    const isRecipient =
      (notification.targetUserId && notification.targetUserId.toString() === userId) ||
      (notification.targetUserIds && notification.targetUserIds.some((id) => id.toString() === userId));

    if (!isRecipient) {
      throw new UnauthorizedException('You are not a recipient of this notification');
    }

    return await this.notificationModel.findByIdAndUpdate(
      notificationId,
      { $addToSet: { readBy: new Types.ObjectId(userId) } },
      { new: true },
    );
  }
}