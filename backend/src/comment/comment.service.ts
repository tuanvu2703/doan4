
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentDto } from './dto/comment.dto';
import { Comment } from './schema/comment.schema';
import { promises } from 'dns';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { User } from '../user/schemas/user.schemas';
import { JwtService } from '@nestjs/jwt';
import { PostService } from 'src/post/post.service';
import { Post } from '../post/schemas/post.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(User.name) private readonly UserModel: Model<User>,
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
    private cloudinaryService: CloudinaryService,
    private postService: PostService,
    private jwtService: JwtService,
  ) { }

  //tạo cmt lần đầu
  async create(
    userId: string,
    postId: string,
    commentDto: CommentDto,
    files?: Express.Multer.File[],
  ): Promise<{ comment: Comment; authorId: string }> {
    const newCmt = new this.commentModel({
      content: commentDto.content,
      author: userId,
      post: postId,
      likes: [],
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
  
    await this.postModel.findByIdAndUpdate(
      postId,
      {
        $push: { comments: saveCMT._id },
        $inc: { commentsCount: 1 },
      },
      { new: true },
    );
  
    return { comment: saveCMT, authorId };
  }
  
  


  //tìm tất cả cmt có trên web
  async findAll(): Promise<Comment[]> {
    return this.commentModel.find().populate('author', 'firstName lastName').exec();
  }


  //tìm 1 cmt theo obj của cmt
  async findById(id: string): Promise<Comment> {
    const comment = await this.commentModel.findById(id).populate('author', 'firstName lastName').exec();
    if (!comment) {
      throw new NotFoundException(`Bình luận có ID "${id}" không tồn tại`);
    }
    return comment;
  }

  //tìm tòn bộ cmt có trong post
  async findByPostId(postId: string): Promise<Comment[]> {
    return this.commentModel.find({ post: postId }).populate('author', 'firstName lastName avatar').exec();
  }


  //
  async delete(id: string): Promise<Comment> {
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

  async update(id: string, userId: string, commentDto: CommentDto, files?: Express.Multer.File[]): Promise<Comment> {
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

  async reply(parentCommentId: string, userId: string, replyDto: CommentDto, files?: Express.Multer.File[]): Promise<Comment> {
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
  async likeComment(commentId: string, userId: string): Promise<{ comment: Comment; authorId: string }> {
    // Tìm bình luận theo ID
    const comment = await this.commentModel.findById(commentId);
  
    if (!comment) {
      throw new NotFoundException(`Bình luận có ID "${commentId}" không tồn tại`);
    }
  
    // Kiểm tra nếu user đã thích bình luận này
    if (comment.likes.includes(userId)) {
      throw new HttpException('Bạn đã thích bình luận này', HttpStatus.BAD_REQUEST);
    }
  
    // Thêm userId vào danh sách likes
    comment.likes.push(userId);
    const updatedComment = await comment.save();
  
    // Lấy ID của người đã viết bình luận
    const authorId = comment.author.toString(); // Giả sử 'author' lưu trữ ID của người viết
  
    return { comment: updatedComment, authorId };
  }
  

  async unlikeComment(commentId: string, userId: string): Promise<Comment> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundException(`Bình luận có ID "${commentId}" không tồn tại`);
    }
    if (!comment.likes.includes(userId)) {
      throw new HttpException('Bạn chưa thể unlike', HttpStatus.BAD_REQUEST);
    }
    comment.likes = comment.likes.filter((id) => id !== userId);
    return await comment.save();
  }
}

