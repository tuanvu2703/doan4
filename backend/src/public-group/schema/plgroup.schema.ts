import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { User } from 'src/user/schemas/user.schemas';

@Schema({
  timestamps: true,
})
export class PublicGroup extends Document {

  @Prop()
  groupName: string;

  // @Prop()
  // description: string;

  // @Prop({ type: Types.ObjectId, ref: 'User' , required: true })
  // author: User;

  @Prop()
  avatargroup: string;

  @Prop({
    type: [{ ruleText: { type: String }, order: { type: Number } }],
    default: [],
  })
  rules: { ruleText: string; order: number }[];

  @Prop({
    enum: ['public', 'private'],
    required: true,
  })
  typegroup: string;

}


export const PublicGroupSchema = SchemaFactory.createForClass(PublicGroup);

