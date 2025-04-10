import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class GroupDto {
    @ApiProperty({ type: String, description: 'ID của nhóm' })
    _id: Types.ObjectId;

    @ApiProperty({ type: String, required: false, description: 'Tên nhóm' })
    groupName?: string;

    @ApiProperty({ type: String, required: false, description: 'URL ảnh đại diện nhóm' })
    avatargroup?: string;

    @ApiProperty({ type: String, required: false, description: 'Loại nhóm' })
    typegroup?: string;
}