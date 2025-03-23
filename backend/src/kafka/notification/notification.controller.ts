import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CurrentUser } from 'src/user/decorator/currentUser.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from 'src/user/schemas/user.schemas';
import { Types } from 'mongoose';
import { AuthGuardD } from 'src/user/guard/auth.guard';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}


  @Get('getnotifications')
  @ApiBearerAuth() 
  @UseGuards(AuthGuardD)
  async getUserNotifications(
   @CurrentUser() currentUser: User,
  ) {
    console.log(User);
    const userIdOBJ = new Types.ObjectId(currentUser._id.toString());
    return await this.notificationService.getUserNotifications(userIdOBJ);
  }


  @Patch(':notificationId/read')
  async markAsRead(
    @Param('notificationId') notificationId: string,
    @Request() req: any,
  ){
    const swagNotificationId = new Types.ObjectId(notificationId);
    return await this.notificationService.markAsRead(swagNotificationId, req.user_id);
  }
}
