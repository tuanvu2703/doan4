// src/schemas/groupMessage.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schemas';
import { Group } from './group.schema';

@Schema({
    timestamps: true
  })

  export class RoomChat extends Document {
  
  
    @Prop({ type: [{type: Types.ObjectId, ref: 'User'}] })
    participants: User[];
  

  
  }

  export const RoomChatSchema = SchemaFactory.createForClass(RoomChat);