import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer, logLevel } from 'kafkajs';
import { EventService } from '../../event/event.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;
  private notificationService : NotificationService;

  constructor(private readonly eventService: EventService) {
    if (!process.env.KAFKA_BROKER || !process.env.KAFKA_USERNAME || !process.env.KAFKA_PASSWORD) {
      throw new Error('❌ Kafka environment variables are missing!');
    }

    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID,
      brokers: [process.env.KAFKA_BROKER],
      ssl: true,
      sasl: {
        mechanism: 'plain',
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
      },
      connectionTimeout: 10000, 
      logLevel: logLevel.INFO,
    });

    this.consumer = this.kafka.consumer({ groupId: 'connect-lcc-77ojdj' });
  }

  async onModuleInit() {
    try {
        console.log('🔄 Connecting Kafka Consumer...');
        await this.consumer.connect(); 
        console.log('✅ Kafka Consumer connected!');

        await this.consumer.subscribe({ topic: 'notification', fromBeginning: false });
        await this.consumer.subscribe({ topic: 'fanpage', fromBeginning: false });
        await this.consumer.subscribe({ topic: 'group', fromBeginning: false });
        await this.consumer.subscribe({ topic: 'mypost', fromBeginning: false });
        await this.consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            try {
              const payload = JSON.parse(message.value.toString());
              console.log(`📥 Received message from "${topic}":`, payload);
  
              switch (topic) {
                case 'notification':
                  await this.notificationService.handleChatMessage(payload);
                  break;
  
                case 'mypost':
                  await this.notificationService.handlePostComment(payload);
                  break;
  
                case 'group':
                  await this.notificationService.handlePostLike(payload);
                  break;

                case 'fanpage':
                  await this.notificationService.handlePostLike(payload);
                  break;
  
                default:
                  console.warn(`⚠️ Unknown topic: ${topic}`);
              }
            } catch (error) {
              console.error(`❌ Error processing message from topic ${topic}:`, error);
            }
          },
        });
  
    } catch (error) {
        console.error('❌ Kafka Consumer connection failed:', error);
        setTimeout(() => this.onModuleInit(), 5000);
    }
}



  async onModuleDestroy() {
    console.log('🔌 Disconnecting Kafka Consumer...');
    await this.consumer.disconnect();
  }
}
