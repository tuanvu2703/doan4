import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, logLevel } from 'kafkajs';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
@Injectable()
export class ProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    if (!process.env.REDPANDA_BROKER || !process.env.REDPANDA_USERNAME || !process.env.REDPANDA_PASSWORD) {
      throw new Error('❌ Kafka environment variables are missing!');
    }

    this.kafka = new Kafka({ 
      brokers: [process.env.REDPANDA_BROKER],
      clientId: process.env.REDPANDA_CLIENT_ID,
      ssl: true,
      sasl: {
        mechanism: "scram-sha-256",
        username: process.env.REDPANDA_USERNAME,
        password: process.env.REDPANDA_PASSWORD,
      },
      connectionTimeout: 10000, 
      logLevel: logLevel.INFO,
    });

    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
        console.log('🔄 Connecting Kafka Producer...');
        await this.producer.connect();
        console.log('✅ Kafka Producer connected!');
    } catch (error) {
        console.error('❌ Kafka Producer connection failed:', error);
        setTimeout(() => this.onModuleInit(), 5000); // Retry sau 5 giây
    }
}


  async onModuleDestroy() {
    await this.producer.disconnect();
  }
  //người gửi 
  // gửi tới đâu 
  // nội dung là gì
  async sendMessage(topic: string, message: any) {
    try {
      // Chuyển ObjectId thành string để gửi qua Kafka
      if (message.userId instanceof Types.ObjectId) {
        message.userId = message.userId.toString();
      }
      if (message.ownerId instanceof Types.ObjectId) {
        message.ownerId = message.ownerId.toString();
      }
  
      await this.producer.send({
        topic,
        messages: [
          {
            key: message.userId || randomUUID(), 
            value: JSON.stringify(message),
          },
        ],
      });
      console.log(`📨 Message sent to "${topic}":`, message);
    } catch (error) {
      console.error('❌ Kafka sendMessage error:', error);
    }
  }
  
}
