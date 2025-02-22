import { Module } from '@nestjs/common';
import { ConsumerService } from './kafka.Consumer.service';
import { EventModule } from '../../event/event.module';
import { NotificationService } from '../notification/notification.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [EventModule, NotificationModule],
  providers: [ConsumerService, NotificationService],
  exports: [ConsumerService],
})
export class ConsumerModule {}
