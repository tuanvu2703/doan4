import { IsOptional, IsString, IsEnum, IsArray } from "class-validator"
import { Types } from "mongoose";

export class settingPrivacyDto{

    @IsOptional()
    @IsEnum(['public', 'friends', 'private', 'specific'])
    readonly privacy: string;
  
    @IsOptional()
    @IsArray()
    readonly allowedUsers?: Types.ObjectId[];
}