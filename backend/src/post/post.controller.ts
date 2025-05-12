import { Put, Body, Controller, Get, HttpException, HttpStatus,
    Param, Post, Req, UploadedFiles, UseGuards,
    UseInterceptors, Delete, Query, Logger,
    Inject,
    ParseIntPipe,
    DefaultValuePipe,
    Patch,
} from '@nestjs/common';
import { PostService } from './post.service';
import { AuthGuardD } from '../user/guard/auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreatePostDto } from './dto/createpost.dto';
import { CurrentUser } from '../user/decorator/currentUser.decorator';
import { User } from '../user/schemas/user.schemas';
import { OptionalAuthGuard } from '../user/guard/optional.guard';
import { EventService } from 'src/event/event.service';
import { settingPrivacyDto } from './dto/settingPrivacy.dto';
import { Types } from 'mongoose';
import { ProducerService } from 'src/kafka/producer/kafka.Producer.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags, 
    ApiQuery,
    ApiResponse
 } from '@nestjs/swagger';
import { FeedCursor } from './interface/FeedcurSord.interface';
import { PaginatedFeedResult } from './interface/FeedcurSord.interface';
import { ParseCursorPipe } from './pipes/parse-cursor.pipe';
import { UserService } from 'src/user/user.service';
import { AuthorDto } from './dto/author.dto';
import { GroupDto } from './dto/group.dto';
import { ProjectedPostDto } from './dto/projected-post.dto';
import { PaginatedFeedResultDto } from './dto/paginated-feed-result.dto';
import { RolesGuard } from 'src/user/guard/role.guard';


@ApiTags('post')
@Controller('post')
export class PostController {
    private readonly logger = new Logger(PostController.name);
    constructor(
        private postService: PostService,
        private eventService: EventService,
        private producerService: ProducerService,
        private userService: UserService,
    ) { }

    @Post('createPost')
    @UseGuards(AuthGuardD)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload your image' })
    @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]))
    async createPost(
        @CurrentUser() currentUser: User,
        @Body() createPostDto: CreatePostDto,
        @UploadedFiles() files: { files: Express.Multer.File[] }
    ) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
    
        const userId = new Types.ObjectId(currentUser._id.toString());
        const newPost = await this.postService.createPost(createPostDto, userId, files.files);
        const friendList = await this.userService.getMyFriend(userId);
        const maxFriendsToNotify = Math.min(5, friendList.length);
        const randomFriends = friendList
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.max(4, maxFriendsToNotify));
    
        // Lấy danh sách targetIds
        const targetIds = randomFriends
            .map(friend => friend.sender?._id || friend.receiver?._id)
            .filter(id => id); 
    

        const notification = {
            type: 'post',
            ownerId: userId,
            targetIds: targetIds, 
            data: {
                postId: newPost._id,
                message: `New post from ${currentUser.firstName} ${currentUser.lastName}`,
                avatar: currentUser.avatar,
                timestamp: new Date(),
            },
        };

        await this.producerService.sendMessage('mypost', notification);
    
        return newPost;
    }

    @Get('testOptionalGuard')
    @UseGuards(OptionalAuthGuard)
    testOptionalGuard(@CurrentUser() currentUser: User) {

        return currentUser;
    }

    @Put('updatePost/:postid')
    @UseGuards(AuthGuardD)
    @ApiBearerAuth() 
    @ApiConsumes('multipart/form-data') 
    @ApiOperation({ summary: 'Upload your image' })
    @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]))
    async updatePost(
        @CurrentUser() currentUser: User,
        @Param('postid') postid: string,
        @Body() updatePostDto: CreatePostDto,
        @UploadedFiles() files: { files: Express.Multer.File[] }
    ) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
        return await this.postService.updatePost(postid, updatePostDto, currentUser._id.toString(), files?.files);
    }


    @Delete('deletePost/:postid')
    @UseGuards(AuthGuardD)
    @ApiBearerAuth() 
    async deletePost(
        @CurrentUser() currentUser: User,
        @Param('postid') postid: string,
    ) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
        return await this.postService.deletePost(postid, currentUser._id.toString());
    }


    @Put(':id/like')
    @UseGuards(AuthGuardD)
    @ApiBearerAuth() 
    async likePost(@Param('id') id: string, @CurrentUser() currentUser: User) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }

        try {
            const swpostId = new Types.ObjectId(id);
            const swUserId = new Types.ObjectId(currentUser._id.toString());
            const {authorId, post} = await this.postService.likePost(swpostId,swUserId);
            const swAuthorId = new Types.ObjectId(authorId.toString());
            const notification = {
                type: 'like',
                userId: swAuthorId, 
                ownerId: swUserId, 
                data: {
                  postId: new Types.ObjectId(id), 
                  message: `New like from ${currentUser.firstName} ${currentUser.lastName}`,
                  avatar: currentUser.avatar,
                  timestamp: new Date(),
                },
              };
              
              await this.producerService.sendMessage('mypost', notification);
              
            return post;
        } catch (error) {
            throw new HttpException('An error occurred while liking post', HttpStatus.INTERNAL_SERVER_ERROR);

        }

    }

    @Put(':id/unlike')
    @ApiBearerAuth() 
    @UseGuards(AuthGuardD)
    async unlikePost(
        @Param('id') id: Types.ObjectId, 
        @CurrentUser() currentUser: User
    ) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
        const convertedUserId = new Types.ObjectId(currentUser._id.toString());
        return await this.postService.unlikePost(id, convertedUserId);
    }

    @Put(':id/dislike')
    @UseGuards(AuthGuardD)
    @ApiBearerAuth() 
    async dislikePost(
        @Param('id') id: Types.ObjectId,
        @CurrentUser() currentUser: User
    ) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
        const convertedUserId = new Types.ObjectId(currentUser._id.toString());
        return await this.postService.dislikePost(id, convertedUserId);
    }

    @Put(':id/undislike')
    @UseGuards(AuthGuardD)
    @ApiBearerAuth() 
    async undislikePost(
        @Param('id') id: Types.ObjectId, 
        @CurrentUser() currentUser: User
    ) {
        if (!currentUser) {
            
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
        const convertedUserId = new Types.ObjectId(currentUser._id.toString());
        return await this.postService.undislikePost(id, convertedUserId);
    }


    @Get('crpost')
    @UseGuards(AuthGuardD)
    @ApiBearerAuth() 
    async getCurrentPost(
        @CurrentUser() currentUser: User,
    ) {
        const swageUserId = new Types.ObjectId(currentUser._id.toString());
        return this.postService.findPostCurrentUser(swageUserId)
    }

    @Get(':postId/privacy')
    @ApiBearerAuth() 
    @UseGuards(AuthGuardD)
    async findPostPrivacy(
        @CurrentUser() currentUser: User,
        @Param('postId') postId: string,
    ) {
        return this.postService.findPostPrivacy(postId, currentUser._id.toString());
    }

    @Put('settingprivacy/:postId')
    @ApiBearerAuth() 
    @UseGuards(AuthGuardD)
    async settingPrivacy(
        @CurrentUser() currentUser: User,
        @Param('postId') postId: Types.ObjectId,
        @Body() settingPrivacyDto: settingPrivacyDto
    ) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
        const swageUserId = new Types.ObjectId(currentUser._id.toString());
        return this.postService.settingPrivacy(postId, settingPrivacyDto, swageUserId);
    }


    @Get('getAllPost')
    @UseGuards(AuthGuardD)
    async getAllPost(@CurrentUser() currentUser: User) {
        return this.postService.getALlPost();
    }

    @Get('getHomeFeed')
    @ApiBearerAuth() 
    @UseGuards(AuthGuardD)
    async getHomeFeed(@CurrentUser() currentUser: User) {
    const currentUserId = currentUser ? currentUser._id.toString() : undefined;
    const swageUserId = new Types.ObjectId(currentUserId);
    return this.postService.getHomeFeed(swageUserId);
    }

@Get('home-feed') // Định nghĩa route GET /posts/home-feed
  @UseGuards(AuthGuardD) // Yêu cầu xác thực JWT thông qua AuthGuardD
  @ApiBearerAuth() // Đánh dấu endpoint này yêu cầu Bearer Token trong Swagger
  @ApiOperation({ summary: 'Lấy danh sách bài đăng cho trang chủ (Home Feed)' }) // Mô tả ngắn gọn về API
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng bài đăng tối đa trả về (mặc định: 10)' })
  @ApiQuery({ name: 'cursor', required: false, type: String, description: 'Con trỏ (dạng chuỗi JSON) để lấy trang tiếp theo' })
  @ApiResponse({ status: 200, description: 'Trả về danh sách bài đăng và cursor tiếp theo.', type: PaginatedFeedResultDto }) // Mô tả response thành công
  @ApiResponse({ status: 400, description: 'Định dạng cursor không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Token không hợp lệ hoặc thiếu.' })
  @ApiResponse({ status: 404, description: 'Người dùng không tồn tại.' })
  @ApiResponse({ status: 500, description: 'Lỗi máy chủ nội bộ.' })
  async getHomeFeedTest(
    @CurrentUser() currentUser: User, // Lấy thông tin người dùng hiện tại từ decorator (do AuthGuardD cung cấp)
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number, // Lấy 'limit' từ query, mặc định là 10, parse thành số nguyên
    @Query('cursor', ParseCursorPipe) cursor?: FeedCursor, // Lấy 'cursor' từ query và parse bằng ParseCursorPipe
  ): Promise<PaginatedFeedResult> {

    // Kiểm tra xem currentUser có tồn tại không (AuthGuardD nên đảm bảo điều này)
    if (!currentUser || !currentUser._id) {
      this.logger.error('CurrentUser not found or missing _id in getHomeFeed');
      throw new HttpException('Unauthorized access', HttpStatus.UNAUTHORIZED);
    }

    const userId = new Types.ObjectId(currentUser._id.toString()); // Lấy userId và đảm bảo là ObjectId

    this.logger.log(`Workspaceing home feed for user ${userId} with limit ${limit} and cursor: ${JSON.stringify(cursor)}`);

    try {
      const result = await this.postService.getHomeFeedtest(userId, limit, cursor);
      return result;
    } catch (error) {
      // Xử lý các lỗi cụ thể từ service hoặc lỗi chung
      this.logger.error(`Error fetching home feed for user ${userId}: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        // Nếu lỗi đã là HttpException (ví dụ NotFoundException từ service), ném lại lỗi đó
        throw error;
      } else {
        // Nếu là lỗi khác, ném lỗi 500 Internal Server Error
        throw new HttpException(
          'An error occurred while fetching the home feed.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
    
    // @Get('getHomeFeedtest')
    // @ApiBearerAuth()
    // @UseGuards(AuthGuardD)
    // @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng bài viết mỗi lần tải', example: 10 })
    // @ApiQuery({ name: 'lastRankingScore', required: false, type: Number, description: 'Cursor: Ranking score cuối cùng' })
    // @ApiQuery({ name: 'lastId', required: false, type: String, description: 'Cursor: ID cuối cùng' })

    // @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
    // async getHomeFeed(
    //     @CurrentUser() currentUser: User,
    //     // Lấy 'limit', đặt giá trị mặc định là 10, ép kiểu thành số nguyên
    //     @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    //     // Lấy các tham số cursor thông qua DTO đã được validate và transform
    //     @Query() cursorDto: FeedCursorDto
    // ): Promise<PaginatedFeedResult> { // Khai báo kiểu trả về

    //     // Lấy ID người dùng từ token (giữ nguyên logic cũ)
    //     const currentUserIdString = currentUser?._id?.toString();
    //     if (!currentUserIdString) {
    //         // Nên xử lý trường hợp không lấy được ID từ currentUser
    //         throw new HttpException('Không tìm thấy User ID trong token', HttpStatus.UNAUTHORIZED);
    //     }
    //     const currentUserId = new Types.ObjectId(currentUserIdString);

    //     // Khởi tạo cursor là undefined
    //     let cursor: FeedCursor | undefined = undefined;

    //     // Chỉ tạo đối tượng cursor nếu tất cả các tham số cần thiết từ DTO đều hợp lệ và tồn tại
    //     if (
    //         cursorDto.lastRankingScore !== undefined && // kiểm tra cả số 0
    //         cursorDto.lastCreatedAt &&
    //         cursorDto.lastId
    //     ) {
    //         try {
    //             // Chuyển đổi kiểu dữ liệu từ DTO sang kiểu của FeedCursor
    //             const createdAtDate = new Date(cursorDto.lastCreatedAt);
    //             // Kiểm tra xem Date có hợp lệ không sau khi parse
    //             if (isNaN(createdAtDate.getTime())) {
    //                 throw new Error('Định dạng lastCreatedAt không hợp lệ');
    //             }

    //             cursor = {
    //                 // lastRankingScore đã là number do @Type(() => Number)
    //                 lastRankingScore: cursorDto.lastRankingScore,
    //                 // Chuyển đổi chuỗi ISO date thành đối tượng Date
    //                 lastCreatedAt: createdAtDate,
    //                 // Chuyển đổi chuỗi ID thành đối tượng ObjectId
    //                 lastId: new Types.ObjectId(cursorDto.lastId),
    //             };
    //         } catch (error) {
    //             // Nếu có lỗi khi parse (sai định dạng ObjectId, sai định dạng Date)
    //             console.error("Lỗi khi xử lý tham số cursor:", error.message);
    //             // Có thể chọn cách xử lý:
    //             // 1. Báo lỗi cho client: throw new BadRequestException(`Tham số cursor không hợp lệ: ${error.message}`);
    //             // 2. Hoặc bỏ qua cursor và coi như tải trang đầu: cursor = undefined; (Như đang làm)
    //             cursor = undefined;
    //         }
    //     }

    //     // Gọi service với đầy đủ tham số: userId, limit, và cursor (có thể là undefined)
    //     return this.postService.getHomeFeedtest(currentUserId, limit, cursor);
    // }

    @Get('friend/:userId')
    @UseGuards(AuthGuardD)
    @ApiBearerAuth() 
    async getPostsByUser(
        @Param('userId') userId: string,
        @CurrentUser() currentUser: User
    ) {
        try {
            const swageUserId = new Types.ObjectId(userId);
            const swageCurrentUser = new Types.ObjectId(currentUser._id.toString());
            const posts = await this.postService.getPostsByUser(swageUserId, swageCurrentUser);
            return posts;
        } catch (error) {
            throw new HttpException('An error occurred while fetching posts  ????', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('getPostByContent/:content')
    @ApiBearerAuth() 
    @UseGuards(AuthGuardD)
    async getPostByContent(
        @Param('content') content: string,
        @CurrentUser() currentUser: User
    ) {
        try {
            if (!currentUser) {
                throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
            }
            return await this.postService.getPostByContent(content);
        } catch (error) {
            console.error('error in getPostByContent', error);
        }
    }

    @Patch('acctivePost/:postId')
    @UseGuards(new RolesGuard(true))
    @UseGuards(AuthGuardD)
    @ApiBearerAuth()
    async acctivePost(
        @Param('postId') postId: Types.ObjectId,
        @CurrentUser() currentUser: User
    ) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
        const UserId = new Types.ObjectId(currentUser._id.toString());
        return await this.postService.ActivePost(postId, UserId);
    }


}


