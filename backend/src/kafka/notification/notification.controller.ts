import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CurrentUser } from 'src/user/decorator/currentUser.decorator';
import { ApiBearerAuth, ApiPayloadTooLargeResponse, ApiTags } from '@nestjs/swagger';
import { User } from 'src/user/schemas/user.schemas';
import { Types } from 'mongoose';
import { AuthGuardD } from 'src/user/guard/auth.guard';



@ApiTags('Notification')
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


  @Patch('read/:notificationId')
  @ApiBearerAuth() 
  @UseGuards(AuthGuardD)
  async markAsRead(
    @Param('notificationId') notificationId: string,
    @CurrentUser() currentUser: User,
  ){
    const userId = new Types.ObjectId(currentUser._id.toString())
    const NotificationId = new Types.ObjectId(notificationId);
    return await this.notificationService.markAsRead(NotificationId,userId);
  }

  @Get('getUnreadNotifications')
  @ApiBearerAuth()
  @UseGuards(AuthGuardD)
  async getUnreadNotifications(
    @CurrentUser() currentUser: User,
  ){
    const userId = new Types.ObjectId(currentUser._id.toString());
    return await this.notificationService.getUnreadNotifications(userId);
  }

  @Get('getNotificationIsRead')
  @ApiBearerAuth()
  @UseGuards(AuthGuardD)
  async getNotificationIsRead(
    @CurrentUser() currentUser: User,
  ){
    const userId = new Types.ObjectId(currentUser._id.toString());
    return await this.notificationService.getNotificationIsRead(userId);
  }
  
  
}
