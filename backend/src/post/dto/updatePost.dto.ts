import { IsOptional, IsString, IsArray, IsEnum, ValidateIf } from "class-validator"
import { Types } from "mongoose";

export class UpdatePostDto{

    @IsOptional()
    @IsString()
    readonly content: string

    @IsOptional()
    @IsString()
    readonly img?:string[]
}