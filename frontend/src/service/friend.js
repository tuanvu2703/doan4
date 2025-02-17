import axios from 'axios';
import authToken from '../components/authToken';
import Apiuri from './apiuri';
import { useCallback } from 'react';
import socket from './webSocket/socket';
import useWebSocket from './webSocket/usewebsocket';
const url = Apiuri.Apiuri()

const AddFriend = async (id) => {

    try {
        const result = await axios.get(`${url}/friend/status/${id}`,
            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );
        console.log(result.data.status)
        if (result.data.status == 'no_request') {
            const response = await axios.post(`${url}/user/friendrequest/${id}`, {},
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

const getListFriendRequest = async () => {
    try {
        const response = await axios.get(`${url}/user/getMyFriendRequest`,
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
        const response = await axios.get(`${url}/user/getMyFriend`,
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

        const response = await axios.post(`${url}/user/acceptfriend/${id}`, {},
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
        const response = await axios.post(`${url}/user/rejectFriendRequest/${id}`, {},
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
        const listResponse = await axios.get(`${url}/user/getalluser`, {
            headers: { Authorization: `Bearer ${authToken.getToken()}` },
        });
        const lisfr = listResponse.data;

        // Find the friend with the matching ID
        const friend = lisfr.find((friend) => friend._id == id);
        // console.log(friend.status)
        return { success: true, data: "dât loc tu getall.", status: friend.status };
    } catch (error) {
        return {
            success: false,
            data: error.response?.data?.message || "An error occurred",
        };
    }
};



const cancelFriend = async (id) => {
    try {
        const response = await axios.delete(`${url}/user/unfriend/${id}`,
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
    const remove = async (idrq) => {
        try {
            const response = await axios.delete(`${url}/user/removeFriendRequest/${idrq}`, {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            });
            return { success: true, data: response.data.message };
        } catch (error) {
            return { success: false, data: error };
        }
    };
    try {
        const userrequest = await axios.get(`${url}/user/getMyFriendRequest`,
            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );
        const idRequest = userrequest.data
            .filter((item) => item.receiver !== id && item.sender !== id)
            .map((item) => item._id);
        let idrq = [];
        if (idRequest.length == 0) {
            const userrequest = await axios.get(`${url}/friend/status/${id}`,
                {
                    headers: { Authorization: `Bearer ${authToken.getToken()}` },
                }
            );
            console.log(userrequest?.data?.idRequest)
            idrq = userrequest?.data?.idRequest
        } else {
            idrq = idRequest
        }
        const rmv = await remove(idrq);
        if (rmv.success == false) {
            const response = await axios.post(`${url}/user/rejectFriendRequest/${idrq}`, {},
                {
                    headers: { Authorization: `Bearer ${authToken.getToken()}` },
                }
            );
            return { success: true, data: response.data };
        } else {
            return { success: true, data: rmv };
        }
    } catch (response) {
        return { success: false, data: response.response.data.message };
    }
};
async function getListFriendAnother(userId) {
    try {
        const request = await axios.get(`${url}/user/getlistfriendanother/${userId}`,
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
}