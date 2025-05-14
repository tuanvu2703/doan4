
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {

  @ApiProperty({ example: 'tienyeuai2600@gmail.com', required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'YourOldPass', required: true })
  @IsString()
  @MaxLength(6)
  otp: string;
  

  @ApiProperty({ example: 'YourNewPass', required: true })
  @IsString()
  @MinLength(6)
  newPassword: string;

}