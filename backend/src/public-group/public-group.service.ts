import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UserService } from 'src/user/user.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PublicGroup } from './schema/plgroup.schema';
import { MemberGroup } from './schema/membergroup.schema';
import { CreatePublicGroupDto, RuleDto } from './dto/createpublicgroup.dto';
import { RequestJoinGroup } from './schema/requestJoinGroup.schema';
import { PostSchema, Post } from 'src/post/schemas/post.schema';
import { User } from 'src/user/schemas/user.schemas';


@Injectable()
export class PublicGroupService {
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
        file: Express.Multer.File,
      ): Promise<{ publicGroup: PublicGroup; memberGroup: MemberGroup }> {
        // Kiểm tra user tồn tại
        const user = await this.userService.findById(userId.toString());
        if (!user) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
      
        if (!file) {
          throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
        }
      
        let avatargroupUrl: string;
        try {
          const uploadedImage = await this.cloudinaryService.uploadFile(file);
          avatargroupUrl = uploadedImage; 
        } catch (error) {
          throw new HttpException(
            `Failed to upload image: ${error.message}`,
            HttpStatus.BAD_REQUEST,
          );
        }
      

        const rulesArray: RuleDto[] = createPublicGroupDto.rules
          .split(',') 
          .map((ruleText, index) => ({
            ruleText: ruleText.trim(), 
            
          }));
      
        const groupData = {
          groupName: createPublicGroupDto.groupName,
          avatargroup: avatargroupUrl,
          rules: rulesArray, 
          typegroup: createPublicGroupDto.typegroup,
        };
      
        const createdGroup = new this.PublicGroupModel(groupData);
        await createdGroup.save();
      
        const memberGroupData = {
          group: createdGroup._id,
          member: userId,
          role: 'owner',
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
        const group = await this.PublicGroupModel.findById(groupId);
        if (!group) {
          throw new HttpException('Group not found', HttpStatus.NOT_FOUND);
        }

        const requestJoinGroup = {
            group: groupId,
            sender: userId,
            status: 'pending',
        }
        const createdRequestJoinGroup = new this.RequestJoinGroupModel(requestJoinGroup);
        return createdRequestJoinGroup.save();

    }

    async acceptRequestJoinGroup(requestJoinGroupId: Types.ObjectId, userId: string): Promise<MemberGroup> {
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
    
      // If group is private, check if user is admin or owner
      if (grouptype.typegroup === 'private') {
        const memberGroup = await this.MemberGroupModel.findOne({ group: requestJoinGroup.group, member: userId });
        if (!memberGroup || (memberGroup.role !== 'admin' && memberGroup.role !== 'owner')) {
          throw new HttpException('Only admin or owner can accept join requests for private group', HttpStatus.FORBIDDEN);
        }
      }
    
      const group = requestJoinGroup.group;
      const member = requestJoinGroup.sender;
      const newMemberGroup = {
        group,
        member,
        role: 'member',
      };
    
      const createdMemberGroup = new this.MemberGroupModel(newMemberGroup);
      await createdMemberGroup.save();
      await this.RequestJoinGroupModel.findByIdAndDelete(requestJoinGroupId);
    
      return createdMemberGroup;
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
    
      if (grouptype.typegroup === 'private') {
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


}
