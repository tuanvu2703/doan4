import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ReportDataDto {
    @ApiProperty({ enum: ['user', 'post'], description: 'Loại báo cáo (user hoặc post)' })
    @IsEnum(['user', 'post'])
    type: 'user' | 'post';

    @ApiPropertyOptional({ description: 'ID của người bị báo cáo (chỉ có nếu type = user)' })
    @IsOptional()
    @IsString()
    reportedPerson?: string;

    @ApiPropertyOptional({ description: 'ID của bài viết bị báo cáo (chỉ có nếu type = post)' })
    @IsOptional()
    @IsString()
    reportedPost?: string;

    @ApiProperty({ description: 'Lý do báo cáo' })
    @IsString()
    reason: string;
}

export class CreateReportDto {
    @ApiProperty({ description: 'ID của người gửi báo cáo' })
    @IsString()
    sender: string;

    @ApiProperty({ description: 'Thông tin báo cáo', type: ReportDataDto })
    @ValidateNested()
    @Type(() => ReportDataDto)
    data: ReportDataDto;

    @ApiPropertyOptional({ description: 'Trạng thái báo cáo (mặc định là pending)' })
    @IsString()
    @IsOptional()
    status?: string;

    @ApiPropertyOptional({ description: 'Nội dung xử lý báo cáo' })
    @IsString()
    @IsOptional()
    implementation?: string;
}
