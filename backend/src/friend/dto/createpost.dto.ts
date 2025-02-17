import { IsEnum, IsOptional, IsString, IsArray } from "class-validator"
import { Types } from "mongoose";



export class CreatePostDto{

    @IsOptional()
    @IsString()
    readonly content: string

    @IsOptional()
    @IsEnum(['waiting', 'cancel', 'block'])
    readonly privacy: string;
  
    // @IsOptional()
    // @IsArray()
    // readonly allowedUsers?: Types.ObjectId[];
    
}