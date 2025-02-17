import mongoose, { Schema, Document, Types, Mongoose } from 'mongoose';

export interface PostF extends Document {
  content: string;
  author: mongoose.Schema.Types.ObjectId;
  likes: Types.ObjectId[];
  dislikes: Types.ObjectId[];
  comments: Types.ObjectId[];
  likesCount: number;
  commentsCount: number;
  img: string[];
  isActive: boolean;
  privacy: string;
  createdAt: Date;
  updatedAt: Date;
}

export const PostSchema = new Schema<PostF>({
  content: { type: String, required: true },
  author: { type: Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: Types.ObjectId, ref: 'User' }],
  comments: [{ type: Types.ObjectId, ref: 'Comment' }],
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  img: [{ type: String }],
  isActive: { type: Boolean, default: true },
  privacy: { type: String, enum: ['public', 'private', 'friend', 'specific'], default: 'public' },
}, { timestamps: true });