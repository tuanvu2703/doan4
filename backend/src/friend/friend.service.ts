// friend.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types  } from 'mongoose';
import { FriendRequest, FriendRequestDocument } from './schemas/friend-request.schema';

@Injectable()
export class FriendService {
    constructor(
        @InjectModel(FriendRequest.name) private friendRequestModel: Model<FriendRequestDocument>,
    ) {}

    // Add a new friend request
    async addFriendRequest(requesterId: string, recipientId: string): Promise<FriendRequest> {

    
        if (requesterId === recipientId) {
            throw new HttpException('You cannot send a friend request to yourself', HttpStatus.BAD_REQUEST);
        }
    
        // Check if a friend request already exists
        const existingRequest = await this.friendRequestModel.findOne({
            sender: requesterId,  // Ensure 'requester' field is used
            receiver: recipientId,   // Ensure 'recipient' field is used
        });
    
        if (existingRequest) {
            throw new HttpException('Friend request already exists', HttpStatus.CONFLICT);
        }
    
        // Ensure the requesterId and recipientId are ObjectId instances
        const requesterObjectId = new Types.ObjectId(requesterId);
        const recipientObjectId = new Types.ObjectId(recipientId);
        
        // Create new friend request with all required fields
        const newRequest = new this.friendRequestModel({
            sender: requesterObjectId,  // Ensure 'requester' is an ObjectId
            receiver: recipientObjectId,  // Ensure 'recipient' is an ObjectId
            status: 'pending',  // Initial status
        });
    

    
        // Save the friend request to the database
        return newRequest.save();
    }
    
    
    // Accept a friend request
    async acceptFriendRequest(requestId: string, userId: string): Promise<FriendRequest> {
      
        const request = await this.friendRequestModel.findById(requestId);

        if (!request) {
            throw new HttpException('Friend request not found', HttpStatus.NOT_FOUND);
        }

        if (request.receiver.toString() !== userId) {
            throw new HttpException('You are not authorized to accept this friend request', HttpStatus.FORBIDDEN);
        }

        request.status = 'accepted';
        return request.save();
    }

    // Decline a friend request
    async declineFriendRequest(requestId: string, userId: string): Promise<FriendRequest> {
        const request = await this.friendRequestModel.findById(requestId);

        if (!request) {
            throw new HttpException('Friend request not found', HttpStatus.NOT_FOUND);
        }

        if (request.receiver.toString() === userId || request.sender.toString() === userId) {
            request.status = 'declined';
            return request.save();
        }
        throw new HttpException('You are not authorized to decline this friend request', HttpStatus.FORBIDDEN);
    }
    async cancelFriendRequest(requestId: string, userId: string): Promise<FriendRequest> {
        const request = await this.friendRequestModel.findById(requestId);

        if (!request) {
            throw new HttpException('Friend request not found', HttpStatus.NOT_FOUND);
        }

        if (request.receiver.toString() !== userId) {
            throw new HttpException('You are not authorized to decline this friend request', HttpStatus.FORBIDDEN);
        }

        request.status = 'declined';
        return request.save();
    }
    // Get friend requests for the current user
    async getFriendRequests(userId: string): Promise<FriendRequest[]> {
        return this.friendRequestModel.find({ receiver: userId, status: 'pending' }).exec();
    }

    // Get friends of a specific user
    async getFriendsByUser(userId: string, requesterId: string): Promise<FriendRequest[]> {
        // Validate if the requester has access to see the user's friends
        if (userId !== requesterId) {
            throw new HttpException('You are not authorized to view this user\'s friends', HttpStatus.FORBIDDEN);
        }

        return this.friendRequestModel.find({
            $or: [
                { sender: userId, status: 'accepted' },
                { receiver: userId, status: 'accepted' },
            ],
        }).exec();
    }
    // Check friendship status and return detailed information
    async getFriendStatus(currentUserId: string, otherUserId: string): Promise<any> {
        if (currentUserId === otherUserId) {
            return {
                idUser: otherUserId,
                status: 'self',
                idRequest: null,
            }; // If it's the same user, return a "self" status
        }

        const request = await this.friendRequestModel.findOne({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId },
            ],
        }).exec();

        if (!request) {
            return {
                idUser: otherUserId,
                status: 'no_request',
                idRequest: null,
            }; // No friend request found
        }

        return {
            idUser: otherUserId,
            status: request.status,  // The status of the friend request (pending, accepted, declined)
            idRequest: request._id.toString(),
        };
    }
}
