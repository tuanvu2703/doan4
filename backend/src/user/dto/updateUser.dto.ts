import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserDto {
    @ApiProperty({ example: 'Uchiha', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    readonly firstName: string;

    @ApiProperty({ example: 'Nemo', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    readonly lastName: string;

    @ApiProperty({ example: 'Cần Thơ', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(70)
    readonly address: string;

    @ApiProperty({ example: 'True or False', required: false })
    @IsOptional()
    @IsBoolean()
    readonly gender: string;

    @ApiProperty({ example: '16/6/2003', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    readonly birthday: string;

    @ApiProperty({ example: 'uchihanemo@gmail.com', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    readonly email: string;
    
}