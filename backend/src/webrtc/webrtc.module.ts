import { Module } from '@nestjs/common';
import { WebrtcService } from './webrtc.service';
import { WebrtcController } from './webrtc.controller';
import { CallGateway } from './wrtc.gateway';
import { AuththenticationSoket } from 'src/user/guard/authSocket.guard';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    UserModule,
  ],
  providers: [WebrtcService, CallGateway, AuththenticationSoket],
  controllers: [WebrtcController]
})
export class WebrtcModule {}
