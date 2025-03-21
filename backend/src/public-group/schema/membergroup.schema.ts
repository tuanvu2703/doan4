import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { User } from 'src/user/schemas/user.schemas';
import { PublicGroup } from './plgroup.schema';


@Schema({
  timestamps: true,
})
export class MemberGroup extends Document {

  @Prop({ type: Types.ObjectId, ref: 'PublicGroup' , required: true })
  group: PublicGroup;

  @Prop({ type: Types.ObjectId, ref: 'User' , required: true })
  member: User;

  @Prop({
    enum: ['owner', 'member', 'admin'],
    required: true,
    default: 'member',
  })
  role: string;   //role: 0 - member, 1 - admin, 2 - owner

  @Prop({
    default: false,
  })
  blackList: boolean; //blackList: 0 - not in black list, 1 - in black list

}


export const MemberGroupSchema = SchemaFactory.createForClass(MemberGroup);