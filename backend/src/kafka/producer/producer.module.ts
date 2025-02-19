import { Module } from '@nestjs/common';
import { ProducerService } from './kafka.Producer.service';
import { NotificationController } from '../kafka.controller';

@Module({
  providers: [ProducerService],
  controllers: [NotificationController],
  exports: [ProducerService], 
})
export class ProducerModule {}
