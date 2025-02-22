import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: '0781721821', required: false })
  @ValidateIf((o) => !o.email) // Chỉ validate nếu email không được cung cấp
  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required if email is not provided' })
  
  readonly numberPhone?: string;

  @ApiProperty({ example: 'uchihanemo@gmail.com', required: false })
  @ValidateIf((o) => !o.numberPhone) // Chỉ validate nếu số điện thoại không được cung cấp
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required if phone number is not provided' })
  readonly email?: string;

  @ApiProperty({ example: 'Uchiha', required: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly firstName: string;

  @ApiProperty({ example: 'Nemo', required: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly lastName: string;

  @ApiProperty({ example: 'Cần thơ', required: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(70)
  readonly address: string;

  @ApiProperty({ example: 'True if u male !=', required: true })
  @IsBoolean()
  @IsNotEmpty()
  readonly gender: boolean;

  @ApiProperty({ example: '16/6/2003', required: true })
  @IsString()
  @IsNotEmpty()
  readonly birthday: string;

  @ApiProperty({ example: 'YourPassWord', required: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  readonly password: string;
}
