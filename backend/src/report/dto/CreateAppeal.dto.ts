import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAppealDto {
  @ApiProperty({
    description: 'ID của bài viết bị báo cáo',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId()
  @IsNotEmpty()
  postId: string;

  @ApiProperty({
    description: 'Lý do kháng cáo',
    example: 'Tôi cho rằng báo cáo này không chính xác vì nội dung của tôi tuân thủ quy định.',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({
    description: 'Danh sách đường dẫn file đính kèm (tùy chọn)',
    example: ['https://example.com/file1.jpg', 'https://example.com/file2.pdf'],
    required: false,
  })
  @IsOptional()
  @IsString({ each: true })
  attachments?: string[];
}