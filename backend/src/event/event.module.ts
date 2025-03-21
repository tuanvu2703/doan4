import { forwardRef, Global, Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { EventService } from './event.service';
import { EventGeteWay } from './event.geteway';
import { AuththenticationSoket } from 'src/user/guard/authSocket.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { WebRTCService } from './webrtc.service';

@Global()
@Module({
    imports : [
        UserModule,
        JwtModule,

    ],
    providers: [
        EventService, 
        EventGeteWay, 
        AuththenticationSoket, 
        JwtService, 
        WebRTCService,
    ],
    exports: [EventService, EventGeteWay, WebRTCService ],
})
export class EventModule {}
