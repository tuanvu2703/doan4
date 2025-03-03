import { Body, Controller, Get, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { AuthGuardD } from '../user/guard/auth.guard';
import { CurrentUser } from '../user/decorator/currentUser.decorator';
import { User } from '../user/schemas/user.schemas';
import { CreateReportDto } from './dto/CreateReport.dto';
import { Types } from 'mongoose';
import { ApiTags,ApiOperation,ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/user/guard/role.guard';


@ApiTags('Report')
@Controller('report')
export class ReportController {
    constructor (
        private readonly reportService : ReportService
    ){}

    @Post('sendReport')
    @UseGuards(AuthGuardD)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Gửi báo cáo bài viết hoặc người dùng' })
    @ApiBody({ type: CreateReportDto })
    async sendReport(
        @CurrentUser() currentUser: User,
        @Body() createReportDto: CreateReportDto,
    ) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
        const swageUserId = new Types.ObjectId(currentUser._id.toString());
        return await this.reportService.createReport(currentUser._id.toString(),createReportDto);
    }

    @Get('getReports')
    @UseGuards(new RolesGuard(true))
    @UseGuards(AuthGuardD)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lấy tất cả báo cáo' })
    async getReports(
        @CurrentUser() currentUser: User,
    ) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
        if(currentUser.role.toString() !== 'true'){
            throw new HttpException('You are not authorized to access this resource', HttpStatus.UNAUTHORIZED);
        }
        return await this.reportService.getReports();
    }
    
}
