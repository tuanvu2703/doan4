
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'YourNewPass', required: true })
  @IsString()
  @MinLength(6)
  newPassword: string;

}