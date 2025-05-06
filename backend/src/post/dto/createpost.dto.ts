import { IsEnum, IsOptional, IsString, ValidateIf, IsArray, Validate } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

class AtLeastOneField {
  validate(value: any, args: any) {
    const obj = args.object;
    return !!(obj.content || obj.files?.length > 0 || obj.gif);
  }

  defaultMessage() {
    return 'At least one of content, files or gif must be provided';
  }
}

export class CreatePostDto {

  @ApiProperty({
    example: '67eas9128301dbsa',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsString()
  readonly group?: string;


  @ApiProperty({
    example: 'ngày nắng thì phải mở máy lạnh',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsString()
  readonly content?: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
  })
  @IsOptional()
  files?: Express.Multer.File[];

  @ApiProperty({
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsString()
  readonly gif?: string;

  @ApiProperty({
    example: 'public, private, friends, specific',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsEnum(['public', 'friends', 'private', 'specific','thisGroup'])
  readonly privacy?: string;

  @ApiProperty({
    example: ['user1_id', 'user2_id'],
    required: false,
    type: 'array',
    items: { type: 'string' },
  })
  @IsOptional()
  @IsString({ each: true })
  allowedUsers?: string[];

  @Validate(AtLeastOneField)
  validateAtLeastOne?: any;
}
