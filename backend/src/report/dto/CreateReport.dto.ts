import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateReportDto {
    @ApiProperty({ enum: ['user', 'post'], description: 'Loại báo cáo (user hoặc post)' })
    @IsEnum(['user', 'post'])
    type: 'user' | 'post';

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

