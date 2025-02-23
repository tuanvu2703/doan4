import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'uchihanemo@gmail.com', required: false })
  @ValidateIf((o) => !o.numberPhone) // Chỉ kiểm tra nếu numberPhone không có
  @IsString()
  @MaxLength(50, { message: 'Email cần tối đa 50 ký tự' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  readonly email?: string;

  @ApiProperty({ example: '0781721821', required: false })
  @ValidateIf((o) => !o.email) // Chỉ kiểm tra nếu email không có
  @IsString()
  @MaxLength(13, { message: 'Số điện thoại cần tối đa 13 ký tự' })
  readonly numberPhone?: string;

  @ApiProperty({ example: 'yourpassword' })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu là bắt buộc' })
  @MaxLength(60, { message: 'Mật khẩu tối đa 60 ký tự' })
  readonly password: string;
}
