import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
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
    constructor(
        private readonly producerService: ProducerService,
        private readonly eventService: EventService,
        @InjectModel(Report.name) private ReportModel: Model<Report>,
        @InjectModel(Appeal.name) private AppealModel: Model<Appeal>,
        @InjectModel(User.name) private UserModel: Model<User>,
        @InjectModel(Post.name) private PostModel: Model<Post>,
    ) { }

    async createReport(userId: Types.ObjectId, createReportDto: CreateReportDto): Promise<Report> {
        const { type, reportedId, reason } = createReportDto;

        const existingReport = await this.ReportModel.findOne({
            reportedId: new Types.ObjectId(reportedId),
            type: { $eq: type },
            status: 'pending',
        }).exec();


        if (existingReport) {
            // Kiểm tra xem userId đã báo cáo chưa
            if (existingReport.sender.includes(userId)) {
                this.logger.warn(`User ${userId} has already reported this item.`);
                throw new ConflictException('You have already reported this item.');
            }
            // Sử dụng $addToSet để thêm userId vào mảng sender
            const updatedReport = await this.ReportModel.findOneAndUpdate(
                {
                    reportedId: new Types.ObjectId(reportedId),
                    type: { $eq: type },
                    status: 'pending',
                },
                { $addToSet: { sender: userId } },
                { new: true } // Trả về document sau khi cập nhật
            ).exec();

            this.logger.log(`Added user ${userId} to existing report ${updatedReport._id}`);
            return updatedReport;
        }

        const report = new this.ReportModel({
            sender: [userId],
            type,
            reportedId: new Types.ObjectId(reportedId),
            reason,
            status: 'pending',
        });
        this.logger.log(`Creating report: ${JSON.stringify(report)}`);
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

                await this.producerService.sendMessage('report', {
                    type: 'report approve thank',
                    ownerId: post.author, // Chủ bài viết là "nguyên nhân" của thông báo
                    targetUserIds: report.sender, // Gửi đến tất cả người báo cáo trong mảng sender
                    data: {
                        postId: post._id,
                        message: `Cảm ơn bạn đã báo bài viết vi phạm quy tắc cộng đồng bài viết đã bị gỡ từ ngày ${new Date().toISOString().split('T')[0]}.`,
                        timestamp: new Date(),
                    },
                });

                // Thông báo cho chủ bài viết (post.author)
                await this.producerService.sendMessage('report', {
                    type: 'report approve',
                    ownerId: report.sender[0], // Người báo cáo đầu tiên trong mảng sender
                    targetUserId: post.author, // Người nhận thông báo: chủ bài viết
                    data: {
                        postId: post._id,
                        message: `Bài viết của bạn đã bị xoá do vi phạm quy tắc cộng động bạn có 7 ngày để kháng cáo nếu bạn cho rằng đây là hiểu nhầm ${report.appealDeadline.toISOString().split('T')[0]}.`,
                        timestamp: new Date(),
                    },
                });

            } else if (implementationDto.implementation === 'reject') {
                report.status = 'resolved';

                await this.producerService.sendMessage('report', {
                    type: 'report reject',
                    ownerId: post.author, // Chủ bài viết là người "gây ra" thông báo
                    targetUserId: report.sender, // Người nhận thông báo: người gửi báo cáo
                    data: {
                        postId: post._id,
                        message: `Báo cáo của bạn về bài viết đã được xem xét và từ chối do không có vi phạm, cảm ơn bạn đã gửi báo cáo. ${new Date().toISOString().split('T')[0]}.`,
                        // avatar: post.authorAvatar || '', // Giả định có trường avatar
                        timestamp: new Date(),
                    },
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


                await this.producerService.sendMessage('report', {
                    type: 'report approve thank',
                    ownerId: user._id, // Người bị báo cáo là "nguyên nhân" của thông báo
                    targetUserIds: report.sender, // Gửi đến tất cả người báo cáo trong mảng sender
                    data: {
                        userId: user._id,
                        message: `Cảm ơn bạn đã báo cáo người dùng ${user.firstName} ${user.lastName} sau khi xem xét chúng tôi đã xác nhận vi phạm và khoá tài khoản của họ ${new Date().toISOString().split('T')[0]}.`,
                        timestamp: new Date(),
                    },
                });

                // Thông báo cho người bị báo cáo (user._id)
                await this.producerService.sendMessage('report', {
                    type: 'report approve',
                    ownerId: report.sender[0], // Người báo cáo đầu tiên trong mảng sender
                    targetUserId: user._id, // Người nhận thông báo: người bị báo cáo
                    data: {
                        userId: user._id,
                        message: `Tài khoản của bạn đã bị báo cáo do vi phạm quy tắc cộng động, bạn có 7 ngày để kháng cáo nếu bạn cho rằng đây là hiểu nhầm ${report.appealDeadline.toISOString().split('T')[0]}.`,
                        timestamp: new Date(),
                    },
                });


            } else if (implementationDto.implementation === 'reject') {
                report.status = 'rejected';
                await this.producerService.sendMessage('report', {
                    type: 'report reject',
                    ownerId: user._id, // Người bị báo cáo là người "gây ra" thông báo
                    targetUserId: report.sender, // Người nhận thông báo: người gửi báo cáo
                    data: {
                        userId: user._id,
                        message: `Cảm ơn bạn đã báo cáo người dùng ${user.firstName} ${user.lastName} sau khi xem xét chúng tôi không thấy dấu hiệu vi phạm.`,
                        avatar: user.avatar || '', // Giả định có trường avatar
                        timestamp: new Date(),
                    },
                });
            }
        }
        return await report.save();
    }

    async createAppeal(userId: Types.ObjectId, createAppealDto: CreateAppealDto): Promise<Appeal> {
        const postId = new Types.ObjectId(createAppealDto.postId);
        const reports = await this.ReportModel.find({
            reportedId: postId,
            type: 'Post', // Đảm bảo chỉ lấy báo cáo liên quan đến bài đăng
            status: 'resolved', // Chỉ lấy báo cáo đã được admin xử lý
            implementation: 'approve', // Đã được approve
        }).exec();
        const user = await this.UserModel.findById(userId).exec();
        if (!user) {
            this.logger.error(`User not found: ${userId}`);
            throw new NotFoundException('User not found');
        }

        // Tìm báo cáo
        if (!reports || reports.length === 0) {
            this.logger.error(`No eligible reports found for post ${postId}`);
            throw new NotFoundException('No eligible reports found for this post');
        }

        // Lấy reportId đầu tiên (có thể thêm logic để chọn report phù hợp hơn nếu có nhiều báo cáo)
        const report = reports[0];
        const reportId = report._id;

        // Tìm bài đăng để kiểm tra quyền kháng cáo
        const post = await this.PostModel.findById(postId).exec();
        if (!post) {
            this.logger.error(`Post not found: ${postId}`);
            throw new NotFoundException('Post not found');
        }

        // Kiểm tra quyền kháng cáo (chỉ tác giả của bài đăng mới được kháng cáo)
        if (post.author.toString() !== userId.toString()) {
            this.logger.warn(`User ${userId} is not the author of post ${postId}`);
            throw new ConflictException('Only the post owner can appeal this report');
        }

        // Kiểm tra thời hạn kháng cáo
        if (!report.appealDeadline || new Date() > report.appealDeadline) {
            this.logger.warn(`Appeal deadline passed for report ${report._id}`);
            throw new ConflictException('The appeal deadline has passed');
        }

        // Kiểm tra xem đã có kháng cáo nào cho báo cáo này chưa
        const existingAppeal = await this.AppealModel
            .findOne({ reportId: reportId, appellant: userId })
            .exec();
        if (existingAppeal) {
            this.logger.warn(`Appeal already exists for report ${report._id} by user ${userId}`);
            throw new ConflictException('An appeal for this report already exists');
        }

        // Tạo kháng cáo mới
        const appeal = new this.AppealModel({
            reportId: reportId,
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
        const appeal = await this.AppealModel.findOne({ reportId: reportId })
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
                appeal.status = 'resolved';
                appeal.implementation = 'approve';
                post.isActive = true; // Khôi phục trạng thái bài viết
                await post.save();
                await report.save();

                // Gửi thông báo cho người kháng cáo
                await this.producerService.sendMessage('mypost', {
                    type: 'appeal approve',
                    ownerId: report.sender, // Người gửi báo cáo
                    targetUserId: appeal.appellant, // Người kháng cáo
                    data: {
                        postId: post._id,
                        message: `Kháng cáo của bạn đối với bài viết đã được chấp thuận. Bài đăng đã được khôi phục kể từ ngày ${new Date().toISOString().split('T')[0]} chúng tôi xin lỗi vì sự bất tiện này.`,
                        timestamp: new Date(),
                    },
                });

            } else if (implementationDto.implementation === 'reject') {
                // Từ chối kháng cáo: Giữ nguyên hành động báo cáo
                appeal.status = 'rejected';

                // Gửi thông báo cho người kháng cáo
                await this.producerService.sendMessage('mypost', {
                    type: 'appeal reject',
                    ownerId: report.sender, // Người gửi báo cáo
                    targetUserId: appeal.appellant, // Người kháng cáo
                    data: {
                        postId: post._id,
                        message: `Kháng cáo của bạn đối với bài viết đã bị từ chối. Chúng tôi rất tiếc phải thông báo rằng bài viết của bạn hết cứu và nó sẽ chính thức bị gỡ xuống từ ngày ${new Date().toISOString().split('T')[0]}.`,
                        timestamp: new Date(),
                    },
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
                await this.producerService.sendMessage('report', {
                    type: 'appeal approve',
                    ownerId: report.sender, // Người gửi báo cáo
                    targetUserId: appeal.appellant, // Người kháng cáo
                    data: {
                        userId: user._id,
                        message: `Kháng cáo của bạn đối về báo cáo tài khoản đã được duyệt. Tài khoản của bạn đã được khôi phục từ ngày ${new Date().toISOString().split('T')[0]}.`,
                        avatar: user.avatar || '', // Giả định có trường avatar
                        timestamp: new Date(),
                    },
                });

            } else if (implementationDto.implementation === 'reject') {
                // Từ chối kháng cáo: Giữ nguyên hành động báo cáo
                appeal.status = 'resolved';
                appeal.implementation = 'reject';
                await report.save();
                // Gửi thông báo cho người kháng cáo
                await this.producerService.sendMessage('report', {
                    type: 'appeal reject',
                    ownerId: report.sender, // Người gửi báo cáo
                    targetUserId: appeal.appellant, // Người kháng cáo
                    data: {
                        userId: user._id,
                        message: `kháng cáo của bạn đã được xem xét và chúng tôi rất tiếc phải thông báo rằng tài khoản của bạn hết cứu và nó sẽ chính thức bị gỡ xuống từ ngày ${new Date().toISOString().split('T')[0]}.`,
                        avatar: user.avatar || '', // Giả định có trường avatar
                        timestamp: new Date(),
                    },
                });
            }
        }

        // Lưu kháng cáo
        return await appeal.save();
    }


}


