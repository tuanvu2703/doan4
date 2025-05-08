import { Global, Module, Post } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from './schemas/post.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { UserSchema } from '../user/schemas/user.schemas';
import { UserModule } from '../user/user.module';
import { EventService } from 'src/event/event.service';
import { EventModule } from 'src/event/event.module';
import { ProducerModule } from '../kafka/producer/producer.module';
import { PublicGroupModule } from 'src/public-group/public-group.module';
import { UserService } from 'src/user/user.service';
import { ParseCursorPipe } from './pipes/parse-cursor.pipe';

@Global()
@Module({
  imports:[
    MongooseModule.forFeature([{name: 'Post' , schema: PostSchema }, {name: 'User', schema: UserSchema}]),
    CloudinaryModule,
    UserModule,
    ProducerModule,
    PublicGroupModule,
  ],
  controllers: [PostController],
  providers: [PostService, ParseCursorPipe],
  exports: [MongooseModule, PostService],
})
export class PostModule {}

