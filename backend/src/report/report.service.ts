import { Injectable, NotFoundException, ConflictException,  } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProducerService } from '../kafka/producer/kafka.Producer.service';
import { CreateReportDto } from './dto/CreateReport.dto';
import { User } from '../user/schemas/user.schemas';
import { Post } from '../post/schemas/post.schema';
import { Report } from './schema/report.schema';
import { EventService } from 'src/event/event.service';
import { ImplementationDto } from './dto/implementation.dto';


@Injectable()
export class ReportService {
    constructor (
        private readonly producerService : ProducerService,
        private readonly eventService : EventService,
        @InjectModel(Report.name) private  ReportModel : Model<Report>,
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
        return await this.ReportModel.find().exec();
    }

    async getReportById(reportId: string): Promise<Report> {
        const report = await this.ReportModel.findById(reportId).exec();
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
    
        if (report.type === 'post') {
            const post = await this.PostModel.findById(report.reportedId).exec();
            if (!post) {
                throw new NotFoundException('Post not found');
            }
    
            if (implementationDto.implementation === 'approve') {
                report.status = 'resolved';
                post.isActive = false;
                await post.save();

                report.appealDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 ngày
    
                // ✅ Gửi thông báo về việc bài viết bị xóa và hướng dẫn kháng cáo
                await this.producerService.sendMessage('mypost', {
                    userId: report.sender,
                    owner: post.author,
                    type: 'report',
                    message: 'Your post has been reported and removed due to violation of community guidelines. If you believe this is a mistake, you can appeal within 7 days.',
                });
    
                await this.eventService.notificationToUser(report.sender.toString(), 'Report', {
                    type: 'report',
                    reportId: report._id,
                    message: 'Your report has been approved. The post has been removed.',
                });
    
            } else if (implementationDto.implementation === 'reject') {
                report.status = 'rejected';
                await this.producerService.sendMessage('mypost', {
                    userId: post.author,
                    owner: report.sender,
                    type: 'report',
                    message: 'Your report has been rejected',
                });
            }
        } else if (report.type === 'user') {
            const user = await this.UserModel.findById(report.reportedId).exec();
            if (!user) {
                throw new NotFoundException('User not found');
            }
    
            if (implementationDto.implementation === 'approve') {
                report.status = 'resolved';
                user.isActive = false;
                await user.save();
    
                // ✅ THÊM THỜI GIAN HẾT HẠN KHÁNG CÁO
                report.appealDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 ngày
    
                // ✅ Gửi thông báo về việc tài khoản bị vô hiệu hóa và hướng dẫn kháng cáo
                await this.producerService.sendMessage('myuser', {
                    userId: report.sender,
                    owner: user._id,
                    type: 'report',
                    message: 'Your account has been deactivated due to violation of community guidelines. If you believe this is a mistake, you can appeal within 7 days.',
                });
    
                await this.eventService.notificationToUser(report.sender.toString(), 'Report', {
                    type: 'report',
                    reportId: report._id,
                    message: 'Your report has been approved. The user has been deactivated.',
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
    

    async appealReport(reportId: Types.ObjectId, userId: Types.ObjectId): Promise<Report> {
        const report = await this.ReportModel.findById(reportId).exec();
        if (!report) {
            throw new NotFoundException('Report not found');
        }
    
        if (report.reportedId.toString() !== userId.toString()) {
            throw new ConflictException('You are not authorized to appeal this report');
        }
    
        if (report.status !== 'resolved') {
            throw new ConflictException('This report is not eligible for appeal');
        }
    
        if (!report.appealDeadline || new Date() > report.appealDeadline) {
            throw new ConflictException('The appeal deadline has passed');
        }
    
        report.isAppealed = true;
        report.status = 'pending'; 
        return await report.save();
    }
    



}
    

