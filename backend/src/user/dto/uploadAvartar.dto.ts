import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadAvatarDto {
  @ApiProperty({
    type: 'string',
    format: 'binary', // Định dạng file upload trong Swagger
  })
  avatar: any; // Không cần validation vì file sẽ do Multer xử lý

}
