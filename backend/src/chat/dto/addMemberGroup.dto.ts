import { IsEnum, IsOptional, IsString, IsArray, IsNotEmpty, IsObject } from "class-validator"
import { Types } from "mongoose";



export class addMembersToGroupDto{
    
    @IsNotEmpty()
    @IsArray()
    @IsObject()
    readonly participants: Types.ObjectId[];
}