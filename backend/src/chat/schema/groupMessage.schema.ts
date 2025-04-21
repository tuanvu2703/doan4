// src/schemas/groupMessage.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schemas';
import { Group } from './group.schema';

@Schema({
    timestamps: true
  })

export class GroupMessage extends Document {
  //_id message
  //khi có người đọc tin nhắn thì dựa vào _id để thêm người đó vào mảng reading

  @Prop({ type: Types.ObjectId, ref: 'Group', required: true })
  group: Group;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: User;

  @Prop()
  content: string;

  @Prop() 
  mediaURL: string[];

  
  @Prop({ type: Types.ObjectId, ref: 'User' })
  reading: User[];

}

export const GroupMessageSchema = SchemaFactory.createForClass(GroupMessage);
