import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    @MinLength(8)
    readonly currentPassword: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    @MinLength(8)
    readonly newPassword: string;
}