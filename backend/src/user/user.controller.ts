import {
  Body, Controller, Get, HttpException, Post, Put, Request,
  Response, UseGuards, HttpStatus, BadRequestException, Param,
  UseInterceptors, UploadedFiles, Delete, Res, Req,
  UnauthorizedException,
  ForbiddenException,
  Logger
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { User } from './schemas/user.schemas';
import { LoginDto } from './dto/login.dto';
import { AuthGuardD } from './guard/auth.guard';
import { CurrentUser } from './decorator/currentUser.decorator';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { RolesGuard } from './guard/role.guard';
import { OtpService } from 'src/otp/otp.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ResetPasswordDto } from './dto/resetPassword.dto';
import { UploadAvatarDto } from './dto/uploadAvartar.dto';
import { UploadCoverImgDto } from './dto/uploadCoverImg.dto';
import { OptionalAuthGuard } from './guard/optional.guard';
import { Types, Model } from 'mongoose';
import { EventService } from 'src/event/event.service';
import { APIS } from 'googleapis/build/src/apis';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InjectModel } from '@nestjs/mongoose';





@ApiTags('User')
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name)
  constructor(
    private userService: UserService,
    private otpService: OtpService,
    private eventService: EventService,

    @InjectModel(User.name) private UserModel: Model<User>,

  ) { }

  @Post('register')
  signUp(@Body() registerDto: RegisterDto): Promise<User> {
    return this.userService.register(registerDto);
  }


  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {

  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const result = await this.userService.googleLogin(req);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NEST_ENV === 'production',
      sameSite: 'Lax',
      path: '/user',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.cookie('TokenDoan3', result.accessToken, {
      httpOnly: false,
      secure: process.env.NEST_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
      maxAge: 60 * 60 * 1000,
    });
    //${process.env.FRONTEND_URL}
    return res.redirect(`http://localhost:3000`);
  }



  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res() res,
    @Req() req,
  ) {
    const { accessToken, refreshToken, UserId } = await this.userService.login(loginDto);
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NEST_ENV === 'production', 
      sameSite: 'Lax',
      path: '/user',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    this.logger.log(`User ${UserId} logged in successfully`);
    return res.json({ accessToken });

  }

  @Post('refresh-token')
  async refreshToken(@Request() req) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new HttpException('No refresh token provided', HttpStatus.UNAUTHORIZED);
    }
    return this.userService.refreshToken(refreshToken);
  }

  @Post('logout')
  async logout(@Req() req, @Res() res) {

  const refreshToken = req.cookies.refreshToken;
  console.log('refreshToken from cookie:', refreshToken);
  
    await this.userService.logout(refreshToken);

    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); 
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NEST_ENV === 'production',
      sameSite: 'Lax',
      path: '/user',
      maxAge: 0,
      expires: pastDate,
    });

    return res.status(HttpStatus.OK).json({ message: 'Logged out successfully' });
  }
  
 
  @ApiBearerAuth()
  @Get('current')
  @UseGuards(AuthGuardD)
  async getCurrentUser(@CurrentUser() user: any) {
    return user;
  }

  @ApiBearerAuth()
  @Put('update')
  @UseGuards(AuthGuardD)
  async updateUser(@CurrentUser() currentUser: User, @Body() updateData: UpdateUserDto) {

    if (!currentUser) {
      throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
    }

    return this.userService.updateUser(currentUser._id.toString(), updateData);
  }

  @ApiBearerAuth()
  @Put('change-password')
  @UseGuards(AuthGuardD)
  @ApiBearerAuth()
  async changePassword(
    @CurrentUser() currentUser: User,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.userService.changePassword(currentUser._id.toString(), changePasswordDto);
  }


  @Get('getAllUser')
  @ApiBearerAuth()
  @UseGuards(AuthGuardD)
  async getAllUser(
    @CurrentUser() currentUser: User,
  ) {

    const currentUserID = new Types.ObjectId(currentUser._id.toString());
    return this.userService.findAllUsers(currentUser._id.toString())
  }

  @Post('send-otp-resetpassword')
  async sendOtp(
    @Body('email') email: string,
  ) {
    try {
      if (!email) {
        throw new Error("Email is required");
      }
      await this.otpService.sendOtp(email, 'Reset password');
      return { message: 'OTP sent to your email.' };
    } catch (error) {

      throw new BadRequestException(error.message);
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body('email') email: string, @Body('otp') otp: string) {
    try {
      const isOtpValid = await this.otpService.verifyOtp(email, otp);
      if (isOtpValid) {
        return { message: 'OTP verified successfully' };
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('reset-password')

  async resetPassword(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    try {
      const message = await this.userService.resetPassword(
        email,
        otp,
        resetPasswordDto,
      );
      return { message };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }


  @Get('getDetailUser/:userId')
  @ApiBearerAuth()
  async getDetailUser(
    @Param('userId')
    userId: string,
  ) {
    return this.userService.findById(userId)
  }


  @Post('upload-avatar')
  @UseGuards(AuthGuardD)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 1 }]))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload user avatar' })
  async uploadAvatar(
    @CurrentUser() currentUser: User,
    @Body() uploadAvatarDto: UploadAvatarDto,
    @UploadedFiles() files: { files: Express.Multer.File[] }
  ) {
    return this.userService.uploadAvatar(uploadAvatarDto, currentUser._id.toString(), files.files);
  }


  @Post('uploadcoveravatar')
  @UseGuards(AuthGuardD)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 1 }]))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload user avatar' })
  async uploadCoverAvatar(
    @CurrentUser() currentUser: User,
    @Body() uploadCoverImgDto: UploadCoverImgDto,
    @UploadedFiles() files: { files: Express.Multer.File[] }
  ) {
    return this.userService.uploadCoverImage(uploadCoverImgDto, currentUser._id.toString(), files.files);
  }

  @ApiBearerAuth()
  @Post(':postId/bookmark')
  @UseGuards(AuthGuardD)
  async savePost(@CurrentUser() currentUser: User, @Param('postId') postId: string) {
    return this.userService.savePost(currentUser._id.toString(), postId);
  }
  @ApiBearerAuth()
  @Delete(':postId/bookmark')
  @UseGuards(AuthGuardD)
  async removeSavedPost(@CurrentUser() currentUser: User, @Param('postId') postId: string) {
    return this.userService.removeSavedPost(currentUser._id.toString(), postId);
  }
  @ApiBearerAuth()
  @Get(':userId/bookmark')
  @UseGuards(AuthGuardD)
  async getSavedPosts(@CurrentUser() currentUser: User) {
    return this.userService.getSavedPosts(currentUser._id.toString());
  }
  @ApiBearerAuth()
  @Post('friendrequest/:userId')
  @UseGuards(AuthGuardD)
  async friendRequest(
    @CurrentUser() currentUser: User,
    @Param('userId') userId: string,
  ) {
    const author = {
      _id: currentUser._id,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      avatar: currentUser.avatar,
    }
    try {
      const swageSenderID = new Types.ObjectId(currentUser._id.toString())
      const swageReceiverId = new Types.ObjectId(userId);
      const request = await this.userService.FriendsRequest(swageSenderID, swageReceiverId);
      this.eventService.notificationToUser(userId, 'new friend request from', author);
      return request;
    } catch (error) {

      throw error;
    }
  }
  @ApiBearerAuth()
  @Post('acceptfriend/:friendRequestId')
  @UseGuards(AuthGuardD)
  async acceptFriend(
    @CurrentUser() currentUser: User,
    @Param('friendRequestId') friendRequestId: string,
  ) {
    const author = {
      _id: currentUser._id,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      avatar: currentUser.avatar,
    }
    try {
      const swageFriendRequestId = new Types.ObjectId(friendRequestId);
      const swageUserId = new Types.ObjectId(currentUser._id.toString())
      const { senderId, friend } = await this.userService.acceptRequestFriends(swageUserId, swageFriendRequestId);
      this.eventService.notificationToUser(senderId, 'accept friend request', author);
      return friend;
    } catch (error) {

      throw error;
    }

  }
  @ApiBearerAuth()
  @Post('rejectFriendRequest/:friendRequestId')
  @UseGuards(AuthGuardD)
  async rejectFriendRequest(
    @CurrentUser() currentUser: User,
    @Param('friendRequestId') friendRequestId: string,
  ) {
    const swFriendRequestId = new Types.ObjectId(friendRequestId);
    const swageUserId = new Types.ObjectId(currentUser._id.toString())
    return this.userService.rejectFriendRequest(swageUserId, swFriendRequestId);
  }

  @ApiBearerAuth()
  @Get('getMyFriendRequest')
  @UseGuards(AuthGuardD)
  async getMyFriendRequest(
    @CurrentUser() currentUser: User,
  ) {
    const swageUserId = new Types.ObjectId(currentUser._id.toString())
    return this.userService.getMyFriendRequest(swageUserId);
  }
  @ApiBearerAuth()
  @Delete('unfriend/:friendId')
  @UseGuards(AuthGuardD)
  async unfriend(
    @CurrentUser() currentUser: User,
    @Param('friendId') friendId: string,
  ) {
    const swageFriendId = new Types.ObjectId(friendId);
    const swageUserId = new Types.ObjectId(currentUser._id.toString())
    return this.userService.unFriend(swageUserId, swageFriendId);
  }

  @ApiBearerAuth()
  @Get('getMyFriend')
  @UseGuards(AuthGuardD)
  async getMyFriend(
    @CurrentUser() currentUser: User,
  ) {
    const swageUserId = new Types.ObjectId(currentUser._id.toString())
    return this.userService.getMyFriend(swageUserId);
  } //check

  @ApiBearerAuth()
  @Get('request')
  @UseGuards(AuthGuardD)
  async getAllMysenderFriendRequest(
    @CurrentUser() currentUser: User,
  ) {
    const swageUserId = new Types.ObjectId(currentUser._id.toString())
    return this.userService.findAllMySenderFriendRequest(swageUserId);
  }

  @ApiBearerAuth()
  @Get('getStatusFriend/:friendId')
  @UseGuards(AuthGuardD)
  @ApiOperation({ summary: 'CHECK STATUS FRIEND WITH ANOTHER USER' })
  @ApiParam({
    name: 'friendId',
    description: 'ID of the friend to check status with',
    required: true,
    type: String,
  })
  async getAllMyReceiverFriendRequest(
    @CurrentUser() currentUser: User,
    @Param('friendId') friendId: Types.ObjectId,
  ) {
    const userId = new Types.ObjectId(currentUser._id.toString())
    return this.userService.checkFriendStatus(userId, friendId);
  }


  @Delete('removeFriendRequest/:friendRequestId')
  @ApiBearerAuth()
  @UseGuards(AuthGuardD)
  async removeFriendRequest(
    @CurrentUser() currentUser: User,
    @Param('friendRequestId') friendRequestId: string,
  ) {
    const swageUserId = new Types.ObjectId(currentUser._id.toString())
    const swageFriendRequestId = new Types.ObjectId(friendRequestId);
    return this.userService.removeFriendRequest(swageUserId, swageFriendRequestId);
  }

  @ApiBearerAuth()
  @Get('getlistfriendanother/:userId')
  @UseGuards(AuthGuardD)
  async getListFriendAnother(
    @CurrentUser() currentUser: User,
    @Param('userId') userId: string,
  ) {
    if (!currentUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (!userId) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const userIdOBJ = new Types.ObjectId(userId);
    return this.userService.getListFriendAnother(userIdOBJ);
  }
  @ApiBearerAuth()
  @Get('getUserByName/:name')
  @UseGuards(AuthGuardD)
  async getUserByName(
    @CurrentUser() currentUser: User,
    @Param('name') name: string,
  ) {
    try {
      if (!currentUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return this.userService.getuserByName(name, currentUser._id.toString());
    } catch (error) {
      throw error;
    }
  }

  @Put('activeUser/:userId')
  @UseGuards(new RolesGuard(true))
  @UseGuards(AuthGuardD)
  async activeUSer(
    @Param('userId') userId: Types.ObjectId,
    @CurrentUser() currentUser: User,
  ) {
    try {
      if (!currentUser) {
        throw new UnauthorizedException('you dont have permission');
      }
      return this.userService.activeUser(userId);
    } catch (error) {
      throw error;
    }
  }

  @Get('alluseradmin')
  @UseGuards(new RolesGuard(true))
  @UseGuards(AuthGuardD)
  async getalluserforadmin(
    @CurrentUser() currentUser: User,
  ) {
    try {
      if (!currentUser) {
        throw new UnauthorizedException('you dont have permission');
      }
      if (currentUser.role.toString() !== 'true') {
        throw new ForbiddenException('you dont have permission');
      }
      return this.userService.findAllUserForAdmin();
    } catch (error) {
      console.log(error);
    }
  }

}
