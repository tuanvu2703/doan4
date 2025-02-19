import { Controller, Post, Body } from '@nestjs/common';
import { ProducerService } from './producer/kafka.Producer.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly producerService: ProducerService) {}

  @Post()
  async sendNotification(@Body() body: { userId: string; message: string }) {
    await this.producerService.sendMessage('notification', body);
    return { status: 'Sent to Kafka' };
  }
}
