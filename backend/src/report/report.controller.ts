import { Body, Controller, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { AuthGuardD } from '../user/guard/auth.guard';
import { CurrentUser } from '../user/decorator/currentUser.decorator';
import { User } from '../user/schemas/user.schemas';
import { CreateReportDto } from './dto/CreateReport.dto';
import { Types } from 'mongoose';
import { ApiTags,ApiOperation,ApiBody } from '@nestjs/swagger';


@ApiTags('Report')
@Controller('report')
export class ReportController {
    constructor (
        private readonly reportService : ReportService
    ){}

    @Post('sendReport')
    @UseGuards(AuthGuardD)
    @ApiOperation({ summary: 'Gửi báo cáo bài viết hoặc người dùng' })
    @ApiBody({ type: CreateReportDto }) // Định nghĩa request body trong Swagger
    async sendReport(
        @CurrentUser() currentUser: User,
        @Body() createReportDto: CreateReportDto,
    ) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
        createReportDto.sender = currentUser._id.toString(); // Gán sender từ currentUser
        return await this.reportService.createReport(createReportDto);
    }
    
}
