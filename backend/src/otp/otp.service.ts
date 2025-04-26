import { BadRequestException, Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';
import { User } from 'src/user/schemas/user.schemas';
import { Model, model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class OtpService {
    constructor(
        private readonly mailService: MailService,
        @InjectModel(User.name) private userModel: Model<User>
    ){}
    generateOtp(): { otp: string, hashedOtp: string } {
        const otp = crypto.randomInt(100000, 999999).toString();

        const hashedOtp = crypto.createHmac('sha256', process.env.OTP_SECRET)
                                  .update(otp)
                                  .digest('hex');
        
        return { otp, hashedOtp };
      }

      async sendOtp(email: string, purpose: 'verify-account' | 'Reset password'): Promise<void> {
        // Gọi hàm generateOtp để nhận OTP và hashedOtp
        const user = await this.userModel.find({email: email});
        if(!user){
            throw new BadRequestException('Email not found');
        }
        try {
            const { otp, hashedOtp } = this.generateOtp();
        
        // Tạo nội dung email tùy theo mục đích
        const subject = purpose === 'verify-account' ? 'Verify Your Account' : 'Reset Password OTP';
        const text = `Your OTP code is: ${otp}. It will expire in 5 minutes.`;
        
        // Gửi OTP qua email (tác vụ bất đồng bộ)
        await this.mailService.sendMail(email, subject, text);
      
        // Lưu hashedOtp vào cơ sở dữ liệu cùng với thời gian hết hạn
        const otpExpirationTime = Date.now() + parseInt(process.env.OTP_LIFETIME);
      
        await this.userModel.updateOne(
          { email },
          { otp: hashedOtp, otpExpirationTime }
        );
        } catch (error) {
            console.log(error);
        }
        

      }

      async verifyOtp(email: string, otp: string): Promise<boolean> {
        const user = await this.userModel.findOne({ email });

        if (!user || !user.otp || !user.otpExpirationTime) {
            throw new BadRequestException('OTP not found or already used.');
        }

        // Kiểm tra thời gian hết hạn
        if (user.otpExpirationTime < new Date()) {
            throw new BadRequestException('OTP has expired.');
        }

        // Hash OTP người dùng nhập vào để so sánh
        const hashedOtp = crypto.createHmac('sha256', process.env.OTP_SECRET)
            .update(otp)
            .digest('hex');

        if (hashedOtp !== user.otp) {
            throw new BadRequestException('Invalid OTP.');
        }

        return true;
    }
}
