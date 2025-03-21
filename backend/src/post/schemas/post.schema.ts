import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { PublicGroup } from 'src/public-group/schema/plgroup.schema';
import { User } from 'src/user/schemas/user.schemas';

@Schema({
  timestamps: true, 
})
export class Post extends Document {

  @Prop({
    type: Types.ObjectId,
    ref: 'PublicGroup', 
    required: false,
    set: (value: Types.ObjectId) => (value ? value : undefined),
  })
  group: PublicGroup

  @Prop()
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }],  })
  likes: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }],}) 
  dislikes: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Comment' }] }) 
  comments: Types.ObjectId[];

  @Prop({ type: Number, default: 0 }) 
  likesCount: number;

  @Prop({ type: Number, default: 0 })
  commentsCount: number;

  @Prop({ type: [String], }) 
  img: string[];

  @Prop({ type: String })
  gif: string;

  @Prop({ default: true }) 
  isActive: boolean;

  @Prop({ type: String, enum: ['public', 'friends', 'private', 'specific'], default: 'public' })
  privacy: string; // ừ thì cái này dóng quyền riêng từ bên fở pò á


  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })  
  allowedUsers: Types.ObjectId[];


}

export const PostSchema = SchemaFactory.createForClass(Post);
