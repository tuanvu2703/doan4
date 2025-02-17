import { Body, Controller, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { SendMailDto } from './dto/sendMailDto';

@Controller('mail')
export class MailController {
    constructor(
        private readonly mailService: MailService
    ){}
    
    @Post('send')
    async sendEmail(@Body() sendMailDto: SendMailDto) {
      const { to, subject, text } = sendMailDto;
      const result = await this.mailService.sendMail(to, subject, text);
      return result;
    }
}
