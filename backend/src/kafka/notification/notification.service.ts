import { Injectable } from '@nestjs/common';
import { EventService } from '../../event/event.service';

@Injectable()
export class NotificationService {
  constructor(private eventService: EventService) {}

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

  
  
  

  // 🔹 Xử lý like bài viết
  // quay lại sau do chưa có module group public 
  // async handleGroupMessage(payload) {
  //   const { postId, likerId, ownerId } = payload;

  //   if (likerId !== ownerId) {
  //     this.eventService.notificationToUser(ownerId, 'Notification in group comunity', {
  //       postId,
  //       likerId,
  //       timestamp: new Date().toISOString(),
  //     });
  //   }
  // }

  async getNotifications(userId: string) {

  }

}
