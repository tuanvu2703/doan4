import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { User } from 'src/user/schemas/user.schemas';
import { Report } from './report.schema';

@Schema({ timestamps: true })
export class Appeal extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Report', required: true })
  reportId: Report; 

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  appellant: User; 

  @Prop({ type: String, required: true })
  reason: string; 

  @Prop([{ type: String, required: false }])
  attachments?: string[];
  
  @Prop({ required: true, default: 'pending', enum: ['pending', 'resolved',] })
  status: string;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    required: true,
  })
  implementation?: string; 

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  handledBy?: User;
}

export const AppealSchema = SchemaFactory.createForClass(Appeal);