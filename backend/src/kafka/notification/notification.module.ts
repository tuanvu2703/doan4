import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema, Notification } from './schema/notification.schema';
import { NotificationController } from './notification.controller';
import { ProducerModule } from '../producer/producer.module';

@Module({

imports: [
  ProducerModule,
  MongooseModule.forFeature(
    [{ name: 'Notification' , schema: NotificationSchema , collection: 'notification' }],'sinkDB' ),
],

  controllers: [NotificationController],
  providers: [NotificationService],
    exports: [NotificationService], 
})
export class NotificationModule {}
