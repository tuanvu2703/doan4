import { HttpException, HttpStatus, Injectable, Logger, NotFoundException,
UnauthorizedException,
 } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UserService } from 'src/user/user.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PublicGroup } from './schema/plgroup.schema';
import { MemberGroup } from './schema/membergroup.schema';
import { CreatePublicGroupDto} from './dto/createpublicgroup.dto';
import { RequestJoinGroup } from './schema/requestJoinGroup.schema';
import { PostSchema, Post } from 'src/post/schemas/post.schema';
import { User } from 'src/user/schemas/user.schemas';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';



@Injectable()
export class PublicGroupService {
  private readonly logger = new Logger(PublicGroupService.name);
    constructor(
        @InjectModel(PublicGroup.name) private readonly PublicGroupModel: Model<PublicGroup>,
        @InjectModel(MemberGroup.name) private readonly MemberGroupModel: Model<MemberGroup>,
        @InjectModel(RequestJoinGroup.name) private readonly RequestJoinGroupModel: Model<RequestJoinGroup>,
        @InjectModel(Post.name) private readonly PostModel: Model<Post>,
        @InjectModel(User.name) private readonly UserModel: Model<User>,
        private readonly cloudinaryService: CloudinaryService,
        private readonly userService: UserService,
    ) {}

    async createPublicGroup(
      createPublicGroupDto: CreatePublicGroupDto,
      userId: Types.ObjectId,
      file: Express.Multer.File
    ): Promise<{ publicGroup: PublicGroup; memberGroup: MemberGroup }> {
      // Kiểm tra user tồn tại
      const user = await this.userService.findById(userId.toString());
      if (!user) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }
  
      // Kiểm tra file upload
      let avatargroupUrl: string = "";
      if (file) {
        try {
          console.log(`Using upload_stream for file: ${file.originalname}, size: ${file.size}`);
          const uploadedImage = await this.cloudinaryService.uploadFile(file);
          avatargroupUrl = uploadedImage;
        } catch (error) {
          throw new HttpException(`Failed to upload image: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
      }
  
      // Parse tags từ chuỗi thành mảng
      const tagsArray = createPublicGroupDto.tags.split(",").map((tag: string) => tag.trim());
  
      // Log rules trước khi lưu
      console.log("Rules before saving:", createPublicGroupDto.rules);
  
      // Ánh xạ dữ liệu từ DTO vào schema
      const groupData = {
        groupName: createPublicGroupDto.groupName,
        avatargroup: avatargroupUrl,
        rules: createPublicGroupDto.rules, // Giữ nguyên mảng chuỗi từ DTO
        introduction: {
          summary: createPublicGroupDto.summary,
          visibility: createPublicGroupDto.visibility,
          discoverability: createPublicGroupDto.discoverability,
          tags: tagsArray,
          // history không cần gửi, schema sẽ tự động gán
        },
      };
  
      // Log dữ liệu trước khi lưu
      console.log("Group Data:", JSON.stringify(groupData, null, 2));
  
      // Tạo và lưu nhóm
      const createdGroup = new this.PublicGroupModel(groupData);
      await createdGroup.save();
  
      // Tạo memberGroup (vai trò owner)
      const memberGroupData = {
        group: createdGroup._id,
        member: userId,
        role: "owner",
      };
  
      const createdMemberGroup = new this.MemberGroupModel(memberGroupData);
      await createdMemberGroup.save();
  
      return { publicGroup: createdGroup, memberGroup: createdMemberGroup };
    }
    

    async getPublicGroupById(groupId: string): Promise<PublicGroup> {
        const group = await this.PublicGroupModel.findById(groupId)
        if (!group) {
          throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
        }
        return group;
    }

    async getPublicGroupForUser(userId: Types.ObjectId): Promise<PublicGroup[]> {
        const groups = await this.MemberGroupModel.find({ member: userId }).populate('group');
        return groups.map((group) => group.group);
    }


    async getGroupByName(groupname: string): Promise<PublicGroup[]> {
        const group = await this.PublicGroupModel.find({
          groupName: { $regex: `.*${groupname}.*`, $options: 'i' } // tìm chứa chuỗi, không phân biệt hoa thường
        })
        .lean()
        .exec();
      
        if (!group || group.length === 0) {
          throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
        }
      
        return group;
      }
      

    async requestjonGroup(groupId: Types.ObjectId, userId: Types.ObjectId): Promise<RequestJoinGroup> {
      try {
        const logger = new Logger(this.requestjonGroup.name);
        const group = await this.PublicGroupModel.findById(groupId);
        if (!group) {
          throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
        }

        const requestJoinGroup = {
            group: groupId,
            sender: userId,
            status: 'pending',
        }
        logger.log('requestJoinGroup', requestJoinGroup);
        const createdRequestJoinGroup = new this.RequestJoinGroupModel(requestJoinGroup);
        return createdRequestJoinGroup.save();
      
      } catch (error) {
        throw new HttpException('Error creating request to join group', HttpStatus.BAD_REQUEST, error);
      }
    }
    
        

    async acceptRequestJoinGroup(requestJoinGroupId: Types.ObjectId, userId: Types.ObjectId): Promise<MemberGroup> {
      
      try {
        const requestJoinGroup = await this.RequestJoinGroupModel.findById(requestJoinGroupId);
      if (!requestJoinGroup) {
        this.logger.warn('Request not found', HttpStatus.NOT_FOUND);
        throw new HttpException('Request not found', HttpStatus.NOT_FOUND);
      }

      const grouptype = await this.PublicGroupModel.findById(requestJoinGroup.group);
      if (!grouptype) {
        throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
      }
    
      const user = await this.userService.findById(userId.toString());
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
    
      if (grouptype.introduction.visibility === 'private') {
        const memberGroup = await this.MemberGroupModel.findOne({ group: requestJoinGroup.group, member: userId });
        if (!memberGroup || (memberGroup.role !== 'admin' && memberGroup.role !== 'owner')) {
          throw new HttpException('Only admin or owner can accept join requests for private group', HttpStatus.FORBIDDEN);
        }
      }

      const isMember = await this.MemberGroupModel.findOne({ group: requestJoinGroup.group, member:  userId });
      if (!isMember) {
        throw new HttpException('you are not member group', HttpStatus.BAD_REQUEST);
      }

      const group = requestJoinGroup.group;
      const member = requestJoinGroup.sender;
      const newMemberGroup = {
        group,
        member,
        role: 'member',
      };
      this.logger.log('newMemberGroup', newMemberGroup);
    
      const createdMemberGroup = new this.MemberGroupModel(newMemberGroup);
      await createdMemberGroup.save();
      await this.RequestJoinGroupModel.findByIdAndDelete(requestJoinGroupId);
    
      return createdMemberGroup;
      } catch (error) {
        this.logger.error('Error accepting join request: ',error)
        console.error('Error accepting join request:', error);
      }
    }

      
    async rejectRequestJoinGroup(requestJoinGroupId: Types.ObjectId, userId: string): Promise<RequestJoinGroup> {
      const requestJoinGroup = await this.RequestJoinGroupModel.findById(requestJoinGroupId);
      if (!requestJoinGroup) {
        throw new HttpException('Request not found', HttpStatus.NOT_FOUND);
      }
    
      const grouptype = await this.PublicGroupModel.findById(requestJoinGroup.group);
      if (!grouptype) {
        throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
      }
    
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
    
      if (grouptype.introduction.visibility === 'private') {
        const memberGroup = await this.MemberGroupModel.findOne({ group: requestJoinGroup.group, member: userId });
        if (!memberGroup || (memberGroup.role !== 'admin' && memberGroup.role !== 'owner')) {
          throw new HttpException('Only admin or owner can reject join requests for private group', HttpStatus.FORBIDDEN);
        }
      }
    
      await this.RequestJoinGroupModel.findByIdAndDelete(requestJoinGroupId);
      return requestJoinGroup;
    }

    async getmemberGroup(groupId: Types.ObjectId): Promise<MemberGroup[]> {
      const memberGroup = await this.MemberGroupModel.find({ group: groupId })
      .populate({
        path : 'member',
        select: 'firstName lastName avatar'
      });
      return memberGroup;
    }

    async getPostInGroup(groupId: Types.ObjectId): Promise<Post[]> {
      const group = await this.PublicGroupModel.findById(groupId)
      const posts = await this.PostModel.find({ group : groupId })
      .populate({
        path : 'author',
        select : 'firstName lastName avatar'
      })

      .populate({
        path : 'group',
        select : 'groupName avatargroup'
      })
      .exec()
      if (!group) {
        throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
      }
      return posts 
    }

    async empowerMember(groupId: Types.ObjectId, userIds: Types.ObjectId[]): Promise<any> {

      const group = await this.PublicGroupModel.findById(groupId);
      if (!group) throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
  
      const users = await this.UserModel.find({ _id: { $in: userIds } });
      if (users.length !== userIds.length) throw new HttpException('One or more users not found', HttpStatus.NOT_FOUND);
  
      const members = await this.MemberGroupModel.find({ group: groupId, member: { $in: userIds } });
      if (members.length !== userIds.length) throw new HttpException('One or more members not found in group', HttpStatus.NOT_FOUND);
  
      for (const member of members) {
          if (member.role === 'owner') throw new HttpException(`Member ${member.member} is owner`, HttpStatus.BAD_REQUEST);
          if (member.role === 'admin') throw new HttpException(`Member ${member.member} is already admin`, HttpStatus.BAD_REQUEST);
          member.role = 'admin';
      }
  
      await Promise.all(members.map(member => member.save()));
      return members;
  
  }

  async unEmpoverMember(groupId :Types.ObjectId, userIds:Types.ObjectId[]): Promise<any>{

    const group = await this.PublicGroupModel.findById(groupId);
    if (!group) throw new HttpException('Group not found', HttpStatus.NOT_FOUND);

    const users = await this.UserModel.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) throw new HttpException('One or more users not found', HttpStatus.NOT_FOUND);

    const members = await this.MemberGroupModel.find({ group: groupId, member: { $in: userIds } });
    if (members.length !== userIds.length) throw new HttpException('One or more members not found in group', HttpStatus.NOT_FOUND);

    for (const member of members) {
        if (member.role === 'owner') throw new HttpException(`Member ${member.member} is owner`, HttpStatus.BAD_REQUEST);
        if (member.role === 'user') throw new HttpException(`Member ${member.member} is already user`, HttpStatus.BAD_REQUEST);
        member.role = 'user';
    }

    await Promise.all(members.map(member => member.save()));
    return members;
  }


  async getAllPublicGroup(): Promise<PublicGroup[]> {
    const groups = await this.PublicGroupModel.find()
    return groups;
  }
  
/**
     * Get public groups that the user's friends have joined.
     * @param userId - The ID of the user (MongoDB ObjectId).
     * @param page - The page number for pagination (default: 1).
     * @param limit - The number of groups per page (default: 10).
     * @returns A promise that resolves to an object containing the list of public groups, total count, current page, and total pages.
     * @throws {NotFoundException} If the user with the given ID does not exist or has no friends with joined groups.
     */
    async getPublicGroupsForFriends(
        userId: Types.ObjectId,
        page: number = 1,
        limit: number = 10,
    ): Promise<{
        groups: PublicGroup[];
        total: number;
        page: number;
        totalPages: number;
    }> {
        this.logger.log(`Fetching public groups for friends of user ${userId}, page ${page}, limit ${limit}`);

        // Lấy danh sách ID bạn bè
        const friendIds = await this.userService.getMyFriendIds(userId);
        if (friendIds.length === 0) {
            this.logger.warn(`No friends found for user ${userId}`);
            throw new NotFoundException(`Không tìm thấy bạn bè cho người dùng có ID "${userId}"`);
        }

        // Chuyển đổi friendIds từ string thành Types.ObjectId
        const friendObjectIds = friendIds.map((id) => new Types.ObjectId(id));
        this.logger.log(`Converted friend IDs to ObjectId: ${friendObjectIds}`);

        // Lấy danh sách các nhóm mà bạn bè đã tham gia
        const memberGroups = await this.MemberGroupModel
            .find({ 
                member: { $in: friendObjectIds }, 
                group: { $exists: true },
                blackList: false,
            })
            .select('group')
            .lean();

        if (!memberGroups || memberGroups.length === 0) {
            this.logger.log(`No member groups found for friends of user ${userId}`);
            return { groups: [], total: 0, page, totalPages: 0 };
        }

        const groupIds = memberGroups
            .map((mg) => mg.group.toString())
            .filter((id, index, self) => self.indexOf(id) === index);

        if (groupIds.length === 0) {
            this.logger.log(`No groups found for friends of user ${userId}`);
            return { groups: [], total: 0, page, totalPages: 0 };
        }

        // Chuyển đổi groupIds thành Types.ObjectId
        const groupObjectIds = groupIds.map((id) => new Types.ObjectId(id));
        this.logger.log(`Group IDs for friends: ${groupObjectIds}`);

        // Kiểm tra tất cả các nhóm trước khi lọc visibility
        const allGroups = await this.PublicGroupModel
            .find({ _id: { $in: groupObjectIds } })
            .lean();
        
        this.logger.log(`All groups before visibility filter: ${JSON.stringify(allGroups.map(g => ({ id: g._id, visibility: g.introduction?.visibility })))}`);

        // Lấy các nhóm công khai từ danh sách groupIds
        const skip = (page - 1) * limit;
        const publicGroups = await this.PublicGroupModel
            .find({
                _id: { $in: groupObjectIds },
                'introduction.visibility': 'public',
            })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await this.PublicGroupModel.countDocuments({
            _id: { $in: groupObjectIds },
            'introduction.visibility': 'public',
        });

        if (publicGroups.length === 0 && allGroups.length > 0) {
            this.logger.warn(`Found ${allGroups.length} groups, but none are public for friends of user ${userId}`);
        }

        const totalPages = Math.ceil(total / limit);

        this.logger.log(`Successfully fetched ${publicGroups.length} public groups for friends of user ${userId}`);

        return {
            groups: publicGroups,
            total,
            page,
            totalPages,
        };
    }


    /**
     * Get all join requests for a specific group.
     * @param groupId - The ID of the group (MongoDB ObjectId).
     * @returns A promise that resolves to an object containing group information and list of join requests.
     * @throws {HttpException} If the group with the given ID does not exist.
     */

    async getAllRequestJoinGroup(groupId: Types.ObjectId, userId): Promise<{
      group: { _id: string; groupName: string; avatargroup: string };
        requests: { sender: { firstName: string; lastName: string; avatar?: string } }[];
    }>{
      const group = await this.PublicGroupModel
        .findById(groupId)
        .select('groupName avatargroup')
        .lean();

      if (!group){
        this.logger.warn('Group not found', HttpStatus.NOT_FOUND);
        throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
      }

      if (group.introduction.visibility === 'private') {
            const member = await this.MemberGroupModel
                .findOne({ group: groupId, member: userId })
                .select('role')
                .lean();

            if (!member || !['owner', 'admin'].includes(member.role)) {
                this.logger.warn(`User ${userId} is not authorized to access private group ${groupId} requests`);
                throw new UnauthorizedException('Only admins or owners can access requests for private groups');
            }
      }

      const requests = await this.RequestJoinGroupModel.find({ group: groupId })
      .populate({
      path : 'sender',
      select: 'firstName lastName avatar'
      })
      .lean();
      if (!requests || requests.length === 0) {
        this.logger.warn('No join requests found for group', HttpStatus.NOT_FOUND);
        throw new HttpException('No join requests found for group', HttpStatus.NOT_FOUND);
      }
      this.logger.log(`Found ${requests.length} join requests for group ${groupId}`);
      this.logger.log('request :', requests);
      const result = {
            group: {
                _id: group._id.toString(),
                groupName: group.groupName,
                avatargroup: group.avatargroup || '', // Đảm bảo không trả về undefined
            },
            requests: requests.map(request => ({
                sender: {
                    firstName: request.sender.firstName,
                    lastName: request.sender.lastName,
                    avatar: request.sender.avatar || undefined,
                },
            })),
        };
      this.logger.log(`Successfully fetched ${requests.length} join requests for group ${groupId}`);
      return result;
    }

    async removeRequestJoinGroup(requestJoinGroupId: Types.ObjectId, userId: Types.ObjectId): Promise<RequestJoinGroup> {
      const requestJoinGroup = await this.RequestJoinGroupModel.findById(requestJoinGroupId);
      if (!requestJoinGroup) {
        throw new HttpException('Request not found', HttpStatus.NOT_FOUND);
      }
      if( requestJoinGroup.sender.toString() !== userId.toString()) {
        this.logger.warn('Unauthorized access attempt', HttpStatus.FORBIDDEN);
        throw new HttpException('You are not the sender of this request', HttpStatus.FORBIDDEN);
      }
      await this.RequestJoinGroupModel.findByIdAndDelete(requestJoinGroupId);
      return requestJoinGroup;
    }


}
