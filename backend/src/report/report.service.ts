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

    async createReport(createReportDto: CreateReportDto): Promise<Report> {
        // Chuyển đổi các ID từ string sang ObjectId
        const formattedReportDto = {
            ...createReportDto,
            sender: new Types.ObjectId(createReportDto.sender),
            data: {
                ...createReportDto.data,
                reportedPerson: createReportDto.data.type === 'user' 
                    ? new Types.ObjectId(createReportDto.data.reportedPerson) 
                    : undefined,
                reportedPost: createReportDto.data.type === 'post' 
                    ? new Types.ObjectId(createReportDto.data.reportedPost) 
                    : undefined,
            }
        };
    
        // Tạo report mới từ dữ liệu đã format
        const newReport = new this.ReportModel(formattedReportDto);
        await newReport.save();
    
        // Gửi vào Kafka
        this.producerService.sendMessage('report', newReport);
    
        return newReport;
    }
    
}
