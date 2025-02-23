import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsArray, IsNotEmpty, IsObject, ArrayMinSize } from "class-validator"
import { Types } from "mongoose";



export class CreateGroupDto{

    @ApiProperty({
        example: 'group name',
        required: false,
        type: 'string',
      })
    @IsNotEmpty()
    @IsString()
    readonly name: string;
    
    @ApiProperty({
        type: 'array',
        items: { type: 'string', format: 'binary' }, 
        required: false,
      })
    @IsOptional()
    @IsString()
    readonly avatarGroup: string;

    @ApiProperty({
        example: ['user1_id', 'user2_id'],
        required: true,
        type: 'array',
        items: { type: 'string' },
      })
    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(1)
    readonly participants: Types.ObjectId[];
}