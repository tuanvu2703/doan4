import { Controller, Post, Put, Get, Param, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { FriendService } from './friend.service';
import { AuthGuardD } from '../user/guard/auth.guard';
import { CurrentUser } from '../user/decorator/currentUser.decorator';
import { User } from '../user/schemas/user.schemas';

@Controller('friend')
export class FriendController {
    constructor(private readonly friendService: FriendService) { }

    @Post('request/:idFriend')
    @UseGuards(AuthGuardD)
    async addFriendRequest(
        @Param('idFriend') idFriend: string,
        @CurrentUser() currentUser: User
    ) {

        if (!currentUser) {
            throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
        }

        return await this.friendService.addFriendRequest(currentUser._id.toString(), idFriend);
    }

    @Put(':id/accept')
    @UseGuards(AuthGuardD)
    async acceptFriendRequest(
        @Param('id') requestId: string,
        @CurrentUser() currentUser: User
    ) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }

        return await this.friendService.acceptFriendRequest(requestId, currentUser._id.toString());
    }

    @Put(':id/decline')
    @UseGuards(AuthGuardD)
    async declineFriendRequest(
        @Param('id') requestId: string,
        @CurrentUser() currentUser: User
    ) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }

        return await this.friendService.declineFriendRequest(requestId, currentUser._id.toString());
    }

    @Get('requests')
    @UseGuards(AuthGuardD)
    async getFriendRequests(@CurrentUser() currentUser: User) {
        if (!currentUser) {
            throw new HttpException('User not found or not authenticated', HttpStatus.UNAUTHORIZED);
        }

        return await this.friendService.getFriendRequests(currentUser._id.toString());
    }

    @Get(':userId')
    @UseGuards(AuthGuardD)
    async getFriendsByUser(
        @Param('userId') userId: string,
        @CurrentUser() currentUser: User
    ) {
        try {
            return await this.friendService.getFriendsByUser(userId, currentUser._id.toString());
        } catch (error) {
            throw new HttpException('An error occurred while fetching friends', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    @Get('status/:otherUserId')
    @UseGuards(AuthGuardD)
    async getFriendStatus(
        @Param('otherUserId') otherUserId: string,
        @CurrentUser() currentUser: User
    ) {
        if (!currentUser) {
            throw new HttpException('User not authenticated', HttpStatus.UNAUTHORIZED);
        }

        const status = await this.friendService.getFriendStatus(currentUser._id.toString(), otherUserId);
        return status;
    }
}