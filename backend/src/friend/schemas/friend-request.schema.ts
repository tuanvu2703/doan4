import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

export type FriendRequestDocument = FriendRequest & Document;

@Schema({
    collection: 'friendrequests',
    timestamps: true,
  })
  export class FriendRequest {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    sender: Types.ObjectId;  // Updated from 'requester' to 'sender'
    
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    receiver: Types.ObjectId;  // Updated from 'recipient' to 'receiver'
    
    @Prop({ type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' })
    status: string;
  
  }
  
export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);
