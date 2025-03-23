import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateReportDto {
    @ApiProperty({ enum: ['User', 'Post'], description: 'Loại báo cáo (user hoặc post)' })
    @IsEnum(['User', 'Post'])
    type: 'User' | 'Post';

    @ApiProperty({ description: 'ID của người hoặc bài viết bị báo cáo' })
    @IsString()
    reportedId: string;

    @ApiProperty({ 
        enum: ['spam', 'hate_speech', 'nudity', 'fake_news', 'violence', 'other'], 
        description: 'Lý do báo cáo'
    })
    @IsEnum(['spam', 'hate_speech', 'nudity', 'fake_news', 'violence', 'other'])
    reason: string;
}

