import { Injectable } from '@nestjs/common';
import { EventGeteWay } from './event.geteway';


@Injectable()
    export class EventService {
        constructor(private readonly socket: EventGeteWay) { }

    notificationAllClients(data: any) {
        this.socket.server.emit('events', data);
    }

    disconnectClientId(clientId: string) {
        this.socket.server.sockets[clientId].disconnect(true);
    }

    disconnectUserId(userId: string) {
        this.socket.server.to(`user:${userId}`).disconnectSockets(true);
    }

    notificationToUser(userId: string, event: string, data: any) {
       
        const clients = this.socket.server.sockets.adapter.rooms.get(`user:${userId}`);
        
        if (clients && clients.size > 0) {
            
            this.socket.server.to(`user:${userId}`).emit(event, data);
        } else {
            console.log(`No clients found for user ${userId}`);
        }
    }
    

}