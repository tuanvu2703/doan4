import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicGroupSchema } from './schema/plgroup.schema';
import { MemberGroupSchema } from './schema/membergroup.schema';
import { PublicGroupService } from './public-group.service';
import { PublicGroupController } from './public-group.controller';
import { UserModule } from 'src/user/user.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { EventService } from 'src/event/event.service';
import { EventModule } from 'src/event/event.module';
import { RequestJoinGroupSchema } from './schema/requestJoinGroup.schema';


@Module({
    imports: [
    MongooseModule.forFeature([{name: 'PublicGroup',schema: PublicGroupSchema}]),
    MongooseModule.forFeature([{name: 'MemberGroup',schema: MemberGroupSchema}]),
    MongooseModule.forFeature([{name: 'RequestJoinGroup',schema: RequestJoinGroupSchema}]),
    UserModule,
    CloudinaryModule,
    ],
    controllers: [PublicGroupController],
    providers: [PublicGroupService],
    exports: [MongooseModule, PublicGroupService],

})
export class PublicGroupModule {}
