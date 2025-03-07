import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ImplementationDto {


    // @ApiProperty({ description: 'ID của người hoặc bài viết bị báo cáo' })
    // @IsString()
    // reportedId: string;

    @ApiProperty({ 
        enum: ['approve', 'reject'], 
        description: 'Lý do báo cáo'
    })
    @IsEnum(['approve', 'reject'])
    implementation: string;
}

