import { Module } from '@nestjs/common';

import { CallGateway } from './wrtc.gateway';
import { AuththenticationSoket } from 'src/user/guard/authSocket.guard';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    UserModule,
  ],
  providers: [CallGateway, AuththenticationSoket],
  controllers: []
})
export class WebrtcModule {}
