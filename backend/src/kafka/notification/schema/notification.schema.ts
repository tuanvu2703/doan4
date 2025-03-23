import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schemas';



@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId: User; // người nhận thông báo

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: User; // người thực hiện thông báo 

  @Prop({ type: [Types.ObjectId], ref:'User' ,required: false }) // Thêm targetIds nếu cần
  targetIds?: Types.ObjectId[];

  @Prop({ required: true, type: Object })
  data: Record<string, any>;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Date, default: () => new Date(Date.now() + 31 * 24 * 60 * 60 * 1000), index: { expires: '31d' } }) 
  expiresAt: Date; 
}


export const NotificationSchema = SchemaFactory.createForClass(Notification);
