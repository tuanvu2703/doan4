import { ApiProperty } from '@nestjs/swagger';
// Sử dụng FeedCursorDto cho Swagger vì nó là class
import { FeedCursorDto } from './feedCursor.dto';
import { ProjectedPostDto } from './projected-post.dto';

export class PaginatedFeedResultDto {
  @ApiProperty({ type: [ProjectedPostDto], description: 'Danh sách bài đăng của trang hiện tại' })
  posts: ProjectedPostDto[];

  @ApiProperty({ type: FeedCursorDto, nullable: true, description: 'Cursor để lấy trang tiếp theo (null nếu hết)' })
  nextCursor: FeedCursorDto | null;
}