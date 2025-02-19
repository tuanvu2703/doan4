
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schemas';


@Schema({
    timestamps: true,
})
export class Message extends Document{

  //1 tin nhắn có thể gửi từ người này đến người kia
  //tin nhắn chia ra sender và receiver 
  // hơi khó để hiểu nhưng cứ hiểu là 1 tin nhắn có thể gửi từ người này đến người kia
  // sau này sẽ rất khó để có thể lấy được đâu là tin nhắn mà bản thân đã gửi 
  // và tin nhắn mà bản thân đã nhận
  // tuy phức tạp nhưng tạm thời chưa có giải pháp 
  // content là nội dung tin nhắn đây chỉ có text 
  // mediaURL là link ảnh hoặc video 
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: User

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiver: User;

  @Prop()
  content: string;

  @Prop()
  mediaURL: string[];


  @Prop({enum: ['sent', 'received', 'seen'], default: 'sent'})
  status: string;

  @Prop()
  reading: boolean;

  @Prop({default: true})
  isLive: boolean;

}

export const MessageSchema = SchemaFactory.createForClass(Message)