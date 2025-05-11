import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, UseInterceptors, UploadedFiles, HttpException, HttpStatus } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentDto } from './dto/comment.dto';
import { AuthGuardD } from '../user/guard/auth.guard';
import { CurrentUser } from '../user/decorator/currentUser.decorator';
import { User } from '../user/schemas/user.schemas'
import { RolesGuard } from '../user/guard/role.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { EventService } from 'src/event/event.service';
import { Types } from 'mongoose';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';



@ApiTags('comments')
@Controller('comments')
@UseGuards(AuthGuardD)
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly eventService: EventService,

  ) { }



  @UseGuards(AuthGuardD)
  @Post(':postId')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 2 }]))
  @ApiBearerAuth() 
  @ApiConsumes('multipart/form-data') 
  @ApiOperation({ summary: 'Upload your image' })
  async createCmt(
    @Param('postId') postId: string,
    @CurrentUser() currentUser: User,
    @Body() commetDto: CommentDto,
    @UploadedFiles() files: { files: Express.Multer.File[] }
  ) {
    if (!currentUser) {
      throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
    }
    const swagePostId = new Types.ObjectId(postId);
    const swageAuthor = new Types.ObjectId(currentUser._id.toString());
   const { comment, authorId } = await this.commentService.create(swageAuthor, swagePostId, commetDto, files?.files);
   const notification = {
    title: 'new comment in post',
    body: `new comment from ${currentUser.firstName} ${currentUser.lastName}`,
    data: {
      postId: postId,
      userId: currentUser._id.toString(),
      type: 'comment',
      commetcontet : commetDto.content,
      commetmediaURL : commetDto.img,
      CommentId : comment._id.toString(),
    },
  }
  const notiFiUser = [  
    {user: currentUser._id.toString()},
    {user : authorId}
  ]

    notiFiUser.map(async (noti) => {
       this.eventService.notificationToUser(noti.user, 'new comment in post', notification );
    })
   
   return comment;
  }

  @Get()
  async findAll() {
    return await this.commentService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const cid = new Types.ObjectId(id);
    return await this.commentService.findById(cid);
  }

  @Get('post/:postId')
  async findByPostId(@Param('postId') postId: string) {
    const postIdo = new Types.ObjectId(postId);
    return await this.commentService.findByPostId(postIdo);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const swageId = new Types.ObjectId(id);
    return await this.commentService.delete(swageId);
  }

  @Put(':id')
  @UseGuards(AuthGuardD)
  @ApiBearerAuth() 
  @ApiConsumes('multipart/form-data') 
  @ApiOperation({ summary: 'Upload your image' })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 2 }]))
  async update(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
    @Body() updateCommentDto: CommentDto,
    @UploadedFiles() files: { files: Express.Multer.File[] }
  ) {
    if (!currentUser) {
      throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
    }
    const swageId = new Types.ObjectId(id);
    return await this.commentService.update(swageId, currentUser._id.toString(), updateCommentDto, files.files);
  }
  @Put(':id/like')
  @UseGuards(AuthGuardD)
  async likeComment(@Param('id') id: string, @CurrentUser() currentUser: User) {
    if (!currentUser) {
      throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
    }
    const swageId = new Types.ObjectId(id);
    const userId = new Types.ObjectId(currentUser._id.toString());

    const {authorId,comment} = await this.commentService.likeComment(swageId, userId);
    const notification = {
      title: 'new like in comment',
      body: `new like from ${currentUser.firstName} ${currentUser.lastName}`,
      avatar: currentUser.avatar,
      data: {
        postId: comment.post._id.toString(),
        userId: currentUser._id.toString(),
        type: 'like',
        CommentId : comment._id.toString()
      },
    }
    this.eventService.notificationToUser(authorId, 'new like in comment', notification );
  }

  @Put(':id/unlike')
  @UseGuards(AuthGuardD)
  async unlikeComment(@Param('id') id: string, @CurrentUser() currentUser: User) {
    if (!currentUser) {
      throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
    }
    const swageId = new Types.ObjectId(id);
    const userId = new Types.ObjectId(currentUser._id.toString());
    return await this.commentService.unlikeComment(swageId, userId);
  }

  @Post(':id/reply')
  @UseGuards(AuthGuardD)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 2 }]))
  async reply(
    @Param('id') id: string,
    @CurrentUser() currentUser: User,
    @Body() replyDto: CommentDto,
    @UploadedFiles() files: { files: Express.Multer.File[] }
  ) {
    if (!currentUser) {
      throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
    }
    const swageId = new Types.ObjectId(id);
    const swageAuthor = new Types.ObjectId(currentUser._id.toString());
    return await this.commentService.reply(swageId, swageAuthor, replyDto, files?.files);
  }
}


