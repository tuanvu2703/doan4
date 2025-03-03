import { Injectable, NotFoundException,  } from '@nestjs/common';
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
            type,
            reportedId: new Types.ObjectId(reportedId),
        });

        if (existingReport) {
            throw new Error('You have already reported this item.');
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
        const swagereportId = new Types.ObjectId(reportId);
        report.implementation = implementationDto.implementation;
    
        if (report.type === 'post') {
            const post = await this.PostModel.findById(report.reportedId).exec();
            console.log(post);
            if (!post) {
                throw new NotFoundException('Post not found');
            }
    
            if (implementationDto.implementation === 'approve') {
                report.status = 'resolved';
                post.isActive = false;
                await post.save();
    
                await this.producerService.sendMessage('mypost', {
                    userId: report.sender,
                    owner: post.author,
                    type: 'report',
                    message: 'Your post has been reported and removed due to violation of community guidelines.',
                });
    
                await this.eventService.notificationToUser(report.sender.toString(), 'Report', {
                    type: 'report',
                    reportId: report._id,
                    message: 'Your report has been approved',
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
    
                await this.producerService.sendMessage('myuser', {
                    userId: report.sender,
                    owner: user._id,
                    type: 'report',
                    message: 'The user has been reported and deactivated due to violation of community guidelines.',
                });
    
                await this.eventService.notificationToUser(report.sender.toString(), 'Report', {
                    type: 'report',
                    reportId: report._id,
                    message: 'Your report has been approved',
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

}
    

