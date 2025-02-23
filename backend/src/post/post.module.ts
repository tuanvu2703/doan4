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


@Global()
@Module({
  imports:[
    MongooseModule.forFeature([{name: 'Post' , schema: PostSchema }, {name: 'User', schema: UserSchema}]),
    CloudinaryModule,
    UserModule,
    EventModule,
    ProducerModule,
  ],
  controllers: [PostController],
  providers: [PostService, EventService],
  exports: [MongooseModule, PostService],
})
export class PostModule {}

