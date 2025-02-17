import { IsEnum, IsOptional, IsString, IsArray, IsNotEmpty, ValidateIf } from "class-validator"
import { Types } from "mongoose";



export class SendMessageDto{



    @ValidateIf((o) => !o.mediaURL)
    @IsString()
    @IsOptional()
    readonly content?: string

    @ValidateIf((o) => !o.content) 
    @IsString({ each: true })
    @IsOptional()
    readonly mediaURL?: string;
    
}