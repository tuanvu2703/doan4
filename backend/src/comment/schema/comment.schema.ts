import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { validate } from 'class-validator';

@Schema({
  timestamps: true, // Tự động thêm createdAt và updatedAt
})
export class Comment extends Document {
  @Prop()
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  post: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Comment' }] })
  replyTo: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  likes: string[];

  @Prop({ type: [String], default: [] })
  img: string[];

}

export const CommentSchema = SchemaFactory.createForClass(Comment);
