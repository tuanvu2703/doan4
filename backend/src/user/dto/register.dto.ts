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

export class RegisterDto {
  @ValidateIf((o) => !o.email) // Chỉ validate nếu email không được cung cấp
  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required if email is not provided' })
  
  readonly numberPhone?: string;

  @ValidateIf((o) => !o.numberPhone) // Chỉ validate nếu số điện thoại không được cung cấp
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required if phone number is not provided' })
  readonly email?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly lastName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(70)
  readonly address: string;

  @IsBoolean()
  @IsNotEmpty()
  readonly gender: boolean;

  @IsString()
  @IsNotEmpty()
  readonly birthday: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  readonly password: string;
}
