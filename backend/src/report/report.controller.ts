import { Body, Controller, Get, HttpException, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { AuthGuardD } from '../user/guard/auth.guard';
import { CurrentUser } from '../user/decorator/currentUser.decorator';
import { User } from '../user/schemas/user.schemas';
import { CreateReportDto } from './dto/CreateReport.dto';
import { Types } from 'mongoose';
import { ApiTags,ApiOperation,ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/user/guard/role.guard';
import { ImplementationDto } from './dto/implementation.dto';
import { CreateAppealDto } from './dto/CreateAppeal.dto';


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

    @Get('getReportById/:reportId')
    @UseGuards(new RolesGuard(true))
    @UseGuards(AuthGuardD)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lấy báo cáo theo ID' })
    async getReportById(
        @CurrentUser() CurrentUser : User,
        @Param('reportId') reportId: string
    ) {
        if (!CurrentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
        if(CurrentUser.role.toString() !== 'true'){
            throw new HttpException('You are not authorized to access this resource', HttpStatus.UNAUTHORIZED);
        }
        return await this.reportService.getReportById(reportId);
    }

    @Patch('implementationReport/:reportId')
    @UseGuards(new RolesGuard(true))
    @UseGuards(AuthGuardD)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'giải quyết báo cáo (admin)' })
    async implementationReport(
        @CurrentUser() CurrentUser : User,
        @Param('reportId') reportId: string,
        @Body() implementationDto: ImplementationDto
    ){
        if (!CurrentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
        if(CurrentUser.role.toString() !== 'true'){
            throw new HttpException('You are not authorized to access this resource', HttpStatus.UNAUTHORIZED);
        }
        return await this.reportService.implementationReport(reportId,implementationDto);
    }

    @Patch('implementationAppeal/:appealId')
    @UseGuards(new RolesGuard(true))
    @UseGuards(AuthGuardD)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Giải quyết kháng cáo ' })
    async appealReport(
        @CurrentUser() currentUser: User,
        @Param('appealId') appealId: string,
        @Body() appealReportDto: ImplementationDto
    ){
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
        const swageappealId = new Types.ObjectId(appealId); 
        const swageUserId = new Types.ObjectId(currentUser._id.toString());
        return await this.reportService.implementationAppeal(swageappealId,appealReportDto);
    }

    @Post('createAppeal')
    @UseGuards(AuthGuardD)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Tạo kháng cáo cho báo cáo' })
    @ApiBody({ type: CreateAppealDto })
    async createAppeal(
        @CurrentUser() currentUser: User,
        @Body() createAppealDto: CreateAppealDto,
    ) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
        const userId  = new Types.ObjectId(currentUser._id.toString());
        return await this.reportService.createAppeal(userId,createAppealDto);
    }

    @Get('getAppealById/:appealId')
    @UseGuards(new RolesGuard(true))
    @UseGuards(AuthGuardD)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lấy kháng cáo theo ID' })
    async getAppealById(
        @CurrentUser() currentUser: User,
        @Param('appealId') appealId: string
    ) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
        const swageappealId = new Types.ObjectId(appealId); 
        return await this.reportService.getAppealById(swageappealId);
    }

    @Get('getAllAppeal')
    @UseGuards(new RolesGuard(true))
    @UseGuards(AuthGuardD)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lấy tất cả kháng cáo' })
    async getAllAppeal(
        @CurrentUser() currentUser: User,
    ) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
        if(currentUser.role.toString() !== 'true'){
            throw new HttpException('You are not authorized to access this resource', HttpStatus.UNAUTHORIZED);
        }
        return await this.reportService.getAllAppeals();
    }

    @Get('getAppealByReportId/:reportId')
    @UseGuards(new RolesGuard(true))
    @UseGuards(AuthGuardD)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lấy kháng cáo từ báo cáo' })
    async getAppealByReportId(
        @CurrentUser() currentUser: User,
        @Param('reportId') reportId: string
    ) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }
        const ReportId = new Types.ObjectId(reportId); 
        return await this.reportService.getAppealByReportId(ReportId);
    }

}
