import { Injectable, NotFoundException, ConflictException,Logger  } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProducerService } from '../kafka/producer/kafka.Producer.service';
import { CreateReportDto } from './dto/CreateReport.dto';
import { User } from '../user/schemas/user.schemas';
import { Post } from '../post/schemas/post.schema';
import { Report } from './schema/report.schema';
import { EventService } from 'src/event/event.service';
import { ImplementationDto } from './dto/implementation.dto';
import { Appeal } from './schema/appeal.schema';
import { CreateAppealDto } from './dto/CreateAppeal.dto';


@Injectable()
export class ReportService {
    private readonly logger = new Logger(ReportService.name);
    constructor (
        private readonly producerService : ProducerService,
        private readonly eventService : EventService,
        @InjectModel(Report.name) private  ReportModel : Model<Report>,
        @InjectModel(Appeal.name) private AppealModel : Model<Appeal>,
        @InjectModel(User.name) private UserModel : Model<User>,
        @InjectModel(Post.name) private PostModel : Model<Post>,
    ) {}

    async createReport(userId: string, createReportDto: CreateReportDto): Promise<Report> {
        const { type, reportedId, reason } = createReportDto;

        const existingReport = await this.ReportModel.findOne({
            sender: new Types.ObjectId(userId),
            reportedId: new Types.ObjectId(reportedId),
            type: { $eq: type }, 
        });
        

        if (existingReport) {
            throw new ConflictException('You have already reported this item.');
        }

        const report = new this.ReportModel({
            sender: new Types.ObjectId(userId),
            type,
            reportedId: new Types.ObjectId(reportedId),
            reason,
            status: 'pending',
        });
        this.producerService.sendMessage('notification', report);
        return await report.save();
    }

    async getReports(): Promise<Report[]> {
        const reports = await this.ReportModel.find()
          .populate('sender', 'username email avatar')

          for (const report of reports) {
            if (report.type === 'User') {
                await report.populate({
                    path: 'reportedId',
                    select: 'firstName lastName avatar',
                });
            } else if (report.type === 'Post') {
                await report.populate({
                    path: 'reportedId',
                    select: 'content img createdAt author',
                    populate: {
                        path: 'author',
                        select: 'firstName lastName avatar',
                    },
                })
            }
        }
    
        return reports;
    }
      
    async getReportById(reportId: string): Promise<Report> {
        const report = await this.ReportModel.findById(reportId)
        .populate('sender', 'username email avatar')

            if (report.type === 'User') {
                await report.populate({
                    path: 'reportedId',
                    select: 'username email avatar',
                });
            } else if (report.type === 'Post') {
                await report.populate({
                    path: 'reportedId',
                    select: 'content img createdAt author',
                    populate: {
                        path: 'author',
                        select: 'firstName lastName avatar',
                    },
                })
            }
        

        if (!report) {
            throw new NotFoundException('Report not found');
        }
        return report;
    }

    async implementationReport(reportId: string, implementationDto: ImplementationDto): Promise<Report> {
        const report = await this.ReportModel.findById(reportId).exec();
        if (!report) {
            throw new NotFoundException('Report not found');
        }
    
        report.implementation = implementationDto.implementation;
    
        if (report.type === 'Post') {
            const post = await this.PostModel.findById(report.reportedId).exec();
            if (!post) {
                throw new NotFoundException('Post not found');
            }
    
            if (implementationDto.implementation === 'approve') {
                report.status = 'resolved';
                post.isActive = false;
                await post.save();

                report.appealDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); 
    
                await this.producerService.sendMessage('mypost', {
                    userId: report.sender,
                    owner: post.author,
                    type: 'report approve',
                    message: 'Your post has been reported and removed due to violation of community guidelines. If you believe this is a mistake, you can appeal within 7 days.',
                });
    
            } else if (implementationDto.implementation === 'reject') {
                report.status = 'resolved';
                await this.producerService.sendMessage('mypost', {
                    userId: post.author,
                    owner: report.sender,
                    type: 'report reject',
                    message: 'Your report has been rejected',
                });
            }
        } else if (report.type === 'User') {
            const user = await this.UserModel.findById(report.reportedId).exec();
            if (!user) {
                throw new NotFoundException('User not found');
            }
    
            if (implementationDto.implementation === 'approve') {
                report.status = 'resolved';
                user.isActive = false;
                await user.save();
    

                report.appealDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    

                await this.producerService.sendMessage('myuser', {
                    userId: report.sender,
                    owner: user._id,
                    type: 'report',
                    message: 'Your account has been deactivated due to violation of community guidelines. If you believe this is a mistake, you can appeal within 7 days.',
                });

    
            } else if (implementationDto.implementation === 'reject') {
                report.status = 'rejected';
                await this.producerService.sendMessage('myuser', {
                    userId: user._id,
                    owner: report.sender,
                    type: 'report',
                    message: 'Your report has been rejected',
                });
            }
        }
    
        return await report.save();
    }

    async createAppeal(userId: Types.ObjectId, createAppealDto: CreateAppealDto): Promise<Appeal> {
        // Kiểm tra user
        const user = await this.UserModel.findById(userId).exec();
        if (!user) {
          this.logger.error(`User not found: ${userId}`);
          throw new NotFoundException('User not found');
        }
    
        // Tìm báo cáo
        const report = await this.ReportModel.findById(createAppealDto.reportId).exec();
        if (!report) {
          this.logger.error(`Report not found: ${createAppealDto.reportId}`);
          throw new NotFoundException('Report not found');
        }
    
        // Kiểm tra trạng thái báo cáo (phải được admin chấp nhận: status = 'resolved' và implementation = 'approve')
        if (report.status !== 'resolved' || report.implementation !== 'approve') {
          this.logger.warn(`Report not eligible for appeal: status=${report.status}, implementation=${report.implementation}`);
          throw new ConflictException('This report has not been approved by admin, so it cannot be appealed');
        }
    
        // Kiểm tra quyền kháng cáo dựa trên type
        if (report.type === 'Post') {
          // Nếu là Post, kiểm tra xem userId có phải là author của Post
          const post = await this.PostModel.findById(report.reportedId).exec();
          if (!post) {
            this.logger.error(`Post not found: ${report.reportedId}`);
            throw new NotFoundException('Post not found');
          }
          if (post.author.toString() !== userId.toString()) {
            this.logger.warn(`User ${userId} is not the author of post ${report.reportedId}`);
            throw new ConflictException('Only the post owner can appeal this report');
          }
        } else if (report.type === 'User') {
          // Nếu là User, kiểm tra xem userId có phải là reportedId
          if (report.reportedId.toString() !== userId.toString()) {
            this.logger.warn(`User ${userId} is not the reported user ${report.reportedId}`);
            throw new ConflictException('Only the reported user can appeal this report');
          }
        }
    
        // Kiểm tra thời hạn kháng cáo
        if (!report.appealDeadline || new Date() > report.appealDeadline) {
          this.logger.warn(`Appeal deadline passed for report ${report._id}`);
          throw new ConflictException('The appeal deadline has passed');
        }
    
        // Kiểm tra xem đã có kháng cáo nào cho báo cáo này chưa
        const existingAppeal = await this.AppealModel
          .findOne({ reportId: createAppealDto.reportId, appellant: userId })
          .exec();
        if (existingAppeal) {
          this.logger.warn(`Appeal already exists for report ${report._id} by user ${userId}`);
          throw new ConflictException('An appeal for this report already exists');
        }
    
        // Tạo kháng cáo mới
        const appeal = new this.AppealModel({
          reportId: createAppealDto.reportId,
          appellant: userId,
          reason: createAppealDto.reason,
          attachments: createAppealDto.attachments || [],
          status: 'pending', // Mặc định
        });
    
        // Lưu kháng cáo
        this.logger.log(`Creating appeal for report ${report._id} by user ${userId}`);
        return await appeal.save();
      }
    

    async getAllAppeals(): Promise<Appeal[]> {
        const appeals = await this.AppealModel.find()
          .populate('reportId', 'sender type reportedId reason status')
          .populate('appellant', 'fristName lastName avatar')
          .populate('handledBy', 'fristName lastName avatar');
        return appeals;
      }

    async getAppealById(appealId: Types.ObjectId): Promise<Appeal> {
        const appeal = await this.AppealModel.findById(appealId)
          .populate('reportId', 'sender type reportedId reason status')
          .populate('appellant', 'fristName lastName avatar')
          .populate('handledBy', 'fristName lastName avatar');
    
        if (!appeal) {
            throw new NotFoundException('Appeal not found');
        }
        return appeal;
      }

    async getAppealByReportId(reportId: Types.ObjectId): Promise<Appeal> {
        const appeal = await this.AppealModel.findOne({ reportId : reportId })
            .populate({
                path: 'reportId',
                select: 'sender type reportedId reason status',
                populate: {
                    path: 'sender',
                    select: 'fristName lastName avatar',
                }
            })
            .populate('appellant', 'fristName lastName avatar')
            .populate('handledBy', 'fristName lastName avatar');
        return appeal;
    }

    async implementationAppeal(appealId: Types.ObjectId, implementationDto: ImplementationDto): Promise<Appeal> {
        // Tìm kháng cáo
        const appeal = await this.AppealModel.findById(appealId).exec();
        if (!appeal) {
          throw new NotFoundException('Appeal not found');
        }
    
        // Kiểm tra trạng thái kháng cáo
        if (appeal.status !== 'pending') {
          throw new ConflictException('This appeal has already been processed');
        }
    
        // Tìm báo cáo liên quan
        const report = await this.ReportModel.findById(appeal.reportId).exec();
        if (!report) {
          throw new NotFoundException('Report not found');
        }
    
        // Xử lý theo loại báo cáo (Post hoặc User)
        if (report.type === 'Post') {
          const post = await this.PostModel.findById(report.reportedId).exec();
          if (!post) {
            throw new NotFoundException('Post not found');
          }
    
          if (implementationDto.implementation === 'approve') {
            // Chấp thuận kháng cáo: Khôi phục bài viết
            appeal.status = 'approved';
            post.isActive = true; // Khôi phục trạng thái bài viết
            await post.save();
            await report.save();
    
            // Gửi thông báo cho người kháng cáo
            await this.producerService.sendMessage('mypost', {
              userId: appeal.appellant,
              owner: report.sender,
              type: 'appeal',
              message: 'Your appeal has been approved. The post has been restored.',
            });
    
          } else if (implementationDto.implementation === 'reject') {
            // Từ chối kháng cáo: Giữ nguyên hành động báo cáo
            appeal.status = 'rejected';
    
            // Gửi thông báo cho người kháng cáo
            await this.producerService.sendMessage('mypost', {
              userId: appeal.appellant,
              owner: report.sender,
              type: 'appeal',
              message: 'Your appeal has been rejected. The post remains removed.',
            });

          }
        } else if (report.type === 'User') {
          const user = await this.UserModel.findById(report.reportedId).exec();
          if (!user) {
            throw new NotFoundException('User not found');
          }
    
          if (implementationDto.implementation === 'approve') {
            // Chấp thuận kháng cáo: Khôi phục tài khoản
            appeal.status = 'approved';
            report.status = 'rejected'; // Đảo ngược báo cáo
            user.isActive = true; // Khôi phục trạng thái tài khoản
            await user.save();
            await report.save();
    
            // Gửi thông báo cho người kháng cáo
            await this.producerService.sendMessage('myuser', {
              userId: appeal.appellant,
              owner: report.sender,
              type: 'appeal',
              message: 'Your appeal has been approved. Your account has been restored.',
            });
    
          } else if (implementationDto.implementation === 'reject') {
            // Từ chối kháng cáo: Giữ nguyên hành động báo cáo
            appeal.status = 'rejected';
    
            // Gửi thông báo cho người kháng cáo
            await this.producerService.sendMessage('myuser', {
              userId: appeal.appellant,
              owner: report.sender,
              type: 'appeal',
              message: 'Your appeal has been rejected. Your account remains deactivated.',
            });
    
           
          }
        }
    
        // Lưu kháng cáo
        return await appeal.save();
      }


}
    

