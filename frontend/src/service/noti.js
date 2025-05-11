import authToken from '../components/authToken';
import API from './API';

async function getAllNoti() {
    try {
        const request = await API.get(`${process.env.REACT_APP_API_URL}/notifications/getnotifications`, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`, // Use your auth token provider
            }
        })
        return request.data;
    } catch (error) {
        console.error("Error fetching posts in group:", error);
        throw error;
    }
}

async function getUnReadNoti() {
    try {
        const request = await API.get(`${process.env.REACT_APP_API_URL}/notifications/getUnreadNotifications`, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`, // Use your auth token provider
            }
        })
        return request.data;
    } catch (error) {
        console.error("Error fetching posts in group:", error);
        throw error;
    }
}

async function getIsReadNoti() {
    try {
        const request = await API.get(`${process.env.REACT_APP_API_URL}/notifications/getNotificationIsRead`, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`, // Use your auth token provider
            }
        })
        return request.data;
    } catch (error) {
        console.error("Error fetching posts in group:", error);
        throw error;
    }
}

async function readNoti(notificationId) {
    try {
        const request = await API.patch(`${process.env.REACT_APP_API_URL}/notifications/read/${notificationId}`, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`, // Use your auth token provider
            }
        })
        return request.data;
    } catch (error) {
        console.error("Error fetching posts in group:", error);
        throw error;
    }
}


export { getAllNoti, getUnReadNoti, getIsReadNoti, readNoti };