import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { AuthorDto } from './author.dto';
import { GroupDto } from './group.dto';

export class ProjectedPostDto {
  @ApiProperty({ type: String, description: 'ID bài đăng' })
  _id: Types.ObjectId;

  @ApiProperty({ type: String, required: false, description: 'Nội dung bài đăng' })
  content?: string;

  @ApiProperty({ type: [String], required: false, description: 'URLs hình ảnh' })
  img?: string[];

  @ApiProperty({ type: String, required: false, description: 'URL ảnh GIF' })
  gif?: string;

  @ApiProperty({ type: String, required: false, description: 'Quyền riêng tư' })
  privacy?: string;

  @ApiProperty({ type: Date, description: 'Thời gian tạo' })
  createdAt: Date;

  @ApiProperty({ type: Number, description: 'Số lượt thích' })
  likesCount: number;

  @ApiProperty({ type: Number, description: 'Số lượt bình luận' })
  commentsCount: number;

  @ApiProperty({ type: AuthorDto, description: 'Thông tin tác giả' })
  author: AuthorDto;

  // Cho phép group là null hoặc không có
  @ApiProperty({ type: () => GroupDto, nullable: true, required: false, description: 'Thông tin nhóm (nếu có)' })
  group?: GroupDto | null;
}