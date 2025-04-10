import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class FeedCursorDto {
    
    @ApiProperty({ // Mô tả cho Swagger
        required: false,
        type: Number,
        description: 'Điểm ranking của bài viết cuối cùng ở trang trước'
    })
    @IsOptional() // Tham số này là tùy chọn
    @Type(() => Number) // Tự động chuyển đổi string sang number
    @IsNumber() // Phải là kiểu number
    lastRankingScore?: number;

    @ApiProperty({
        required: false,
        type: String,
        format: 'date-time', // Định dạng gợi ý là ISO 8601
        description: 'Thời gian tạo (ISO string) của bài viết cuối cùng ở trang trước'
    })
    @IsOptional()
    @IsDateString() // Phải là một chuỗi ngày tháng hợp lệ (ISO 8601)
    lastCreatedAt?: string; // Giữ là string để IsDateString hoạt động

    @ApiProperty({
        required: false,
        type: String,
        description: 'ID của bài viết cuối cùng ở trang trước'
    })
    @IsOptional()
    @IsString() // Phải là string (kiểm tra ObjectId ở logic sau)
    lastId?: string;
}