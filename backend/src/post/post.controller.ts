import { Put, Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req, UploadedFiles, UseGuards, UseInterceptors, Delete, } from '@nestjs/common';
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
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { timeStamp } from 'console';
import { UserService } from 'src/user/user.service';

@ApiTags('post')
@Controller('post')
export class PostController {

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
    async unlikePost(@Param('id') id: string, @CurrentUser() currentUser: User) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }

        return await this.postService.unlikePost(id, currentUser._id.toString());
    }

    @Put(':id/dislike')
    @UseGuards(AuthGuardD)
    @ApiBearerAuth() 
    async dislikePost(@Param('id') id: string, @CurrentUser() currentUser: User) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }

        return await this.postService.dislikePost(id, currentUser._id.toString());
    }

    @Put(':id/undislike')
    @UseGuards(AuthGuardD)
    @ApiBearerAuth() 
    async undislikePost(@Param('id') id: string, @CurrentUser() currentUser: User) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }

        return await this.postService.undislikePost(id, currentUser._id.toString());
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


}


