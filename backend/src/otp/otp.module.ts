import { Global, Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { MailModule } from '../mail/mail.module';
import { MailService } from '../mail/mail.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../user/schemas/user.schemas';


@Global()
@Module({
  imports: [
    MailModule,
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
  ],

  providers: [OtpService]
})
export class OtpModule {}
