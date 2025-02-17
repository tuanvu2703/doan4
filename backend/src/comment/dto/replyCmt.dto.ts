import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class ReplyCmtDto {


    @IsString()
    @IsNotEmpty()
    readonly content?: string;

    // @ApiProperty()
    // @IsNotEmpty()
    // @IsString()
    // readonly author: string;
                 
    // @ApiProperty()
    // @IsNumber()
    // readonly likes: number;

    @IsOptional()
    @IsString()
    readonly img?:string[]
    
    // @ApiProperty()
    // @IsNotEmpty()
    // readonly replyTo?: string;

    // @ApiProperty()
    // @IsNotEmpty()
    // readonly commentId: string;
}


