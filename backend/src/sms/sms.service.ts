import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Vonage } from '@vonage/server-sdk';

@Injectable()
export class SmsService {
  private vonage: Vonage;

  constructor() {
    this.vonage = new Vonage({
      apiKey: process.env.VONAGE_API_KEY,
      apiSecret: process.env.VONAGE_API_SECRET,
    } as any);
  }

  async sendSms(to: string, message: string): Promise<void> {
    const from = process.env.VONAGE_FROM_NUMBER;
    try {
      const response = await this.vonage.sms.send({ to, from, text: message });
      console.log('SMS sent successfully:', response.messages[0].status);
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new HttpException(
        'Failed to send SMS',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
