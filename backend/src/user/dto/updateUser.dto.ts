import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";


export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MaxLength(50)
    readonly firstName: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    readonly lastName: string;

    @IsOptional()
    @IsString()
    @MaxLength(70)
    readonly address: string;

    @IsOptional()
    @IsBoolean()
    readonly gender: string;

    @IsOptional()
    @IsString()
    @MaxLength(20)
    readonly birthday: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    readonly email: string;
    
}