import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsArray, IsNotEmpty, ValidateIf } from "class-validator"
import { Types } from "mongoose";



export class SendMessageDto{


    @ApiProperty({
        example: 'your content',
        required: false,
        type: 'string',
        })
    @ValidateIf((o) => !o.mediaURL)
    @IsString()
    @IsOptional()
    readonly content?: string

    @ApiProperty({
        type: 'array',
        items: { type: 'string', format: 'binary' }, 
        required: false,
      })
    @ValidateIf((o) => !o.content) 
    @IsString({ each: true })
    @IsOptional()
    readonly mediaURL?: string;
    
}