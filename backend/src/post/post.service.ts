import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { Post } from './schemas/post.schema';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/schemas/user.schemas';
import { CreatePostDto } from './dto/createpost.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { settingPrivacyDto } from './dto/settingPrivacy.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { PostF } from './interface/PostHomeFeed.interface';
import { Friend } from 'src/user/schemas/friend.schema';
import { PublicGroup } from 'src/public-group/schema/plgroup.schema';
import { MemberGroup } from 'src/public-group/schema/membergroup.schema';
import { FeedCursor, PaginatedFeedResult, ProjectedPost } from './interface/FeedcurSord.interface';
import { ProjectedPostDto } from './dto/projected-post.dto';


@Injectable()
export class PostService {
    private readonly logger = new Logger(PostService.name);
    constructor(
        @InjectModel(Post.name) private PostModel: Model<Post>,
        @InjectModel(User.name) private UserModel: Model<User>,
        @InjectModel(PublicGroup.name) private PublicGroupModel: Model<PublicGroup>,
        @InjectModel(MemberGroup.name) private MemberGroupModel: Model<MemberGroup>,
        @InjectModel(Friend.name) private FriendModel: Model<Friend>,
        private cloudinaryService: CloudinaryService,
        private jwtService: JwtService
    ) { }

    async createPost(createPostDto: CreatePostDto, userId: Types.ObjectId, files?: Express.Multer.File[]): Promise<Post> {


        let allowedUsers: Types.ObjectId[] = [];

        let groupId: Types.ObjectId | undefined;
        if (createPostDto.group) {
            try {
                groupId = new Types.ObjectId(createPostDto.group);
            } catch (error) {
                throw new HttpException('Invalid group ID', HttpStatus.BAD_REQUEST);
            }
        }

        if (groupId) {
            const membership = await this.MemberGroupModel.findOne({
                group: groupId,
                member: userId,
            }).exec();

            if (!membership) {
                throw new HttpException('You are not a member of this group', HttpStatus.FORBIDDEN);
            }
            if (membership.blackList) {
                throw new HttpException('You are in the blacklist of this group', HttpStatus.FORBIDDEN);
            }
            if (membership.role === 'member' && createPostDto.privacy !== 'thisGroup') {
                throw new HttpException(
                    'Only admins or owners can set privacy for group posts',
                    HttpStatus.FORBIDDEN,
                );
            }
        }

        if (createPostDto.privacy === 'specific') {
            if (!createPostDto.allowedUsers) {
                throw new HttpException('Allowed users must be provided for specific privacy', HttpStatus.BAD_REQUEST);
            }

            let allowedUsersRaw: string[] = [];

            if (typeof createPostDto.allowedUsers === 'string') {
                allowedUsersRaw = (createPostDto.allowedUsers as string).split(',').map(id => id.trim());
            } else if (Array.isArray(createPostDto.allowedUsers)) {
                allowedUsersRaw = createPostDto.allowedUsers as string[];
            } else {
                throw new HttpException('Invalid allowedUsers format', HttpStatus.BAD_REQUEST);
            }

            allowedUsers = allowedUsersRaw.map(id => new Types.ObjectId(id));
        }


        const newPost = new this.PostModel({
            content: createPostDto.content,
            group: groupId,
            author: userId,
            privacy: createPostDto.privacy,
            allowedUsers: allowedUsers,
            likes: [],
            dislikes: [],
            isActive: true,
        });

        if (createPostDto.gif) {
            newPost.gif = createPostDto.gif;
        }

        if (files && files.length > 0) {
            try {
                const uploadedImages = await Promise.all(
                    files.map(file => this.cloudinaryService.uploadFile(file))
                );
                newPost.img = uploadedImages;
            } catch (error) {
                throw new HttpException('Failed to upload images', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }

        this.logger.log(`User ${userId.toString()} created a new post`, userId.toString(), 'CreatePost', { postId: newPost._id.toString() });

        const savedPost = await newPost.save();
        return savedPost
    }


    async updatePost(postId: string, updatePostDto: UpdatePostDto, userId: string, files?: Express.Multer.File[]): Promise<Post> {
        const post = await this.PostModel.findById(postId);

        if (!post) {
            throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
        }

        if (post.author.toString() !== userId) {
            throw new HttpException('You are not authorized to update this post', HttpStatus.UNAUTHORIZED);
        }

        post.content = updatePostDto.content || post.content;

        if (files && files.length > 0) {

            try {
                const uploadedImages = await Promise.all(
                    files.map(file => this.cloudinaryService.uploadFile(file))
                );
                post.img = uploadedImages;
            } catch (error) {

                throw new HttpException('Failed to upload images', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        const updatedPost = await post.save();
        return updatedPost;
    }

    async deletePost(postId: string, userId: string): Promise<{ message: string }> {
        const post = await this.PostModel.findById(postId);

        if (!post) {
            throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
        }

        if (post.author.toString() !== userId) {
            throw new HttpException('You are not authorized to delete this post', HttpStatus.UNAUTHORIZED);
        }
        await this.PostModel.findByIdAndDelete(postId);

        return { message: 'Post deleted successfully' };
    }


    /**
     * Like a post by a user.
     * @param postId - The ID of the post to like (MongoDB ObjectId).
     * @param userId - The ID of the user who likes the post (MongoDB ObjectId).
     * @returns A promise that resolves to an object containing the updated post and the author's ID.
     * @throws {NotFoundException} If the post with the given ID does not exist.
     * @throws {BadRequestException} If the user has already liked the post.
     */
    async likePost(postId: Types.ObjectId, userId: Types.ObjectId): Promise<{ post: Post; authorId: string }> {
        this.logger.log(`Attempting to like post ${postId} by user ${userId}`);

        const post = await this.PostModel.findById(postId);

        if (!post) {
            this.logger.warn(`Post with ID "${postId}" not found when user ${userId} tried to like`);
            throw new NotFoundException(`Bài viết có ID "${postId}" không tồn tại`);
        }

        const user = userId.toString();
        const hasLiked = post.likes.includes(user);
        if (hasLiked) {
            this.logger.warn(`User ${userId} has already liked post ${postId}`);
            throw new BadRequestException(`User ${userId} đã like bài viết ${postId} rồi`);
        }

        const updatedPost = await this.PostModel.findByIdAndUpdate(
            postId,
            {
                $addToSet: { likes: userId },
                $inc: { likesCount: 1 },
            },
            { new: true }
        );

        if (!updatedPost) {
            this.logger.error(`Failed to update post ${postId} for user ${userId}`);
            throw new NotFoundException(`Bài viết có ID "${postId}" không tồn tại`);
        }

        const authorId = updatedPost.author.toString();
        this.logger.log(`User ${userId} successfully liked post ${postId} by author ${authorId}`);

        return { post: updatedPost, authorId };
    }

    /**
     * Unlike a post by a user.
     * @param postId - The ID of the post to unlike (string representation of MongoDB ObjectId).
     * @param userId - The ID of the user who unlikes the post (string representation of MongoDB ObjectId).
     * @returns A promise that resolves to the updated post after unliking.
     * @throws {NotFoundException} If the post with the given ID does not exist.
     * @throws {BadRequestException} If the user has not liked the post.
     */
    async unlikePost(postId: Types.ObjectId, userId: Types.ObjectId): Promise<Post> {
        this.logger.log(`Attempting to unlike post ${postId} by user ${userId}`);

        const post = await this.PostModel.findOneAndUpdate(
            {
                _id: postId,
                likes: userId,
            },
            {
                $pull: { likes: userId },
                $inc: { likesCount: -1 },
            },
            { new: true }
        );

        if (!post) {
            const postExists = await this.PostModel.findById(postId);
            if (!postExists) {
                this.logger.warn(`Post with ID "${postId}" not found when user ${userId} tried to unlike`);
                throw new NotFoundException(`Bài viết có ID "${postId}" không tồn tại`);
            }
            this.logger.warn(`User ${userId} has not liked post ${postId} to unlike`);
            throw new BadRequestException(`Bạn chưa like bài viết ${postId} để thực hiện unlike`);
        }

        this.logger.log(`User ${userId} successfully unliked post ${postId}`);

        return post;
    }

    /**
     * Dislike a post by a user.
     * @param postId - The ID of the post to dislike (string representation of MongoDB ObjectId).
     * @param userId - The ID of the user who dislikes the post (string representation of MongoDB ObjectId).
     * @returns A promise that resolves to the updated post after disliking.
     * @throws {NotFoundException} If the post with the given ID does not exist.
     * @throws {HttpException} If the user has already disliked the post.
     */
    async dislikePost(postId: Types.ObjectId, userId: Types.ObjectId): Promise<Post> {
        this.logger.log(`Attempting to dislike post ${postId} by user ${userId}`);

        const post = await this.PostModel.findOneAndUpdate(
            {
                _id: postId,
                dislikes: { $ne: userId },
            },
            {
                $push: { dislikes: userId },
                $inc: { dislikesCount: 1 },
            },
            { new: true }
        );

        if (!post) {
            const postExists = await this.PostModel.findById(postId);
            if (!postExists) {
                this.logger.warn(`Post with ID "${postId}" not found when user ${userId} tried to dislike`);
                throw new NotFoundException(`Bài viết có ID "${postId}" không tồn tại`);
            }
            this.logger.warn(`User ${userId} has already disliked post ${postId}`);
            throw new HttpException('Bạn đã không thích bài viết này', HttpStatus.BAD_REQUEST);
        }

        this.logger.log(`User ${userId} successfully disliked post ${postId}`);

        return post;
    }

    /**
     * Undislike a post by a user.
     * @param postId - The ID of the post to undislike (string representation of MongoDB ObjectId).
     * @param userId - The ID of the user who undislikes the post (string representation of MongoDB ObjectId).
     * @returns A promise that resolves to the updated post after undisliking.
     * @throws {NotFoundException} If the post with the given ID does not exist.
     * @throws {HttpException} If the user has not disliked the post.
     */
    async undislikePost(postId: Types.ObjectId, userId: Types.ObjectId): Promise<Post> {
        this.logger.log(`Attempting to undislike post ${postId} by user ${userId}`);

        const post = await this.PostModel.findOneAndUpdate(
            {
                _id: postId,
                dislikes: userId,
            },
            {
                $pull: { dislikes: userId },
                $inc: { dislikesCount: -1 },
            },
            { new: true }
        );

        if (!post) {
            const postExists = await this.PostModel.findById(postId);
            if (!postExists) {
                this.logger.warn(`Post with ID "${postId}" not found when user ${userId} tried to undislike`);
                throw new NotFoundException(`Bài viết có ID "${postId}" không tồn tại`);
            }
            this.logger.warn(`User ${userId} has not disliked post ${postId} to undislike`);
            throw new HttpException('Bạn chưa không thích bài viết này để thực hiện undislike', HttpStatus.BAD_REQUEST);
        }

        this.logger.log(`User ${userId} successfully undisliked post ${postId}`);

        return post;
    }

    async settingPrivacy(postId: Types.ObjectId, settingPrivacyDto: settingPrivacyDto, userId: Types.ObjectId): Promise<Post> {
        try {
            const post = await this.PostModel.findOne({ _id: postId, author: userId });

            if (!post) {
                throw new HttpException('The post does not exist or you are not authorized', HttpStatus.NOT_FOUND);
            }

            let allowedUsers: Types.ObjectId[] = [];
            if (settingPrivacyDto.privacy === 'specific') {
                if (!Array.isArray(settingPrivacyDto.allowedUsers) || settingPrivacyDto.allowedUsers.length === 0) {
                    throw new HttpException('Allowed users must be provided for specific privacy', HttpStatus.BAD_REQUEST);
                }
                allowedUsers = settingPrivacyDto.allowedUsers.map(id => new Types.ObjectId(id));
            }

            post.privacy = settingPrivacyDto.privacy;
            post.allowedUsers = allowedUsers;
            return await post.save();
        } catch (error) {
            throw new HttpException(
                error.message || 'An error occurred while updating post privacy',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }



    async findPostCurrentUser(userId: Types.ObjectId): Promise<Post[]> {
        try {
            const userPosts = await this.PostModel.find(
                {
                    author: userId,
                    isActive: true,
                    group: { $in: [null, undefined] }
                })
                .populate('author', 'username firstName lastName avatar')
                .exec();

            this.logger.log(
                `User ${userId.toString()} fetched their posts (excluding group posts)`,
                userId.toString(),
                'FindPostCurrentUser',
                { postCount: userPosts.length },
            );

            return userPosts;
        } catch (error) {
            throw new HttpException('Could not retrieve posts', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findPostPrivacy(postId: string, userId: string): Promise<Post> {
        try {
            const user = await this.UserModel.findById(userId);
            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }
            const userIDOBJ = new Types.ObjectId(user._id.toString());
            const postObjectId = new Types.ObjectId(postId);

            const post = await this.PostModel.findById(postObjectId)
                .populate({ path: 'group', select: 'groupName' });

            if (!post) {
                throw new HttpException('The post does not exist', HttpStatus.NOT_FOUND);
            }

            if (post.privacy === 'public') {
                return post;
            }

            if (post.privacy === 'thisGroup') {
                return post;
            }

            if (post.privacy === 'private') {
                if (post.author.equals(userIDOBJ)) {
                    return post;
                } else {
                    throw new HttpException('You are not authorized to view this post', HttpStatus.UNAUTHORIZED);
                }
            }

            if (!post.isActive) {
                return null;
            }

            if (post.privacy === 'friends') {
                if (post.author.equals(userIDOBJ)) {
                    return post;
                }

                const isFriend = await this.FriendModel.exists({
                    $or: [
                        { sender: userIDOBJ, receiver: post.author },
                        { sender: post.author, receiver: userIDOBJ }
                    ],
                });

                if (isFriend) {
                    return post;
                } else {
                    throw new HttpException('You are not friends with the author', HttpStatus.UNAUTHORIZED);
                }
            }

            if (post.privacy === 'specific') {

                if (post.allowedUsers.some((allowedUser) => allowedUser.toString() === userIDOBJ.toString())) {
                    return post;
                } else {
                    throw new HttpException('You are not authorized to view this post', HttpStatus.UNAUTHORIZED);
                }
            }
            throw new HttpException('Invalid post privacy setting', HttpStatus.BAD_REQUEST);
        } catch (error) {
            throw error;
        }
    }

    async getPostsByUser(userId: Types.ObjectId, currentUserId?: Types.ObjectId): Promise<Post[]> {
        try {
            const posts = await this.PostModel.find({ author: userId });
            console.log(posts);
            const filteredPosts = await Promise.all(
                posts.map(async (post) => {

                    if (!post.isActive) {
                        return null;
                    }

                    if (post.privacy === 'public') {
                        return post;
                    }


                    if (post.privacy === 'private') {
                        if (userId.equals(currentUserId)) {
                            return post; // Chỉ tác giả mới xem được
                        }
                        return null;
                    }

                    if (post.group) {
                        return null;
                    }

                    if (post.privacy === 'friends') {

                        if (userId.equals(currentUserId)) {
                            return post;
                        }

                        const isFriend = await this.FriendModel.exists({
                            $or: [
                                { sender: userId, receiver: currentUserId },
                                { sender: currentUserId, receiver: userId },
                            ],
                        });

                        if (isFriend) {
                            return post;
                        }
                        return null;
                    }

                    if (post.privacy === 'specific') {
                        if (
                            post.allowedUsers.some((id) =>
                                id.toString() === currentUserId?.toString()
                            )
                        ) {
                            return post;
                        }
                        return null;
                    }
                    return null;
                })
            );

            return filteredPosts.filter((post) => post !== null);
        } catch (error) {
            console.error('Error in getPostsByUser:', error);
            throw new HttpException(
                'An error occurred while fetching posts',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getALlPost(): Promise<Post[]> {
        try {
            const posts = await this.PostModel.find();
            return posts;
        } catch (error) {
            throw new HttpException('Could not retrieve posts', HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    //ok thì cái này không còn phù hợp nữa
    //sửa logic lại
    // chỉa thành 4 giai đoạn cho đễ pảo chì
    //1 match 1 lược để lấy full post hợp lệ
    //2 lookup để lấy thông tin
    //3 tính điểm
    // match 1 lân nữa dựa theo cursor
    // muống sài cursor thì tạo vài cái interface

    async getHomeFeedtest(
        userId: Types.ObjectId,
        limit = 10,
        // cursor giờ sẽ là object { lastPriorityLevel, lastSortTime, lastId } do Pipe mới xử lý
        cursor?: FeedCursor
    ): Promise<PaginatedFeedResult<ProjectedPost, string | null>> {
        try {
            const user = await this.UserModel.findById(userId);
            if (!user) throw new NotFoundException('User not found');

            const userIdObject = new Types.ObjectId(userId);

            // 1. Lấy thông tin friend và group (Giữ nguyên)
            const friends = await this.FriendModel.find({ $or: [{ sender: userIdObject, status: 'friend' }, { receiver: userIdObject, status: 'friend' }] }).select('sender receiver').lean();
            const friendIds = friends.map(f => userIdObject.equals(f.sender.toString()) ? f.receiver : f.sender);
            const memberships = await this.MemberGroupModel.find({ member: userIdObject, blackList: false }).select('group').lean();
            const memberGroupIds = memberships.map(m => m.group);

            // Định nghĩa ngưỡng thời gian "Mới" và "Gần đây" (ví dụ: 48 giờ)
            const timeThreshold = new Date(Date.now() - 48 * 60 * 60 * 1000);

            // 3. Pipeline Aggregation
            const pipeline: PipelineStage[] = [];

            // ----- Giai đoạn 1: $match ban đầu (Mở rộng để bao gồm Public từ người lạ) -----
            pipeline.push({
                $match: {
                    isActive: true,
                    $or: [
                        // Own posts
                        { author: userIdObject },
                        // Friend's posts (viewable)
                        { author: { $in: friendIds }, $or: [{ privacy: 'friends' }, { privacy: 'public' }, { privacy: 'specific', allowedUsers: userIdObject }] },
                        // Group posts (member)
                        { group: { $in: memberGroupIds } },
                        // Public posts from others (not self, not friend, not group post)
                        { author: { $nin: [userIdObject, ...friendIds] }, group: { $in: [null, undefined] }, privacy: 'public' },
                        // Specific posts from others allowed for user
                        { author: { $nin: [userIdObject, ...friendIds] }, privacy: 'specific', allowedUsers: userIdObject }
                    ]
                }
            });

            // ----- Giai đoạn 2: $lookup (Giữ nguyên) -----
            pipeline.push(
                { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorInfo' } },
                { $unwind: { path: '$authorInfo', preserveNullAndEmptyArrays: false } },
                { $lookup: { from: 'publicgroups', localField: 'group', foreignField: '_id', as: 'groupInfo' } },
                // Lookup comments để lấy latestCommentTime
                { $lookup: { from: 'comments', localField: 'comments', foreignField: '_id', as: 'commentObjects', pipeline: [{ $project: { createdAt: 1 } }] } }
            );

            // ----- Giai đoạn 3: $addFields - Tính toán các yếu tố trung gian -----
            pipeline.push({
                $addFields: {
                    latestCommentTime: { $ifNull: [{ $max: '$commentObjects.createdAt' }, '$createdAt'] }, // Thời gian tương tác cuối (comment hoặc post)
                    isFriendPost: { $in: ['$author', friendIds] },
                    isGroupPost: { $cond: { if: '$group', then: true, else: false } }, // Check group field exists
                    isOwnPost: { $eq: ['$author', userIdObject] },
                }
            });
            // Tách riêng $addFields để tránh phụ thuộc vòng tròn tiềm ẩn
            pipeline.push({
                $addFields: {
                    isPublicFromOther: {
                        $and: [
                            { $eq: ['$privacy', 'public'] },
                            { $eq: ['$isOwnPost', false] },
                            { $eq: ['$isFriendPost', false] },
                            { $eq: ['$isGroupPost', false] }
                        ]
                    },
                    isNewPost: { $gte: ['$createdAt', timeThreshold] }, // Bài viết mới (trong 48h)
                    hasRecentComment: { // Có tương tác gần đây (trong 48h) VÀ khác thời gian tạo bài
                        $and: [
                            { $ne: ['$latestCommentTime', '$createdAt'] }, // Phải là comment mới, không phải lúc tạo bài
                            { $gte: ['$latestCommentTime', timeThreshold] }
                        ]
                    }
                }
            });

            // ----- Giai đoạn 4: $addFields - Gán Mức Ưu Tiên (priorityLevel) -----
            pipeline.push({
                $addFields: {
                    priorityLevel: {
                        $switch: {
                            branches: [
                                // Ưu tiên cao nhất: Bài mới của bạn bè
                                { case: { $and: ['$isFriendPost', '$isNewPost'] }, then: 6 },
                                // Ưu tiên 5: Bài mới trong group
                                { case: { $and: ['$isGroupPost', '$isNewPost'] }, then: 5 },
                                // Ưu tiên 4: Bài cũ bạn bè có tương tác mới
                                { case: { $and: ['$isFriendPost', { $not: '$isNewPost' }, '$hasRecentComment'] }, then: 4 },
                                // Ưu tiên 3: Bài cũ group có tương tác mới
                                { case: { $and: ['$isGroupPost', { $not: '$isNewPost' }, '$hasRecentComment'] }, then: 3 },
                                // Ưu tiên 2: Bài mới của chính mình
                                { case: { $and: ['$isOwnPost', '$isNewPost'] }, then: 2 },
                            ],
                            default: 1 // Mức ưu tiên thấp nhất cho các trường hợp còn lại
                        }
                    }
                }
            });

            // ----- Giai đoạn 5: $addFields - Xác định Khóa Sắp xếp Phụ (sortTime) -----
            pipeline.push({
                $addFields: {
                    sortTime: { // Dùng latestCommentTime cho bài cũ có tương tác mới, còn lại dùng createdAt
                        $cond: {
                            if: { $in: ['$priorityLevel', [4, 3]] }, // Mức 4 và 3
                            then: '$latestCommentTime',
                            else: '$createdAt'
                        }
                    }
                }
            });

            // ----- Giai đoạn 6: $match dựa trên Cursor Input (LOGIC MỚI) -----
            if (cursor) {
                // Pipe đã giải mã cursor thành { lastPriorityLevel, lastSortTime, lastId }
                // lastSortTime là Date object, lastId là ObjectId object
                pipeline.push({
                    $match: {
                        $or: [
                            // 1. Ưu tiên THẤP hơn hẳn (vì sort priorityLevel DESC)
                            { priorityLevel: { $lt: cursor.lastPriorityLevel } },
                            // 2. Cùng ưu tiên, thời gian sort CŨ hơn hẳn (vì sort sortTime DESC)
                            {
                                priorityLevel: cursor.lastPriorityLevel,
                                sortTime: { $lt: cursor.lastSortTime }
                            },
                            // 3. Cùng ưu tiên, cùng thời gian sort, _id NHỎ hơn (vì sort _id DESC)
                            {
                                priorityLevel: cursor.lastPriorityLevel,
                                sortTime: cursor.lastSortTime,
                                _id: { $lt: cursor.lastId }
                            }
                        ]
                    }
                });
            }

            // ----- Giai đoạn 7: $sort (THEO LOGIC MỚI) -----
            pipeline.push({
                $sort: { priorityLevel: -1, sortTime: -1, _id: -1 }
            });

            // ----- Giai đoạn 8: $limit (Lấy limit + 1) -----
            const queryLimit = limit + 1;
            pipeline.push({ $limit: queryLimit });

            // ----- Giai đoạn 9: $project (Định hình kết quả và giữ lại trường cho cursor) -----
            pipeline.push({
                $project: {
                    // Các trường trả về cho client
                    _id: 1, content: 1, img: 1, gif: 1, privacy: 1, createdAt: 1, likesCount: 1, commentsCount: 1,
                    author: { _id: '$authorInfo._id', firstName: '$authorInfo.firstName', lastName: '$authorInfo.lastName', avatar: '$authorInfo.avatar' },
                    group: { // Xử lý group an toàn
                        $let: {
                            vars: { groupDoc: { $ifNull: [{ $arrayElemAt: ['$groupInfo', 0] }, null] } },
                            in: { $cond: { if: '$$groupDoc', then: { _id: '$$groupDoc._id', groupName: '$$groupDoc.groupName', avatargroup: '$$groupDoc.avatargroup', typegroup: '$$groupDoc.typegroup' }, else: null } }
                        }
                    },
                    // Các trường dùng để tạo cursor (tên tạm) - LƯU Ý TÊN MỚI
                    _priorityLevelForCursor: '$priorityLevel',
                    _sortTimeForCursor: '$sortTime',
                    // _id đã có sẵn
                }
            });

            // 4. Thực thi Pipeline
            const aggregatedResults: any[] = await this.PostModel.aggregate(pipeline);

            // 5. Xác định và Mã hóa Next Cursor (LOGIC MỚI với 3 thành phần)
            let nextCursorString: string | null = null;
            const hasMore = aggregatedResults.length > limit;

            if (hasMore) {
                const lastPostForCursor = aggregatedResults[limit]; // Lấy bản ghi thừa

                // Tạo đối tượng dữ liệu cursor MỚI
                const cursorData = {
                    lastPriorityLevel: lastPostForCursor._priorityLevelForCursor,
                    // Chuyển Date thành chuỗi ISO 8601
                    lastSortTime: lastPostForCursor._sortTimeForCursor.toISOString(),
                    // Chuyển ObjectId thành chuỗi
                    lastId: lastPostForCursor._id.toString(),
                };

                const jsonString = JSON.stringify(cursorData);
                nextCursorString = Buffer.from(jsonString).toString('base64url');
                aggregatedResults.pop(); // Bỏ bản ghi thừa
            }

            // 6. Dọn dẹp và Trả về kết quả
            const postsForClient = aggregatedResults.map(p => {
                // Loại bỏ các trường tạm
                const { _priorityLevelForCursor, _sortTimeForCursor, ...rest } = p;
                return rest;
            }) as ProjectedPost[];

            return {
                posts: postsForClient,
                nextCursor: nextCursorString,
            };

        } catch (error) {
            console.error('Error in getHomeFeed (Priority Logic):', error);
            if (error instanceof NotFoundException) { throw error; }
            if (error.name === 'MongoServerError' || error.code) { console.error('MongoDB Aggregation Error:', JSON.stringify(error, null, 2)); }
            throw new HttpException('Error fetching home feed', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    async getHomeFeed(userId: Types.ObjectId): Promise<ProjectedPost[]> {
        try {
            const user = await this.UserModel.findById(userId);
            if (!user) throw new NotFoundException('User not found');

            const userIdObject = new Types.ObjectId(userId);

            // Lấy danh sách bạn bè và nhóm
            const friends = await this.FriendModel.find({
                $or: [{ sender: userIdObject, status: 'friend' }, { receiver: userIdObject, status: 'friend' }],
            })
                .select('sender receiver')
                .lean();
            const friendIds = friends.map((f) => (userIdObject.equals(f.sender.toString()) ? f.receiver : f.sender));
            const memberships = await this.MemberGroupModel.find({ member: userIdObject, blackList: false })
                .select('group')
                .lean();
            const memberGroupIds = memberships.map((m) => m.group);

            const timeThreshold = new Date(Date.now() - 48 * 60 * 60 * 1000);

            // Pipeline Aggregation
            const pipeline: PipelineStage[] = [];

            // Giai đoạn 1: $match để lấy bài viết hợp lệ
            pipeline.push({
                $match: {
                    isActive: true,
                    $or: [
                        { author: userIdObject },
                        { author: { $in: friendIds }, $or: [{ privacy: 'friends' }, { privacy: 'public' }, { privacy: 'specific', allowedUsers: userIdObject }] },
                        { group: { $in: memberGroupIds } },
                        { author: { $nin: [userIdObject, ...friendIds] }, group: { $in: [null, undefined] }, privacy: 'public' },
                        { author: { $nin: [userIdObject, ...friendIds] }, privacy: 'specific', allowedUsers: userIdObject },
                    ],
                },
            });

            // Giai đoạn 2: $lookup
            pipeline.push(
                { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorInfo' } },
                { $unwind: { path: '$authorInfo', preserveNullAndEmptyArrays: false } },
                { $lookup: { from: 'publicgroups', localField: 'group', foreignField: '_id', as: 'groupInfo' } },
                { $lookup: { from: 'comments', localField: 'comments', foreignField: '_id', as: 'commentObjects', pipeline: [{ $project: { createdAt: 1 } }] } },
            );

            // Giai đoạn 3: Tính toán các yếu tố trung gian
            pipeline.push({
                $addFields: {
                    latestCommentTime: { $ifNull: [{ $max: '$commentObjects.createdAt' }, '$createdAt'] },
                    isFriendPost: { $in: ['$author', friendIds] },
                    isGroupPost: { $cond: { if: '$group', then: true, else: false } },
                    isOwnPost: { $eq: ['$author', userIdObject] },
                },
            });

            pipeline.push({
                $addFields: {
                    isPublicFromOther: {
                        $and: [
                            { $eq: ['$privacy', 'public'] },
                            { $eq: ['$isOwnPost', false] },
                            { $eq: ['$isFriendPost', false] },
                            { $eq: ['$isGroupPost', false] },
                        ],
                    },
                    isNewPost: { $gte: ['$createdAt', timeThreshold] },
                    hasRecentComment: {
                        $and: [{ $ne: ['$latestCommentTime', '$createdAt'] }, { $gte: ['$latestCommentTime', timeThreshold] }],
                    },
                },
            });

            // Giai đoạn 4: Gán priorityLevel
            pipeline.push({
                $addFields: {
                    priorityLevel: {
                        $switch: {
                            branches: [
                                { case: { $and: ['$isFriendPost', '$isNewPost'] }, then: 6 },
                                { case: { $and: ['$isGroupPost', '$isNewPost'] }, then: 5 },
                                { case: { $and: ['$isFriendPost', { $not: '$isNewPost' }, '$hasRecentComment'] }, then: 4 },
                                { case: { $and: ['$isGroupPost', { $not: '$isNewPost' }, '$hasRecentComment'] }, then: 3 },
                                { case: { $and: ['$isOwnPost', '$isNewPost'] }, then: 2 },
                            ],
                            default: 1,
                        },
                    },
                },
            });

            // Giai đoạn 5: Xác định sortTime
            pipeline.push({
                $addFields: {
                    sortTime: {
                        $cond: {
                            if: { $in: ['$priorityLevel', [4, 3]] },
                            then: '$latestCommentTime',
                            else: '$createdAt',
                        },
                    },
                },
            });

            // Giai đoạn 6: Sắp xếp
            pipeline.push({
                $sort: { priorityLevel: -1, sortTime: -1, _id: -1 },
            });

            // Giai đoạn 7: Định hình kết quả
            pipeline.push({
                $project: {
                    _id: 1,
                    content: 1,
                    img: 1,
                    gif: 1,
                    privacy: 1,
                    likes: 1,
                    dislikes: 1,
                    createdAt: 1,
                    likesCount: 1,
                    commentsCount: 1,
                    dislikesCount: 1,
                    author: {
                        _id: '$authorInfo._id',
                        firstName: '$authorInfo.firstName',
                        lastName: '$authorInfo.lastName',
                        avatar: '$authorInfo.avatar',
                    },
                    group: {
                        $let: {
                            vars: { groupDoc: { $ifNull: [{ $arrayElemAt: ['$groupInfo', 0] }, null] } },
                            in: {
                                $cond: {
                                    if: '$$groupDoc',
                                    then: { _id: '$$groupDoc._id', groupName: '$$groupDoc.groupName', avatargroup: '$$groupDoc.avatargroup', typegroup: '$$groupDoc.typegroup' },
                                    else: null,
                                },
                            },
                        },
                    },
                },
            });

            // Thực thi pipeline
            const posts = (await this.PostModel.aggregate(pipeline)) as ProjectedPost[];

            // Ghi log
            this.logger.log(
                `User ${userId.toString()} fetched home feed`,
                userId.toString(),
                'GetHomeFeed',
                { postCount: posts.length },
            );

            return posts;
        } catch (error) {
            this.logger.error(
                `Failed to fetch home feed for user ${userId.toString()}`,
                userId.toString(),
                'GetHomeFeed',
                error.stack,
                {},
            );
            if (error instanceof NotFoundException) {
                throw error;
            }
            if (error.name === 'MongoServerError' || error.code) {
                console.error('MongoDB Aggregation Error:', JSON.stringify(error, null, 2));
            }
            throw new HttpException('Error fetching home feed', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getPostByContent(content: string, currentUserId?: Types.ObjectId): Promise<Post[]> {
        try {
            const posts = await this.PostModel.find({
                content: { $regex: content, $options: 'i' }
            })
                .populate({
                    path: 'author',
                    select: 'firstName lastName avatar'
                })
                .exec();

            if (!posts.length) {
                throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
            }

            const filteredPosts = await Promise.all(
                posts.map(async (post) => {
                    const userId = post.author

                    if (!post.isActive) {
                        return null; //thêm cái đìu kiệng is active dô  níu là false thì sủi
                    }

                    if (post.privacy === 'public') {
                        return post;
                    }

                    if (post.privacy === 'private') {
                        if (userId.equals(currentUserId)) {
                            return post; // author xem được còn lại chim xẻ
                        }
                        return null;
                    }

                    if (post.privacy === 'friends') {
                        if (userId.equals(currentUserId)) {
                            return post;
                        }

                        const isFriend = await this.FriendModel.exists({
                            $or: [
                                { sender: userId, receiver: currentUserId },
                                { sender: currentUserId, receiver: userId },
                            ],
                        });

                        if (isFriend) {
                            return post;
                        }
                        return null;
                    }

                    if (post.privacy === 'specific') {
                        if (
                            post.allowedUsers.some((id) =>
                                id.toString() === currentUserId?.toString()
                            )
                        ) {
                            return post;
                        }
                        return null;
                    }

                    return null;
                })
            );

            return filteredPosts.filter((post) => post !== null);
        } catch (error) {
            console.error('Error in getPostByContent:', error);
            throw new HttpException(
                'An error occurred while searching for posts',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async ActivePost(postId: Types.ObjectId, userId: Types.ObjectId): Promise<Post> {
        this.logger.log(`Attempting to deactivate post ${postId} by user ${userId}`);
        const post = await this.PostModel.findById(postId);
        if (!post) {
            this.logger.warn(`Post with ID "${postId}" not found when user ${userId} tried to deactivate`);
            throw new NotFoundException(`Bài viết có ID "${postId}" không tồn tại`);
        }
        post.isActive = !post.isActive;
        await post.save();
        this.logger.log(`User ${userId} successfully deactivated post ${postId}`);
        return post;
    }


}
