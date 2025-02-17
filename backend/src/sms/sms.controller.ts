import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsDto } from './dto/sms.dto';

@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  async sendSms(@Body() smsDto: SmsDto) {
    await this.smsService.sendSms(smsDto.to, smsDto.message);
    return { message: 'SMS sent successfully' };
  }
}
