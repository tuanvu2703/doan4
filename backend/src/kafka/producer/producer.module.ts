import { Module } from '@nestjs/common';
import { ProducerService } from './kafka.Producer.service';


@Module({
  providers: [ProducerService],

  exports: [ProducerService], 
})
export class ProducerModule {}
