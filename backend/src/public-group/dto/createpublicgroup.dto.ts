import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsEnum, IsArray, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class CreatePublicGroupDto {
  @ApiProperty({
    description: "Tên của nhóm",
    example: "Nhóm Test",
  })
  @IsString()
  @IsNotEmpty()
  groupName: string;

  @ApiProperty({
    type: String,
    description: "Danh sách quy tắc của nhóm, gửi dưới dạng chuỗi phân tách bằng dấu phẩy (VD: rule1,rule2,rule3)",
    example: "rule1,rule2,rule3,rule4,rule5",
  })
  @IsNotEmpty()
  @Transform(({ value }) => {
    // Log giá trị thô của rules
    console.log("Raw rules value DTO :", value);

    // Xử lý trường hợp value không phải chuỗi
    if (typeof value !== "string") {
      return []; // Trả về mảng rỗng để tránh lỗi, sẽ validate sau
    }

    try {
      return value.split(",").map((ruleText: string) => ruleText.trim());
    } catch (error) {
      return []; // Trả về mảng rỗng nếu parse thất bại
    }
  })
  @IsArray({ message: "rules must be an array of strings" })
  @IsString({ each: true, message: "each rule must be a string" })
  rules: string[];

  @ApiProperty({
    description: "Tóm tắt về nhóm (tương ứng với description trong form-data)",
    example: "public",
  })
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ApiProperty({
      type: 'string',
      format: 'binary', 
    })
    files: any;

  @ApiProperty({
    enum: ["public", "private"],
    description: "Tính công khai của nhóm",
    example: "private",
  })
  @IsEnum(["public", "private"])
  visibility: "public" | "private";

  @ApiProperty({
    enum: ["everyone", "invited"],
    description: "Khả năng khám phá nhóm",
    example: "everyone",
  })
  @IsEnum(["everyone", "invited"])
  discoverability: "everyone" | "invited";

  @ApiProperty({
    type: String,
    description: "Các thẻ (tags) liên quan đến nhóm, gửi dưới dạng chuỗi phân tách bằng dấu phẩy",
    example: "nhóm hội thảo",
  })
  @IsString()
  @IsNotEmpty()
  tags: string;
}