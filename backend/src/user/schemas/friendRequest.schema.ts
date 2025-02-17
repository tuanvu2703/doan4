import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { User } from './user.schemas';

@Schema({
  timestamps: true,
})
export class FriendRequest extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    sender: User;
  
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    receiver: User;
  
    @Prop({ required: true })
    status: string ;
}

export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);
