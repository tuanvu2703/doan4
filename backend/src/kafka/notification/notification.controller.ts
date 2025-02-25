import { Controller, Get, Patch, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Lấy danh sách thông báo của user
  @Get(':userId')
  async getUserNotifications(
    @Param('userId') userId: string) {
    return await this.notificationService.getUserNotifications(userId);
  }

  // Đánh dấu thông báo là đã đọc
  @Patch(':notificationId/read')
  async markAsRead(@Param('notificationId') notificationId: string) {
    return await this.notificationService.markAsRead(notificationId);
  }
}
