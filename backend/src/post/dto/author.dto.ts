import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class AuthorDto {
  @ApiProperty({ type: String, description: 'ID của tác giả' })
  _id: Types.ObjectId;

  @ApiProperty({ type: String, required: false, description: 'Tên' })
  firstName?: string;

  @ApiProperty({ type: String, required: false, description: 'Họ' })
  lastName?: string;

  @ApiProperty({ type: String, required: false, description: 'URL ảnh đại diện' })
  avatar?: string;
}