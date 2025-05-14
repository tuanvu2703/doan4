
import { HttpException, HttpStatus, Injectable, NotFoundException, Type, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CommentDto } from './dto/comment.dto';
import { Comment } from './schema/comment.schema';
import { promises } from 'dns';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { User } from '../user/schemas/user.schemas';
import { JwtService } from '@nestjs/jwt';
import { Post } from '../post/schemas/post.schema';
import { ProducerService } from 'src/kafka/producer/kafka.Producer.service';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(User.name) private readonly UserModel: Model<User>,
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    private cloudinaryService: CloudinaryService,
    private producerService: ProducerService,

    private jwtService: JwtService,
  ) { }


  async create(
    userId: Types.ObjectId,
    postId: Types.ObjectId,
    commentDto: CommentDto,
    files?: Express.Multer.File[],
  ): Promise<{ comment: Comment; authorId:string }> {
    const swageUserId = new Types.ObjectId(userId);
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    const newCmt = new this.commentModel({
      content: commentDto.content,
      author: userId,
      post: postId,

    });
  
    if (files && files.length > 0) {
      try {
        const uploadImages = await Promise.all(
          files.map((file) => this.cloudinaryService.uploadFile(file)),
        );
        newCmt.img = uploadImages;
      } catch (error) {
        console.error('Error uploading images:', error);
        throw new HttpException('Failed to upload images', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  
    const saveCMT = await newCmt.save();
  
    const post = await this.postModel.findById(postId);
  
    if (!post) {
      throw new NotFoundException('Post not found');
    }
  
    const authorId = post.author.toString();
    const swageAuthor = new Types.ObjectId(authorId);
  
    await this.postModel.findByIdAndUpdate(
      postId,
      {
        $push: { comments: saveCMT._id },
        $inc: { commentsCount: 1 },
      },
      { new: true },
    );

    await this.producerService.sendMessage('report', {
    type: 'new_comment',
    ownerId: post.author, // ID của chủ bài viết
    targetUserId: post.author, // Gửi thông báo cho chủ bài viết
    data: {
      userId: userId, 
      postId: postId,
      commentId: saveCMT._id,
      message: `${user.firstName} ${user.lastName}  đã bình luận vào bài viết của bạn ${new Date().toISOString().split('T')[0]}.`,
      avatar: user.avatar,
      timestamp: new Date(),
    },
  });
    return { comment: saveCMT, authorId };
  }
  
  
  async findAll(): Promise<Comment[]> {
    return this.commentModel.find().populate('author', 'firstName lastName').exec();
  }


  //tìm 1 cmt theo obj của cmt
  async findById(id: Types.ObjectId): Promise<Comment> {
    const comment = await this.commentModel.findById(id).populate('author', 'firstName lastName').exec();
    if (!comment) {
      throw new NotFoundException(`Bình luận có ID "${id}" không tồn tại`);
    }
    return comment;
  }

  //tìm tòn bộ cmt có trong post
  async findByPostId(postId: Types.ObjectId): Promise<Comment[]> {
    return this.commentModel.find({ post: postId }).populate('author', 'firstName lastName avatar').exec();
  }


  //
  async delete(id: Types.ObjectId): Promise<Comment> {
    const deletedComment = await this.commentModel.findByIdAndDelete(id).exec();
    if (!deletedComment) {
      throw new NotFoundException(`Bình luận có ID "${id}" không tồn tại`);
    }

    await this.postModel.findByIdAndUpdate(
      deletedComment.post,
      {
        $pull: { comments: id },
        $inc: { commentsCount: -1 },
      },
      { new: true },
    );

    return deletedComment;
  }

  async update(id: Types.ObjectId, userId: string, commentDto: CommentDto, files?: Express.Multer.File[]): Promise<Comment> {
    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException(`Bình luận có ID "${id}" không tồn tại`);
    }

    if (comment.author.toString() !== userId) {
      throw new HttpException('Bạn không có quyền cập nhật bình luận này', HttpStatus.UNAUTHORIZED);
    }

    comment.content = commentDto.content || comment.content;

    if (files && files.length > 0) {
      try {
        const uploadedImages = await Promise.all(files.map(file => this.cloudinaryService.uploadFile(file)));
        comment.img = uploadedImages;
      } catch (error) {
        console.error('Error uploading images to Cloudinary:', error);
        throw new HttpException('Failed to upload images', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    return await comment.save();
  }

  async reply(parentCommentId: Types.ObjectId, userId: Types.ObjectId, replyDto: CommentDto, files?: Express.Multer.File[]): Promise<Comment> {
    const parentComment = await this.commentModel.findById(parentCommentId);

    if (!parentComment) {
      throw new NotFoundException(`Bình luận có ID "${parentCommentId}" không tồn tại`);
    }

    const newReply = new this.commentModel({
      content: replyDto.content,
      author: userId,
      post: parentComment.post,
      replyTo: parentCommentId,
      likes: [],
    });

    if (files && files.length > 0) {
      try {
        const uploadedImages = await Promise.all(files.map(file => this.cloudinaryService.uploadFile(file)));
        newReply.img = uploadedImages;

      } catch (error) {
        console.error('Error uploading images to Cloudinary:', error);
        throw new HttpException('Failed to upload images', HttpStatus.INTERNAL_SERVER_ERROR);
      }

    }

    return await newReply.save();
  }
  /**
     * Like a comment by a user.
     * @param commentId - The ID of the comment to like (MongoDB ObjectId).
     * @param userId - The ID of the user who likes the comment (MongoDB ObjectId).
     * @returns A promise that resolves to an object containing the updated comment and the author's ID.
     * @throws {NotFoundException} If the comment with the given ID does not exist.
     * @throws {HttpException} If the user has already liked the comment.
     */
    async likeComment(commentId: Types.ObjectId, userId: Types.ObjectId): Promise<{ comment: Comment; authorId: string }> {
        this.logger.log(`Attempting to like comment ${commentId} by user ${userId}`);

        const comment = await this.commentModel.findOneAndUpdate(
            {
                _id: commentId,
                likes: { $ne: userId.toString() }, // Chỉ cập nhật nếu user chưa like
            },
            {
                $push: { likes: userId.toString() },
                $inc: { likesCount: 1 }, // Tăng likesCount (nếu có trường này trong schema)
            },
            { new: true }
        );

        if (!comment) {
            const commentExists = await this.commentModel.findById(commentId);
            if (!commentExists) {
                this.logger.warn(`Comment with ID "${commentId}" not found when user ${userId} tried to like`);
                throw new NotFoundException(`Bình luận có ID "${commentId}" không tồn tại`);
            }
            this.logger.warn(`User ${userId} has already liked comment ${commentId}`);
            throw new HttpException('Bạn đã thích bình luận này', HttpStatus.BAD_REQUEST);
        }

        const authorId = comment.author.toString();
        this.logger.log(`User ${userId} successfully liked comment ${commentId} by author ${authorId}`);

        return { comment, authorId };
    }

    /**
     * Unlike a comment by a user.
     * @param commentId - The ID of the comment to unlike (MongoDB ObjectId).
     * @param userId - The ID of the user who unlikes the comment (MongoDB ObjectId).
     * @returns A promise that resolves to the updated comment after unliking.
     * @throws {NotFoundException} If the comment with the given ID does not exist.
     * @throws {HttpException} If the user has not liked the comment.
     */
    async unlikeComment(commentId: Types.ObjectId, userId: Types.ObjectId): Promise<Comment> {
        this.logger.log(`Attempting to unlike comment ${commentId} by user ${userId}`);

        const comment = await this.commentModel.findOneAndUpdate(
            {
                _id: commentId,
                likes: userId.toString(), // Chỉ cập nhật nếu user đã like
            },
            {
                $pull: { likes: userId.toString() },
                $inc: { likesCount: -1 }, // Giảm likesCount (nếu có trường này trong schema)
            },
            { new: true }
        );

        if (!comment) {
            const commentExists = await this.commentModel.findById(commentId);
            if (!commentExists) {
                this.logger.warn(`Comment with ID "${commentId}" not found when user ${userId} tried to unlike`);
                throw new NotFoundException(`Bình luận có ID "${commentId}" không tồn tại`);
            }
            this.logger.warn(`User ${userId} has not liked comment ${commentId} to unlike`);
            throw new HttpException('Bạn chưa thể unlike', HttpStatus.BAD_REQUEST);
        }

        this.logger.log(`User ${userId} successfully unliked comment ${commentId}`);

        return comment;
    }

    /**
     * Dislike a comment by a user.
     * @param commentId - The ID of the comment to dislike (MongoDB ObjectId).
     * @param userId - The ID of the user who dislikes the comment (MongoDB ObjectId).
     * @returns A promise that resolves to the updated comment after disliking.
     * @throws {NotFoundException} If the comment with the given ID does not exist.
     * @throws {HttpException} If the user has already disliked the comment.
     */
    async dislikeComment(commentId: Types.ObjectId, userId: Types.ObjectId): Promise<{ comment: Comment; authorId: string }> {
        this.logger.log(`Attempting to dislike comment ${commentId} by user ${userId}`);

        const comment = await this.commentModel.findOneAndUpdate(
            {
                _id: commentId,
                dislikes: { $ne: userId.toString() }, // Chỉ cập nhật nếu user chưa dislike
            },
            {
                $push: { dislikes: userId.toString() },
                $inc: { dislikesCount: 1 }, // Tăng dislikesCount (nếu có trường này trong schema)
            },
            { new: true }
        );

        if (!comment) {
            const commentExists = await this.commentModel.findById(commentId);
            if (!commentExists) {
                this.logger.warn(`Comment with ID "${commentId}" not found when user ${userId} tried to dislike`);
                throw new NotFoundException(`Bình luận có ID "${commentId}" không tồn tại`);
            }
            this.logger.warn(`User ${userId} has already disliked comment ${commentId}`);
            throw new HttpException('Bạn đã không thích bình luận này', HttpStatus.BAD_REQUEST);
        }

        const authorId = comment.author.toString();
        this.logger.log(`User ${userId} successfully disliked comment ${commentId} by author ${authorId}`);

        return { comment, authorId };
    }

    /**
     * Undislike a comment by a user.
     * @param commentId - The ID of the comment to undislike (MongoDB ObjectId).
     * @param userId - The ID of the user who undislikes the comment (MongoDB ObjectId).
     * @returns A promise that resolves to the updated comment after undisliking.
     * @throws {NotFoundException} If the comment with the given ID does not exist.
     * @throws {HttpException} If the user has not disliked the comment.
     */
    async undislikeComment(commentId: Types.ObjectId, userId: Types.ObjectId): Promise<Comment> {
        this.logger.log(`Attempting to undislike comment ${commentId} by user ${userId}`);

        const comment = await this.commentModel.findOneAndUpdate(
            {
                _id: commentId,
                dislikes: userId.toString(), // Chỉ cập nhật nếu user đã dislike
            },
            {
                $pull: { dislikes: userId.toString() },
                $inc: { dislikesCount: -1 }, // Giảm dislikesCount (nếu có trường này trong schema)
            },
            { new: true }
        );

        if (!comment) {
            const commentExists = await this.commentModel.findById(commentId);
            if (!commentExists) {
                this.logger.warn(`Comment with ID "${commentId}" not found when user ${userId} tried to undislike`);
                throw new NotFoundException(`Bình luận có ID "${commentId}" không tồn tại`);
            }
            this.logger.warn(`User ${userId} has not disliked comment ${commentId} to undislike`);
            throw new HttpException('Bạn chưa không thích bình luận này để thực hiện undislike', HttpStatus.BAD_REQUEST);
        }

        this.logger.log(`User ${userId} successfully undisliked comment ${commentId}`);
        return comment;
    }
}