import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/user/schemas/user.schemas';



@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  targetUserId?: User;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: User; // người thực hiện thông báo 

  @Prop({ type: [Types.ObjectId], ref:'User' ,required: false }) 
  targetUserIds?: Types.ObjectId[];

  @Prop({ required: true, type: Object })
  data: Record<string, any>;

  @Prop({ type: [Types.ObjectId], ref: 'User', required: false })
  readBy: Types.ObjectId[];

  @Prop({ type: Date, default: () => new Date(Date.now() + 31 * 24 * 60 * 60 * 1000), index: { expires: '31d' } }) 
  expiresAt: Date; 
}


export const NotificationSchema = SchemaFactory.createForClass(Notification);
