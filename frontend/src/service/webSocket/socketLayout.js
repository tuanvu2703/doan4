// useWebSocket.js
import { useEffect } from "react";
import socket from "./socket";

const SocketLayout = (onMessageReceived) => {
    useEffect(() => {
        // Kết nối WebSocket



        // // Lắng nghe sự kiện 'events'
        // socket.on("events", (data) => {
        //     console.log("Received event:", data);
        // });

        // Lắng nghe sự kiện 'newmessage'
        socket.on("newmessage", (data) => {
            console.log(" message inbox:", data);
            onMessageReceived(data); // Gọi callback khi có tin nhắn mới

        });
        socket.on("newmessagetogroup", (data) => {
            console.log(" message group:", data);
            onMessageReceived(data);
        });

        // Xử lý khi ngắt kết nối
        socket.on("disconnect", () => {
            console.log("Disconnected from server");
        });

        // Cleanup function khi component bị hủy
        return () => {
            // socket.off("connect");
            // socket.off("events");
            socket.off("newmessage");
            socket.off("disconnect");
        };
    }, [onMessageReceived]);

    const sendMessage = (message) => {
        socket.emit("sendMessage", { content: message });
    };

    return { sendMessage };
};

export default SocketLayout;
