import { Injectable, NotFoundException,  } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProducerService } from '../kafka/producer/kafka.Producer.service';
import { CreateReportDto } from './dto/CreateReport.dto';
import { User } from '../user/schemas/user.schemas';
import { Post } from '../post/schemas/post.schema';
import { Report } from './schema/report.schema';


@Injectable()
export class ReportService {
    constructor (
        private readonly producerService : ProducerService,
        @InjectModel(Report.name) private  ReportModel : Model<Report>,
        @InjectModel(User.name) private userModel : Model<User>,
        @InjectModel(Post.name) private postModel : Model<Post>,
    ) {}

    async createReport(userId: string, createReportDto: CreateReportDto): Promise<Report> {
        const { type, reportedId, reason } = createReportDto; // Lấy trực tiếp dữ liệu từ DTO

        // Check if a similar report already exists
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


}
    

