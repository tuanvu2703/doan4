import {
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
  } from 'class-validator';
  
  export class UploadCoverImgDto {

    @IsString()
    @IsNotEmpty({ message: 'please upload 1 file img ' })
    readonly coverImage : string;
  
    @IsString()
    @IsNotEmpty({ message: 'i do not know who are you, please login or provide your token' })
    readonly userid: string;

  }
  