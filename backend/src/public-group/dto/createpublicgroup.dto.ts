import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePublicGroupDto {
  @ApiProperty({ description: 'Tên của nhóm', example: 'Cộng đồng lập trình viên' })
  @IsString()
  groupName: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File ảnh đại diện của nhóm (upload qua field files)',
  })
  files: any; 

  @ApiProperty({
    description: 'Danh sách quy tắc của nhóm, cách nhau bởi dấu phẩy',
    example: 'Không spam, Tôn trọng lẫn nhau',
  })
  @IsString()
  rules: string; 

  @ApiProperty({ description: 'Loại nhóm', enum: ['public', 'private'], example: 'public' })
  @IsEnum(['public', 'private'])
  typegroup: string;
}


export class RuleDto {
  ruleText: string;
}