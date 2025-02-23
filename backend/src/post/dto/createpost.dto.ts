import { IsEnum, IsOptional, IsString, IsArray, ValidateIf } from "class-validator"
import { Types } from "mongoose";
import { Transform } from "class-transformer"

export class CreatePostDto{

    @ValidateIf((o) => !o.img) 
    @IsOptional()
    @IsString()
    readonly content: string

    @ValidateIf((o) => !o.content) 
    @IsOptional()
    @IsString()
    readonly img?:string[]

    @IsOptional()
    @IsEnum(['public', 'friends', 'private', 'specific'])
    readonly privacy: string;
  
    @IsOptional()
    @IsString()
    allowedUsers?: string[];
    
}