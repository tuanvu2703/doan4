import authToken from '../components/authToken';
import API from './API';
// import axios from 'axios';

async function createPublicGroup(data) {
    try {
        const request = await API.post(`${process.env.REACT_APP_API_URL}/PublicGroup/creategroup`, data,
            {
                headers: {
                    Authorization: `Bearer ${authToken.getToken()}`, // Use your auth token provider
                    'Content-Type': 'multipart/form-data',
                }
            }
        );
        return request.data;
    } catch (error) {
        console.error("Error creating group:", error);
        throw error;
    }
}

async function getPublicGroupParticipated() {
    try {
        const request = await API.get(`${process.env.REACT_APP_API_URL}/PublicGroup/getGroupByUser`, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`, // Use your auth token provider
            }
        })
        return request.data;
    } catch (error) {

    }
}

async function getMemberGroup(groupId) {
    try {
        const request = await API.get(`${process.env.REACT_APP_API_URL}/PublicGroup/getMemberGroup/${groupId}`, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`, // Use your auth token provider
            }
        })
        return request.data;
    } catch (error) {

    }
}

async function getPublicGroupById(groupId) {
    try {
        const request = await API.get(`${process.env.REACT_APP_API_URL}/PublicGroup/getGroupId/${groupId}`, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`, // Use your auth token provider
            }
        })
        return request.data;
    } catch (error) {

    }
}

async function getAllPostInGroup(groupId) {
    try {
        const request = await API.get(`${process.env.REACT_APP_API_URL}/PublicGroup/getPostInGroup/${groupId}`, {
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

async function getAllGroup() {
    try {
        const request = await API.get(`${process.env.REACT_APP_API_URL}/PublicGroup/getAllPublicGroup`, {
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

async function requestJoinGroup(groupId) {
    try {
        const request = await API.post(`${process.env.REACT_APP_API_URL}/PublicGroup/requestJoinGroup/${groupId}`, {
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


async function getAllMyRequestJoinGroup() {
    try {
        const request = await API.get(`${process.env.REACT_APP_API_URL}/PublicGroup/getAllmyRequestJoinGroup`, {
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

async function removeRequestJoinGroup(requestId) {
    try {
        const request = await API.delete(`${process.env.REACT_APP_API_URL}/PublicGroup/removeRequestJoinGroup/${requestId}`, {
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


async function getAllRequestMyGroup(groupId) {
    try {
        const request = await API.get(`${process.env.REACT_APP_API_URL}/PublicGroup/getAllRequestJoinGroup/${groupId}`, {
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



async function acceptJoinGroup(requestId) {
    try {
        const request = await API.post(`${process.env.REACT_APP_API_URL}/PublicGroup/acceptJoinGroup/${requestId}`, {
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


export { createPublicGroup, getPublicGroupParticipated, getMemberGroup, getPublicGroupById, getAllPostInGroup, getAllGroup, requestJoinGroup, getAllMyRequestJoinGroup, removeRequestJoinGroup, getAllRequestMyGroup, acceptJoinGroup }
