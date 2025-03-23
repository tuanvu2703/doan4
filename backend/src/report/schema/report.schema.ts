import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { User } from '../../user/schemas/user.schemas';
import { Post } from '../../post/schemas/post.schema';

@Schema({ timestamps: true })
export class Report extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: User;

  @Prop({ type: String, enum: ['User', 'Post'], required: true })
  type: 'User' | 'Post';

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

  @Prop({
    type: String,
    required: false,
    enum: ['approve' , 'reject'],
  })
  implementation?: string; 


  @Prop({ type: Date, required: false })
    appealDeadline?: Date;

  @Prop({ type: Boolean, default: false })
    isAppealed: boolean;

}

export const ReportSchema = SchemaFactory.createForClass(Report);
