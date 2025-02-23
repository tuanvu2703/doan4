import { IsEnum, IsOptional, IsString, IsArray, IsNotEmpty, IsObject, ArrayMinSize } from "class-validator"
import { Types } from "mongoose";



export class CreateGroupDto{

    @IsNotEmpty()
    @IsString()
    readonly name: string;
    
    @IsOptional()
    @IsString()
    readonly avatarGroup: string;

    @IsArray()
    @ArrayMinSize(1)
    readonly participants: Types.ObjectId[];
}