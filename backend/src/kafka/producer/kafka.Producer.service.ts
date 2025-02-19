import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, logLevel } from 'kafkajs';

@Injectable()
export class ProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor() {
    if (!process.env.KAFKA_BROKER || !process.env.KAFKA_USERNAME || !process.env.KAFKA_PASSWORD) {
      throw new Error('❌ Kafka environment variables are missing!');
    }

    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'nestjs-kafka-producer',
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

    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    try {
      console.log('🔄 Connecting Kafka Producer...');
      await this.producer.connect();
      console.log('✅ Kafka Producer connected!');
    } catch (error) {
      console.error('❌ Kafka Producer connection failed:', error);
    }
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async sendMessage(topic: string, message: any) {
    try {
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
      console.log(`📨 Message sent to "${topic}":`, message);
    } catch (error) {
      console.error('❌ Kafka sendMessage error:', error);
    }
  }
}
