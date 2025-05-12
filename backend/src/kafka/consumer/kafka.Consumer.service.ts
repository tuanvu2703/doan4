import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Consumer, logLevel, EachMessagePayload } from 'kafkajs';
import { EventService } from '../../event/event.service';
import { NotificationService } from '../notification/notification.service';
import { KAFKA_GROUPS, KAFKA_TOPICS } from '../config/kafka.config';

interface ConsumerConfig {
  topic : string;
  groupId : string;
}

@Injectable()
export class ConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumers: Map<string, Consumer> = new Map();
  private readonly logger = new Logger(ConsumerService.name);
  constructor(
    private readonly eventService: EventService,
    private readonly notificationService: NotificationService,
  ) {
    if (!process.env.KAFKA_BROKER) {
      throw new Error('❌ Kafka environment variables are missing!');
    }

    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'my-app',
      brokers: [process.env.KAFKA_BROKER],
      logLevel: logLevel.INFO,
      retry: {
        initialRetryTime: 300,
        retries: 10,
      },
    });
  }

  private async createConsumer({ topic, groupId }: ConsumerConfig) {
    const consumer = this.kafka.consumer({
      groupId,
      maxInFlightRequests: 100, // Giới hạn request đồng thời
    });

    try {
      this.logger.log(`😴 Connecting consumer for ${topic} (group: ${groupId})...`);
      await consumer.connect();
      await consumer.subscribe({ topic, fromBeginning: false });
      this.logger.log(`😎 Consumer connected for ${topic}`);

      await consumer.run({
        autoCommit: true, // Sử dụng autoCommit để đơn giản hóa
        eachMessage: async ({ topic, message }) => {
          try {
            await this.notificationService.handleKafkaEvent(topic, message);
          } catch (error) {
            this.logger.error(`😵 Error processing message from ${topic}`, error.stack);
            await consumer.pause([{ topic }]);
            setTimeout(() => consumer.resume([{ topic }]), 5000);
          }
        },
      });

      this.consumers.set(topic, consumer);
    } catch (error) {
      this.logger.error(`😵 Failed to connect consumer for ${topic}`, error.stack);
      setTimeout(() => this.createConsumer({ topic, groupId }), 5000);
    }
  }

  async onModuleInit() {
    const consumerConfigs: ConsumerConfig[] = [
      { topic: KAFKA_TOPICS.NOTIFICATION, groupId: KAFKA_GROUPS.NOTIFICATION },
      { topic: KAFKA_TOPICS.GROUP, groupId: KAFKA_GROUPS.GROUP },
      { topic: KAFKA_TOPICS.MYPOST, groupId: KAFKA_GROUPS.MYPOST },
      { topic: KAFKA_TOPICS.REPORT, groupId: KAFKA_GROUPS.REPORT },
    ];

    await Promise.all(consumerConfigs.map((config) => this.createConsumer(config)));
  }

  async onModuleDestroy() {
    this.logger.log('🔌 Disconnecting all consumers...');
    await Promise.all(
      Array.from(this.consumers.values()).map((consumer) => consumer.disconnect()),
    );
  }

  }

// import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
// import { Kafka, Consumer, logLevel, EachMessagePayload } from 'kafkajs';
// import { EventService } from '../../event/event.service';
// import { NotificationService } from '../notification/notification.service';

// @Injectable()
// export class ConsumerService implements OnModuleInit, OnModuleDestroy {
//   private kafka: Kafka;
//   private consumer: Consumer;

//   constructor(
//     private readonly eventService: EventService,
//     private readonly notificationService: NotificationService,
//   ) {
//     if (!process.env.REDPANDA_BROKER || !process.env.REDPANDA_USERNAME || !process.env.REDPANDA_PASSWORD) {
//       throw new Error('❌ Kafka environment variables are missing!');
//     }

//     this.kafka = new Kafka({
//       clientId: process.env.REDPANDA_CLIENT_ID,
//       brokers: [process.env.REDPANDA_BROKER],
//       ssl: true,
//       sasl: {
//         mechanism: 'scram-sha-256',
//         username: process.env.REDPANDA_USERNAME,
//         password: process.env.REDPANDA_PASSWORD,
//       },
//       connectionTimeout: 10000,
//       retry: {
//         initialRetryTime: 1000,
//         retries: 10,
//       },
//       logLevel: logLevel.INFO,
//     });

//     this.consumer = this.kafka.consumer({
//       groupId: 'GRnotification',
//       sessionTimeout: 30000,
//       heartbeatInterval: 3000,
//     });
//   }

//   async onModuleInit() {
//     try {
//       console.log('🔄 Connecting Kafka Consumer...');
//       await this.consumer.connect();
//       console.log('✅ Kafka Consumer connected!');

//       await this.consumer.subscribe({ topic: 'notification', fromBeginning: false });
//       await this.consumer.subscribe({ topic: 'group', fromBeginning: false });
//       await this.consumer.subscribe({ topic: 'mypost', fromBeginning: false });

//       await this.consumer.run({
//         autoCommit: false,
//         eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
//           try {
//             await this.notificationService.handleKafkaEvent(topic, message);
//             await this.consumer.commitOffsets([
//               { topic, partition, offset: (parseInt(message.offset) + 1).toString() },
//             ]);
//           } catch (error) {
//             console.error(`❌ Error processing message from ${topic}:`, error);
//             throw error; // Để lỗi được catch bên ngoài, không commit offset
//           }
//         },
//       });
//     } catch (error) {
//       console.error('❌ Kafka Consumer error:', error);
//       await this.consumer.disconnect();
//       setTimeout(() => this.onModuleInit(), 5000);
//     }
//   }

//   async onModuleDestroy() {
//     console.log('🔌 Disconnecting Kafka Consumer...');
//     await this.consumer.disconnect();
//   }
// }