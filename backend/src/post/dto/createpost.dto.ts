import { IsEnum, IsOptional, IsString, IsArray, ValidateIf } from "class-validator"
import { Types } from "mongoose";



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
    @IsArray()
    readonly allowedUsers?: Types.ObjectId[];
    
}