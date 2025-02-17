import {
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
  } from 'class-validator';
  
  export class UploadAvatarDto {

    @IsString()
    @IsNotEmpty({ message: 'please upload 1 file img ' })
    readonly avatar : string;
  
    @IsString()
    @IsNotEmpty({ message: 'i do not know who are you, please login or provide your token' })
    readonly userid: string;

  }
  