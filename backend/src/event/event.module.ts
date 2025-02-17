import { Global, Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { EventService } from './event.service';
import { EventGeteWay } from './event.geteway';
import { AuththenticationSoket } from 'src/user/guard/authSocket.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Global()
@Module({
    imports : [
        UserModule,
    ],
    providers: [EventService, EventGeteWay, AuththenticationSoket, JwtModule, JwtService,],
    exports: [EventService,  EventGeteWay],
})
export class EventModule {

}
