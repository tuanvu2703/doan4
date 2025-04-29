import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsEnum, IsArray, IsString, } from "class-validator";
import {HttpException, HttpStatus } from "@nestjs/common";
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
  @IsNotEmpty({ message: "rules must not be empty" })
  @Transform(({ value }) => {
    console.log("Raw rules value DTO:", value);
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value !== "string") {
      throw new HttpException("rules must be a string", HttpStatus.BAD_REQUEST);
    }
    try {
      const rules = value.split(",").map((ruleText: string) => ruleText.trim());
      if (rules.length === 0 || rules.every((rule) => rule === "")) {
        throw new HttpException("rules must contain at least one non-empty rule", HttpStatus.BAD_REQUEST);
      }
      console.log("Transformed rules DTO:", rules);
      return rules;
    } catch (error) {
      throw new HttpException("Invalid format for rules", HttpStatus.BAD_REQUEST);
    }
  })
  @IsArray({ message: "rules must be an array of strings" })
  @IsString({ each: true, message: "each rule must be a string" })
  @IsNotEmpty({ each: true, message: "each rule must not be empty" })
  rules: string[];

  @ApiProperty({
    description: "Tóm tắt về nhóm (tương ứng với description trong form-data)",
    example: "public",
  })
  @IsString()
  @IsNotEmpty()
  summary: string;

  @ApiProperty({
    type: "string",
    format: "binary",
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
    example: "trò chơi điện tử",
  })
  @IsString()
  @IsNotEmpty()
  tags: string;
}