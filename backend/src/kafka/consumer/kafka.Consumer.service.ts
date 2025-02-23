import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer, logLevel } from 'kafkajs';
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
        await this.consumer.subscribe({ topic: 'group', fromBeginning: false });
        await this.consumer.subscribe({ topic: 'mypost', fromBeginning: false });

        // từ đoạn này là xử lý các message từ Kafka
        // nó không liên quan đến ScyllaDB, nhưng nó cũng là một service
        // và không liên quan đến connnect ở trên đây là 1 phần riêng

        await this.consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            try {
              const payload = JSON.parse(message.value.toString());
              console.log(`📥 Received message from "${topic}":`, payload);
              

              // notifiaction cái này là topic riêng phần chat(những thông báo tin nhắn sẽ được xoá khi user đọc)
              switch (topic) {
                case 'notification':
                  await this.notificationService.handleChatMessage(payload);
                  break;
                //mypost là topic riêng của phần thông báo đối với bài viết

                  case 'mypost':
                    if (!this.notificationService) {
                      console.error("❌ notificationService is not initialized!");
                    }
                    if (typeof this.notificationService.handlePostEvent !== 'function') {
                      console.error("❌ handlePostEvent is not a function!");
                    }
                    await this.notificationService.handlePostEvent(payload);
                    break;

                //group và fanpage là topic riêng của phần thông báo đối với group và fanpage
                // quay lại sau do chưa có module group public
                // case 'group':
                //   await this.notificationService.handlePostLike(payload);
                //   break;
  
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
