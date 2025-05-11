import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, UploadedFiles, UseGuards, UseInterceptors,Logger, Delete } from '@nestjs/common';
import { PublicGroupService } from './public-group.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuardD } from 'src/user/guard/auth.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/user/decorator/currentUser.decorator';
import { CreatePublicGroupDto } from './dto/createpublicgroup.dto';
import { User } from 'src/user/schemas/user.schemas';
import { Types } from 'mongoose';

@ApiTags('Public Group')
@Controller('PublicGroup')
export class PublicGroupController {
    private readonly logger = new Logger(PublicGroupController.name);
    constructor(
        private readonly publicGroupService: PublicGroupService,
    ) {}



  @Post('creategroup')
  @UseGuards(AuthGuardD)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 1 }]))
  @ApiBody({ type: CreatePublicGroupDto })
  @ApiResponse({ status: 201, description: 'Nhóm được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  async createPublicGrpoup(
    @CurrentUser() currentUser: User,
    @Body() createPublicGroupDto: CreatePublicGroupDto,
    @UploadedFiles() files: { files?: Express.Multer.File[] },
  ){
    if (!files || !files.files || files.files.length === 0) {
      throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
    }
    console.log("DTO after transform:", createPublicGroupDto);
    const userId = new Types.ObjectId(currentUser._id.toString());
    console.log("Raw Body Controller:", createPublicGroupDto);
    return this.publicGroupService.createPublicGroup(createPublicGroupDto, userId, files.files[0]);
  }

  @Get('getGroupId/:groupId')
  @UseGuards(AuthGuardD)
  @ApiBearerAuth()
  @ApiParam({name: 'groupId', required: true, description: 'nhập _id nhóm', example: '67d6819042f199104709c4de' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin nhóm thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async getPublicGroupById(@CurrentUser() currentUser: User,
  @Param('groupId') groupId: string
  ){
    return this.publicGroupService.getPublicGroupById(groupId);
  }

  @Get('getGroupbyname/:groupName')
  @UseGuards(AuthGuardD)
  @ApiBearerAuth()
  @ApiParam({name: 'groupName', required: true, description: 'nhập tên của nhóm', example: 'IT' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin nhóm thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async getGroupByName(
    @CurrentUser() currentUser: User,
    @Param('groupName') groupName: string
  ){
    return this.publicGroupService.getGroupByName(groupName);
  }

  @Get('getGroupByUser')
  @UseGuards(AuthGuardD)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Lấy thông tin nhóm thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async getPublicGroupForUser(@CurrentUser() currentUser: User) {
    const userId = new Types.ObjectId(currentUser._id.toString());
    return this.publicGroupService.getPublicGroupForUser(userId);
  }

  @Post('requestJoinGroup/:groupId')
  @UseGuards(AuthGuardD)
  @ApiBearerAuth()
  @ApiParam({
    name: 'groupId',
    required: true,
    description: 'Nhập _id của nhóm',
    example: '65fc4e5a4d3a7f1f2a1c9c10'
  })
  @ApiResponse({ status: 200, description: 'Yêu cầu tham gia nhóm thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async requestJoinGroup(
    @CurrentUser() currentUser: User,
    @Param('groupId') groupId: string // sửa thành string
  ) {
    const userId = new Types.ObjectId(currentUser._id.toString());
    const convertedGroupId = new Types.ObjectId(groupId);
    return this.publicGroupService.requestjonGroup(convertedGroupId, userId);
  }


  @Post('acceptJoinGroup/:requestId')
  @UseGuards(AuthGuardD)
  @ApiBearerAuth()
  @ApiParam({
    name: 'requestId',
    required: true,
    description: 'Nhập _id của yêu cầu',
    example: '65fc4e5a4d3a7f1f2a1c9c10'
  })
  @ApiResponse({ status: 200, description: 'Chấp nhận yêu cầu tham gia nhóm thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async acceptJoinGroup(
    @CurrentUser() currentUser: User,
    @Param('requestId') requestId: Types.ObjectId 
  ) {
    const userId = new Types.ObjectId(currentUser._id.toString());
    const convertedRequestId = new Types.ObjectId(requestId);
    return this.publicGroupService.acceptRequestJoinGroup(requestId, userId);
  }
    

  @Get('getMemberGroup/:groupId')
  @UseGuards(AuthGuardD)
  @ApiBearerAuth()
  @ApiParam({
    name: 'groupId',
    required: true,
    description: 'Nhập _id của nhóm',
    example: '65fc4e5a4d3a7f1f2a1c9c10'
  })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành viên nhóm thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async getMemberGroup(
    @CurrentUser() currentUser: User,
    @Param('groupId') group: string
  ) {
    const groupId = new Types.ObjectId(group);
    return this.publicGroupService.getmemberGroup(groupId);
  }

  @Get('getPostInGroup/:groupId')
  @UseGuards(AuthGuardD)
  @ApiBearerAuth()
  @ApiParam({
    name: 'groupId',
    required: true,
    description: 'Nhập _id của nhóm',
    example: '65fc4e5a4d3a7f1f2a1c9c10'
  })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành viên nhóm thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async getPostInGroup(
    @CurrentUser() currentUser: User,
    @Param('groupId') group: string
  ){
    const groupId = new Types.ObjectId(group)
    return this.publicGroupService.getPostInGroup(groupId)
  }
  
  @Patch('empowerMember/:groupId')
  @UseGuards(AuthGuardD)
  @ApiBearerAuth()
  @ApiParam({
    name: 'groupId',
    required: true,
    description: 'Nhập _id của nhóm',
    example: '65fc4e5a4d3a7f1f2a1c9c10',
  })
  @ApiResponse({ status: 200, description: 'Cấp quyền thành viên nhóm thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Nhóm hoặc thành viên không tồn tại' })
  async empowerMember(
    @CurrentUser() currentUser: User,
    @Param('groupId') group: string,
    @Body('member') members: string[], 
  ) {
    const groupId = new Types.ObjectId(group);
    const memberIds = members.map((id) => new Types.ObjectId(id));
    const updatedMembers = await this.publicGroupService.empowerMember(groupId, memberIds);

    return {
      statusCode: HttpStatus.OK,
      message: 'Members empowered successfully',
      data: updatedMembers,
    };
  }

  @Patch('unempowerMember/:groupId')
  @UseGuards(AuthGuardD)
  @ApiBearerAuth()
  @ApiParam({
    name: 'groupId',
    required: true,
    description: 'Nhập _id của nhóm',
    example: '65fc4e5a4d3a7f1f2a1c9c10',
  })
  @ApiResponse({ status: 200, description: 'Cấp quyền thành viên nhóm thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Nhóm hoặc thành viên không tồn tại' })
  async unEmpowerMember(
    @CurrentUser() currentUser: User,
    @Param('groupId') group: string,
    @Body('member') members: string[], 
  ) {
    const groupId = new Types.ObjectId(group);
    const memberIds = members.map((id) => new Types.ObjectId(id));
    const updatedMembers = await this.publicGroupService.empowerMember(groupId, memberIds);

    return {
      statusCode: HttpStatus.OK,
      message: 'Members unEmpowered successfully',
      data: updatedMembers,
    };
  }

  @Get('getAllPublicGroup')
  @UseGuards(AuthGuardD)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Lấy tất cả nhóm công khai thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async getAllPublicGroup(
    @CurrentUser() currentUser: User
  ){
    return this.publicGroupService.getAllPublicGroup();
  }

  @Get('getPublicGroupsForFriends')
  @UseGuards(AuthGuardD)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Lấy thông tin nhóm công khai cho bạn bè thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async getPublicGroupsForFriends(
    @CurrentUser() currentUser: User,
  ){
    if(!currentUser){
      this.logger.error('Unauthorized access attempt');
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const userId = new Types.ObjectId(currentUser._id.toString());
    return this.publicGroupService.getPublicGroupsForFriends(userId);
  }

  @Get('getAllRequestJoinGroup/:groupId')
  @UseGuards(AuthGuardD)
  @ApiBearerAuth()
  @ApiParam({
    name: 'groupId',
    required: true,
    description: 'Nhập _id của nhóm',
    example: '65fc4e5a4d3a7f1f2a1c9c10'
  })
  @ApiResponse({ status: 200, description: 'Lấy tất cả yêu cầu tham gia nhóm thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async getAllRequestJoinGroup(
    @CurrentUser() currentUser: User,
    @Param('groupId') group: Types.ObjectId
  ){  
    const userId = new Types.ObjectId(currentUser._id.toString());
    return this.publicGroupService.getAllRequestJoinGroup(group, userId);
  }

  @Delete('removeRequestJoinGroup/:requestId')
  @UseGuards(AuthGuardD)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Nhập _id của yêu cầu',
    example: '65fc4e5a4d3a7f1f2a1c9c10'
  })
  @ApiResponse({ status: 200, description: 'Xóa yêu cầu tham gia nhóm thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async removeRequestJoinGroup(
    @CurrentUser() currentUser: User,
    @Param('requestId') requestId: Types.ObjectId
  ){
    const userId = new Types.ObjectId(currentUser._id.toString());
    return this.publicGroupService.removeRequestJoinGroup(requestId, userId);
  }

  
  




}
  



