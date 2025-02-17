import { Types } from "mongoose";

export interface Message extends Document {
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    content: string;
    createdAt: Date; // Thêm createdAt vào đây
    updatedAt: Date; // Nếu cần
  }