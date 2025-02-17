import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendController } from './friend.constroller';
import { FriendService } from './friend.service';
import { FriendRequest, FriendRequestSchema } from './schemas/friend-request.schema';
import { AuthGuardD } from '../user/guard/auth.guard';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: FriendRequest.name, schema: FriendRequestSchema }]),
        UserModule,
    ],
    controllers: [FriendController],
    providers: [FriendService, AuthGuardD],
})
export class FriendModule {}
