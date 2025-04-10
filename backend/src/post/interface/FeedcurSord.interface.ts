import { Types } from 'mongoose';


interface FeedCursor {
    lastPriorityLevel: number;
    lastRankingScore?: number;
    lastSortTime: Date;
    lastId: Types.ObjectId;
    lastCreatedAt?: Date;
}

interface ProjectedPost {
    _id: Types.ObjectId;
    content?: string;
    img?: string[];
    gif?: string;
    privacy?: string;
    createdAt: Date;
    likesCount: number;
    commentsCount: number;
    author: {
        _id: Types.ObjectId;
        firstName?: string;
        lastName?: string;
        avatar?: string;
    };
    group?: {
        _id: Types.ObjectId;
        groupName?: string;
        avatargroup?: string;
        typegroup?: string;
       
    } | null;
}

interface PaginatedFeedResult<T = ProjectedPost, C = string | null> {
    posts: T[];       // Kiểu của posts là T (mặc định ProjectedPost)
    nextCursor: C;    // Kiểu của nextCursor là C (mặc định string | null)
}

// interface PaginatedFeedResult {
//     posts: ProjectedPost[];
//     nextCursor: FeedCursor | null;
// }

export { FeedCursor, ProjectedPost, PaginatedFeedResult };