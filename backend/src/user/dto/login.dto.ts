import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'you email need 50 character' })
  @IsEmail({}, { message: 'Invalid email format' }) 
  readonly email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(13, { message: 'you phone number need 50 character' })
  readonly numberPhone?: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MaxLength(60, { message: 'Password need 60 character' })
  readonly password: string;
}
