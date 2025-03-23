import { Module, Post } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from './schema/comment.schema'
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PostModule } from 'src/post/post.module';
import { UserModule } from 'src/user/user.module';
import { JwtService } from '@nestjs/jwt';
import { PostSchema } from 'src/post/schemas/post.schema';
import { User,UserSchema } from '../user/schemas/user.schemas';
import { EventModule } from 'src/event/event.module';
import { EventService } from 'src/event/event.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }
    ]),
    CloudinaryModule,
    PostModule,
    UserModule,
    EventModule
    ],
  controllers: [CommentController],
  providers: [CommentService, EventService],
  exports: [MongooseModule, CommentService],
})
export class CommentModule {}
