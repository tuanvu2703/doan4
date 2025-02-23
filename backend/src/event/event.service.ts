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
    
    async disconnectUserId(userId: string) {
        const sockets = await this.socket.server.in(`user:${userId}`).fetchSockets();
        sockets.forEach(socket => socket.disconnect(true));
        console.log(`🔌 Disconnected all sockets for user: ${userId}`);
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