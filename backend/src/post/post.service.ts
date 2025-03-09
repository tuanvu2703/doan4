import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './schemas/post.schema';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/schemas/user.schemas';
import { CreatePostDto } from './dto/createpost.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { settingPrivacyDto } from './dto/settingPrivacy.dto';
import { UpdatePostDto } from './dto/updatePost.dto';
import { PostF } from './interface/PostHomeFeed.interface';
import { Friend } from 'src/user/schemas/friend.schema';
import { firebase } from 'googleapis/build/src/apis/firebase';


@Injectable()
export class PostService {
    constructor(
        @InjectModel(Post.name) private PostModel: Model<Post>,
        @InjectModel(User.name) private UserModel: Model<User>,
        @InjectModel(Friend.name) private FriendModel: Model<Friend>,
        private cloudinaryService: CloudinaryService,
        private jwtService: JwtService
    ) { }

    async createPost(createPostDto: CreatePostDto, userId: Types.ObjectId, files?: Express.Multer.File[]): Promise<{ userPost: User, savedPost: Post }> {
        const swageUserId = new Types.ObjectId(userId);
    
        let allowedUsers: Types.ObjectId[] = [];

        if (createPostDto.privacy === 'specific') {
            if (!createPostDto.allowedUsers) {
                throw new HttpException('Allowed users must be provided for specific privacy', HttpStatus.BAD_REQUEST);
            }
        
            console.log("Raw allowedUsers:", createPostDto.allowedUsers);
        
            let allowedUsersRaw: string[] = [];
        
            if (typeof createPostDto.allowedUsers === 'string') {
                // Ép kiểu `allowedUsers` thành chuỗi trước khi tách
                allowedUsersRaw = (createPostDto.allowedUsers as string).split(',').map(id => id.trim());
                console.log("Processed allowedUsers:", allowedUsers);
            } else if (Array.isArray(createPostDto.allowedUsers)) {
                allowedUsersRaw = createPostDto.allowedUsers as string[];
                console.log("Processed allowedUsers:", allowedUsers);
            }
        
            allowedUsers = allowedUsersRaw.map(id => new Types.ObjectId(id));
            console.log("Processed allowedUsers:", allowedUsers);
        }
        
        const newPost = new this.PostModel({
            content: createPostDto.content,
            author: swageUserId,
            privacy: createPostDto.privacy,
            allowedUsers: allowedUsers, 
            likes: [],
            dislikes: [],
            isActive: true,
        });
    
        if (files && files.length > 0) {
            try {
                const uploadedImages = await Promise.all(files.map(file => this.cloudinaryService.uploadFile(file)));
                newPost.img = uploadedImages;
            } catch (error) {
                throw new HttpException('Failed to upload images', HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    
        // Lưu bài viết vào database
        const savedPost = await newPost.save();
        const userPost = await this.UserModel.findById(userId);
    
        return {
            userPost,
            savedPost
        };
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


    async likePost(postId: Types.ObjectId, userId: Types.ObjectId): Promise<{ post: Post; authorId: string }> {

        const post = await this.PostModel.findByIdAndUpdate(
            postId,
            {
                $addToSet: { likes: userId }, 
                $inc: { likesCount: 1 }, 
            },
            { new: true }
        );

        if (!post) {
            throw new NotFoundException(`Bài viết có ID "${postId}" không tồn tại`);
        }
    
        // Lấy authorId từ bài viết
        const authorId = post.author.toString(); // Giả sử 'author' là ObjectId
    
        return { post, authorId };
    }
    

    async unlikePost(postId: string, userId: string): Promise<Post> {
        const post = await this.PostModel.findByIdAndUpdate(
            postId,
            {
                $pull: { likes: userId },
                $inc: { likesCount: -1 },
            },
            { new: true },
        );

        if (!post) {
            throw new NotFoundException(`Bài viết có ID "${postId}" không tồn tại`);
        }

        return post;
    }

    async dislikePost(postId: string, userId: string): Promise<Post> {
        const post = await this.PostModel.findById(postId);

        if (!post) {
            throw new NotFoundException(`Bài viết có ID "${postId}" không tồn tại`);
        }

        if (post.dislikes.includes(userId)) {
            throw new HttpException('Bạn đã không thích bài viết này', HttpStatus.BAD_REQUEST);
        }

        post.dislikes.push(userId);

        return await post.save();
    }
    async undislikePost(postId: string, userId: string): Promise<Post> {
        const post = await this.PostModel.findById(postId);
        if (!post) {
            throw new NotFoundException(`Bài viết có ID "${postId}" không tồn tại`);
        }
        if (!post.dislikes.includes(userId)) {
            throw new HttpException('Bạn đã không thích bài viết này', HttpStatus.BAD_REQUEST);
        }
        post.dislikes = post.dislikes.filter(dislike => dislike !== userId);
        return await post.save();
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
            const userPosts = await this.PostModel.find({ author: userId, isActive: true }) 
                .populate('author', 'username firstName lastName avatar')
                .exec();
    
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
    
            const post = await this.PostModel.findById(postObjectId);
            if (!post) {
                throw new HttpException('The post does not exist', HttpStatus.NOT_FOUND);
            }
    
            if (post.privacy === 'public') {
                return post;  
            }
    
            if (post.privacy === 'private') {
                if (post.author.equals(userIDOBJ)) {
                    return post; 
                } else {
                    throw new HttpException('You are not authorized to view this post', HttpStatus.UNAUTHORIZED);
                }
            }

            if(!post.isActive){
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
                   
                    if (post.privacy === 'public') {
                        return post;
                    }
    
                    if (post.privacy === 'private') {
                        if (userId.equals(currentUserId)) {
                            return post; // Chỉ tác giả mới xem được
                        }
                        return null;
                    }
                    if(!post.isActive){
                        return null;
                    }
    
                    if (post.privacy === 'friends') {
                       
                        if (userId.equals(currentUserId)) {
                            return post;
                        }
    
                        const isFriend = await this.FriendModel.exists({
                            $or: [
                                { sender: userId, receiver: currentUserId},
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
    

    async getHomeFeed(userId: Types.ObjectId): Promise<Post[]> {
        try {
            const user = await this.UserModel.findById(userId);
            console.log('user successfully');
            if (!user) {
                throw new NotFoundException('User not found');
            } //ok
    
            const friends = await this.FriendModel.find({
                $or: [
                    { sender: userId.toString() }, 
                    { receiver: userId.toString() }, 
                ],
                
            }).exec(); //bug ở đây 
            
    
            const friendIds = friends.map(friend => {
                return friend.sender.toString() === userId.toString() ? friend.receiver : friend.sender;
            });
            const useridSting = userId.toString();
            const conditions: Array<any> = [
                { privacy: 'public' }, // ok
                { isActive: true }, // ok
                { privacy: 'specific', allowedUsers: userId },// ok
                { privacy: 'friends', author: { $in: [...friendIds, useridSting] } }, 
            ];
    
            // Lấy tất cả bài viết dựa trên điều kiện
            const posts = await this.PostModel.find({
                $and: [
                    { privacy: { $ne: 'private' } },
                    { $or: conditions },
                    
                ],
            })
                .populate('author', 'firstName lastName avatar ')
                .populate('likes', '_id')
                .populate('comments', '_id')
                .lean() 
                .exec();
    
            // Tính điểm xếp hạng cho các bài viết
            const scoredPosts = posts.map((post) => {
                const postObj = typeof post.toObject === 'function' ? post.toObject() : post;
                const timeSincePosted = (Date.now() - new Date(postObj.createdAt).getTime()) / (100 * 60 * 60); // Tính số giờ kể từ khi đăng
                const userInterest = friendIds.some((friendId) => friendId.toString() === postObj.author.toString()) ? 1.2 : 1; // Điểm quan tâm từ bạn bè
                const engagement = postObj.likes.length * 3 + postObj.comments.length * 5; // Điểm tương tác
                const timeDecay = 1 / (1 + timeSincePosted); // Giảm dần theo thời gian
                const contentQuality = postObj.privacy === 'public' ? 1 : 0.8; // Điểm chất lượng nội dung
    
                // Tính điểm tổng thể của bài viết
                const rankingScore = userInterest * (engagement + contentQuality) * timeDecay;
                return { ...postObj, rankingScore };
            });
    
            // Sắp xếp bài viết theo điểm xếp hạng từ cao đến thấp
            scoredPosts.sort((a, b) => b.rankingScore - a.rankingScore);
    
            return scoredPosts;
        } catch (error) {
            throw new HttpException('An error occurred while fetching posts', HttpStatus.INTERNAL_SERVER_ERROR);
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
                    const userId = post.author._id; // ID của tác giả bài viết
    
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
    
}
