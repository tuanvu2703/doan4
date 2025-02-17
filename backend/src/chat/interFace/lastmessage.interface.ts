import {Types} from 'mongoose';

export interface GroupWithLastMessage {
    _id: Types.ObjectId;
    name: string;
    avatarGroup: string;
    lastMessage: Message | null; // Can include sender, content, createdAt, etc. based on your needs
  }
  
  interface Message {
    sender: Types.ObjectId;
    content: string;
    createdAt: Date;
    // Add other message properties as needed
  }