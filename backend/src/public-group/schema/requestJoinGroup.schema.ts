import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { User } from 'src/user/schemas/user.schemas';
import { PublicGroup } from './plgroup.schema';


@Schema({
  timestamps: true,
})
export class RequestJoinGroup extends Document {

    @Prop({ type: Types.ObjectId, ref: 'PublicGroup' , required: true })
    group: PublicGroup;
    
    @Prop({ type: Types.ObjectId, ref: 'User' , required: true })
    sender: User;
    
    @Prop({
        enum: ['pending', 'accept', 'reject'],
        required: true,
    })
    status: string;

}

export const RequestJoinGroupSchema = SchemaFactory.createForClass(RequestJoinGroup);