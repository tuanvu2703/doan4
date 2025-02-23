import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer, logLevel } from 'kafkajs';
import { EventService } from '../../event/event.service';

@Injectable()
export class ConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(private readonly eventService: EventService) {
    if (!process.env.KAFKA_BROKER || !process.env.KAFKA_USERNAME || !process.env.KAFKA_PASSWORD) {
      throw new Error('❌ Kafka environment variables are missing!');
    }

    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'nestjs-kafka-consumer',
      brokers: [process.env.KAFKA_BROKER],
      ssl: true,
      sasl: {
        mechanism: 'plain',
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
      },
      connectionTimeout: 10000, // Tăng timeout lên 10s
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

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const payload = JSON.parse(message.value.toString());
            console.log(`📥 Received message from "${topic}":`, payload);

            // Gửi thông báo qua WebSocket
            this.eventService.notificationToUser(payload.userId, 'newNotification', payload);
          } catch (error) {
            console.error(`❌ Error processing message from topic ${topic}:`, error);
          }
        },
      });
    } catch (error) {
      console.error('❌ Kafka Consumer connection failed:', error);
    }
  }

  async onModuleDestroy() {
    console.log('🔌 Disconnecting Kafka Consumer...');
    await this.consumer.disconnect();
  }
}
