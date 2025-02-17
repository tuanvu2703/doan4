import { IsEnum, IsOptional, IsString, IsArray, IsNotEmpty, IsObject } from "class-validator"
import { Types } from "mongoose";



export class CreateGroupDto{


    @IsNotEmpty()
    @IsString()
    readonly name: string;
    
    @IsOptional()
    @IsString()
    readonly avatarGroup: string;

    @IsNotEmpty()
    @IsString()
    readonly owner: Types.ObjectId;

    @IsOptional()
    @IsArray()
    @IsObject()
    readonly participants: Types.ObjectId[];
}