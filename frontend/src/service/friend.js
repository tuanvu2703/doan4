import axios from 'axios';
import authToken from '../components/authToken';
import socket from './webSocket/socket';



const AddFriend = async (id) => {

    try {
        const result = await axios.get(`${process.env.REACT_APP_API_URL}/friend/status/${id}`,
            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );
        console.log(result.data.status)
        if (result.data.status == 'no_request') {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/user/friendrequest/${id}`, {},
                {
                    headers: { Authorization: `Bearer ${authToken.getToken()}` },
                }
            );
            if (response.data) {
                // Phát tín hiệu WebSocket sau khi yêu cầu thành công
                socket.emit("addFriend", response.data);
                return { success: true, data: response.data, message: 'đã gửi yêu cầu kết bạn thành công' };
            } else {
                return { success: false, message: 'ôi không có lỗi gì đó' };
            }
        } else {
            return { success: false, message: 'ôi không có lỗi gì đó chắc chắn là bị trùng request' };
        }
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Đã xảy ra lỗi khi gửi yêu cầu kết bạn',
        };
    }
};
const getAllFriendInvitation = async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/getMyFriendRequest`,
            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );
        return { success: true, data: response.data };
    } catch (response) {
        return { success: false, data: response.response.data.message };
    }
}
const getListFriendRequest = async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/request`,
            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );
        return { success: true, data: response.data };
    } catch (response) {
        return { success: false, data: response.response.data.message };
    }
};
const getListMyFriend = async () => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/getMyFriend`,
            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );
        return { success: true, data: response.data };
    } catch (response) {
        return { success: false, data: response.response.data.message };
    }
};
const accectRequestAddFriend = async (id) => {
    try {

        const response = await axios.post(`${process.env.REACT_APP_API_URL}/user/acceptfriend/${id}`, {},
            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );

        return { success: true, data: response };
    } catch (response) {
        return { success: false, data: response.response.data.message };
    }
};
const declineRequestAddFriend = async (id) => {
    try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/user/rejectFriendRequest/${id}`, {},
            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );

        return { success: true, data: response.data };
    } catch (response) {
        return { success: false, data: response.response.data.message };
    }
};
const checkFriend = async (id) => {
    try {
        // Fetch user's friend list
        const listResponse = await axios.get(`${process.env.REACT_APP_API_URL}/user/getMyFriend`, {
            headers: { Authorization: `Bearer ${authToken.getToken()}` },
        });

        return { success: true, data: listResponse.data };
    } catch (error) {
        return {
            success: false,
            data: error.response?.data?.message || "An error occurred",
        };
    }
};



const cancelFriend = async (id) => {
    try {
        const response = await axios.delete(`${process.env.REACT_APP_API_URL}/user/unfriend/${id}`,
            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );

        return { success: true, data: response.data };
    } catch (response) {
        return { success: false, data: response.response.data.message };
    }
};
const cancelFriendRequest = async (id) => {
    try {
        const response = await axios.delete(`${process.env.REACT_APP_API_URL}/user/removeFriendRequest/${id}`, {
            headers: { Authorization: `Bearer ${authToken.getToken()}` },
        });
        return { success: true, data: response.data.message };
    } catch (error) {
        return { success: false, data: error };
    }
};
async function getListFriendAnother(userId) {
    try {
        const request = await axios.get(`${process.env.REACT_APP_API_URL}/user/getlistfriendanother/${userId}`,
            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        )
        return request
    } catch (error) {
    }
}
export default {
    AddFriend,
    getListFriendRequest,
    accectRequestAddFriend,
    declineRequestAddFriend,
    cancelFriend,
    getListMyFriend,
    getListFriendAnother,
    checkFriend,
    cancelFriendRequest,
    getAllFriendInvitation
}