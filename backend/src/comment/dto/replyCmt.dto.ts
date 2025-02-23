import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class ReplyCmtDto {


    @ApiProperty({
        example: 'ngày nắng thì phải mở máy lạnh',
        required: false,
        type: 'string',
        })
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

    @ApiProperty({
        type: 'array',
        items: { type: 'string', format: 'binary' }, 
        required: false,
      })
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


