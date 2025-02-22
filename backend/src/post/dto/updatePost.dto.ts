import { IsEnum, IsOptional, IsString, ValidateIf, IsArray } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdatePostDto {
  @ApiProperty({
    example: 'ngày nắng thì phải mở máy lạnh',
    required: false,
    type: 'string',
  })
  @ValidateIf((o) => !o.img)
  @IsOptional()
  @IsString()
  readonly content?: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' }, // Cho phép upload nhiều file
    required: false,
  })
  @ValidateIf((o) => !o.content)
  @IsOptional()
  img?: Express.Multer.File[];

  @ApiProperty({
    example: 'public, private, friends, specific',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsEnum(['public', 'friends', 'private', 'specific'])
  readonly privacy?: string;

  @ApiProperty({
    example: ['user1_id', 'user2_id'],
    required: false,
    type: 'array',
    items: { type: 'string' },
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng
  allowedUsers?: string[];
}
