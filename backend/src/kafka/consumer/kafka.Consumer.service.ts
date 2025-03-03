import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer, logLevel, EachMessagePayload, } from 'kafkajs';
import { EventService } from '../../event/event.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private readonly eventService: EventService,
    private readonly notificationService: NotificationService,
  ) {
    if (!process.env.REDPANDA_BROKER || !process.env.REDPANDA_USERNAME || !process.env.REDPANDA_PASSWORD) {
      throw new Error('❌ Kafka environment variables are missing!');
    }

    this.kafka = new Kafka({
      clientId: process.env.REDPANDA_CLIENT_ID,
      brokers: [process.env.REDPANDA_BROKER],
      ssl: true,
      sasl: {
        mechanism: 'scram-sha-256',
        username: process.env.REDPANDA_USERNAME,
        password: process.env.REDPANDA_PASSWORD,
      },
      connectionTimeout: 10000, 
      logLevel: logLevel.INFO,
    });

    this.consumer = this.kafka.consumer({ groupId: 'GRnotification' });
  }

  async onModuleInit() {
    try {
        console.log('🔄 Connecting Kafka Consumer...');
        await this.consumer.connect(); 
        console.log('✅ Kafka Consumer connected!');
         

        await this.consumer.subscribe({ topic: 'notification', fromBeginning: false, });
        await this.consumer.subscribe({ topic: 'group', fromBeginning: false });
        await this.consumer.subscribe({ topic: 'mypost', fromBeginning: false });

        // từ đoạn này là xử lý các message từ Kafka
        // nó không liên quan đến ScyllaDB, nhưng nó cũng là một service
        // và không liên quan đến connnect ở trên đây là 1 phần riêng

        await this.consumer.run({
          eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
            await this.notificationService.handleKafkaEvent(topic, message);
            
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
