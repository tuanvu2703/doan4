import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { User } from '../../user/schemas/user.schemas';
import { Post } from '../../post/schemas/post.schema';

@Schema({ timestamps: true })
export class Report extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: User;

  @Prop({ type: String, enum: ['user', 'post'], required: true })
  type: 'user' | 'post';

  @Prop({ type: Types.ObjectId, required: true, refPath: 'type' })
  reportedId: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: ['spam', 'hate_speech', 'nudity', 'fake_news', 'violence', 'other'], 
    required: true 
  })
  reason: string;

  @Prop({ required: true, default: 'pending', enum: ['pending', 'resolved', 'rejected'] })
  status: string;

  @Prop()
  implementation?: string; 
}

export const ReportSchema = SchemaFactory.createForClass(Report);
