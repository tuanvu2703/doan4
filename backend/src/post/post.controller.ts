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
import { ApiTags } from '@nestjs/swagger';

@ApiTags('post')
@Controller('post')
export class PostController {

    constructor(
        private postService: PostService,
        private eventService: EventService,
    ) { }


    @Post('createPost')
    @UseGuards(AuthGuardD)
    @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]))
    async createPost(
        @CurrentUser() currentUser: User,
        @Body() createPostDto: CreatePostDto,
        @UploadedFiles() files: { files: Express.Multer.File[] }
    ) {

        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
        const swageUserId = new Types.ObjectId(currentUser._id.toString());
        return this.postService.createPost(createPostDto, swageUserId, files.files);
    }

    @Get('testOptionalGuard')
    @UseGuards(OptionalAuthGuard)
    testOptionalGuard(@CurrentUser() currentUser: User) {

        return currentUser;
    }

    @Put('updatePost/:postid')
    @UseGuards(AuthGuardD)
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
    async likePost(@Param('id') id: string, @CurrentUser() currentUser: User) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
        
        const notification = {
            title: 'new like in post',
            body: `new like from ${currentUser.firstName} ${currentUser.lastName}`,
            avatart : currentUser.avatar,
            data: {
              postId: id,
              userId: currentUser._id.toString(),
              type: 'like',
            },
        }
        try {
            const {authorId, post} = await this.postService.likePost(id, currentUser._id.toString());
            this.eventService.notificationToUser(authorId, 'new like in post', notification );
            return post;
        } catch (error) {
            throw new HttpException('An error occurred while liking post', HttpStatus.INTERNAL_SERVER_ERROR);
            
        }
        
    }

    @Put(':id/unlike')
    @UseGuards(AuthGuardD)
    async unlikePost(@Param('id') id: string, @CurrentUser() currentUser: User) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }

        return await this.postService.unlikePost(id, currentUser._id.toString());
    }

    @Put(':id/dislike')
    @UseGuards(AuthGuardD)
    async dislikePost(@Param('id') id: string, @CurrentUser() currentUser: User) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }

        return await this.postService.dislikePost(id, currentUser._id.toString());
    }

    @Put(':id/undislike')
    @UseGuards(AuthGuardD)
    async undislikePost(@Param('id') id: string, @CurrentUser() currentUser: User) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }

        return await this.postService.undislikePost(id, currentUser._id.toString());
    }

   
    @Get('crpost')
    @UseGuards(AuthGuardD)
    async getCurrentPost(
        @CurrentUser() currentUser: User,
    ) {
        return this.postService.findPostCurrentUser(currentUser._id.toString())
    }
 
    @Get(':postId/privacy')
    @UseGuards(AuthGuardD)
    async findPostPrivacy(
        @CurrentUser() currentUser: User,
        @Param('postId') postId: string,
    ) {
        return this.postService.findPostPrivacy(postId, currentUser._id.toString());
    }

    @Put('settingprivacy/:postId')
    @UseGuards(AuthGuardD)
    async settingPrivacy(
        @CurrentUser() currentUser: User,
        @Param('postId') postId: Types.ObjectId,
        @Body() settingPrivacyDto: settingPrivacyDto
    ) {
        if(!currentUser){
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
        const swageUserId = new Types.ObjectId(currentUser._id.toString());
        return this.postService.settingPrivacy(postId, settingPrivacyDto, swageUserId);
    }
    

    @Get('getHomeFeed')
    @UseGuards(AuthGuardD)
    async getHomeFeed(@CurrentUser() currentUser: User) {
      const currentUserId = currentUser ? currentUser._id.toString() : undefined;
      const swageUserId = new Types.ObjectId(currentUserId);
      return this.postService.getHomeFeed(swageUserId);
    }

    @Get('friend/:userId')
    @UseGuards(AuthGuardD)
    async getPostsByUser(
        @Param('userId') userId: string,
        @CurrentUser() currentUser: User
    ) {
        try {
            const posts = await this.postService.getPostsByUser(userId, currentUser._id.toString() || null);
            return posts;
        }   catch (error) {
            throw new HttpException('An error occurred while fetching posts  ????', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('getPostByContent/:content')
    @UseGuards(AuthGuardD)
    async getPostByContent(
        @Param('content') content: string,
        @CurrentUser() currentUser: User
    ){
        try {
            if(!currentUser){
                throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
            }
            return await this.postService.getPostByContent(content);
        } catch (error) {
            console.error('error in getPostByContent', error);
        }
    }


}


