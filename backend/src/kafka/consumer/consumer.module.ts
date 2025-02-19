import { Module } from '@nestjs/common';
import { ConsumerService } from './kafka.Consumer.service';
import { EventModule } from '../../event/event.module';

@Module({
    imports: [EventModule],
  providers: [ConsumerService],
  exports: [ConsumerService],
})
export class ConsumerModule {}
