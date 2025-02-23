import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsArray, IsNotEmpty, IsObject } from "class-validator"
import { Types } from "mongoose";



export class addMembersToGroupDto{
    
      @ApiProperty({
        example: ['user1_id', 'user2_id'],
        required: true,
        type: 'array',
        items: { type: 'string' },
      })
    @IsNotEmpty()
    @IsArray()
    @IsObject()
    readonly participants: Types.ObjectId[];
}