import { ApiProperty } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
  } from 'class-validator';
  
  export class UploadCoverImgDto {
      @ApiProperty({
        type: 'string',
        format: 'binary',
      })
    @IsString()
    @IsNotEmpty({ message: 'please upload 1 file img ' })
    readonly coverImage : string;
  

  }
  