import {Types} from 'mongoose'


export interface ParticipantWithLastMessage {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    avatar: string;
    lastMessage: Message | null; 
  }
  
  interface Message {
    sender: Types.ObjectId;
    content: string;
    createdAt: Date;
    // Add other message properties as needed
  }