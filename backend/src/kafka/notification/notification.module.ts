import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema, Notification } from './schema/notification.schema';
import { NotificationController } from './notification.controller';
import { ProducerModule } from '../producer/producer.module';
import { UserModule } from '../../user/user.module';

@Module({

imports: [
  ProducerModule,
  UserModule,
  MongooseModule.forFeature(
    [{ name: 'Notification' , schema: NotificationSchema}]),
],

  controllers: [NotificationController],
  providers: [NotificationService],
    exports: [NotificationService], 
})
export class NotificationModule {}
