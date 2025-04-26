import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private oAuth2Client: OAuth2Client;
  private gmail: any;

  constructor() {
    this.oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.REDIS_URL,
    );
    this.oAuth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });
    this.gmail = google.gmail({ version: 'v1', auth: this.oAuth2Client });
  }

  async sendMail(to: string, subject: string, text: string) {
    try {
        const accessToken = await this.oAuth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: process.env.EMAIL,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: accessToken.token || '',
            
          },
        });
        
    
        const mailOptions = {
          from: process.env.EMAIL,
          to: to, 
          subject: subject,
          text: text,
        };
        
        const result = await transporter.sendMail(mailOptions);

        return result;
      } catch (error) {
        console.error('Error sending email:', error);
        throw error;
      }
    }
}
