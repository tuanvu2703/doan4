import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';




export class CommentDto {


    // @ApiProperty()
    @IsString()
    @IsOptional()
    readonly content?: string;

    // @ApiProperty()
    // @IsNotEmpty()
    // @IsString()
    // readonly author: string;
                 
    // @ApiProperty()
    // @IsNumber()
    // readonly likes: number;
    // @ApiProperty()
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


