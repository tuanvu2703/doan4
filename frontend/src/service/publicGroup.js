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

    }
}

export { createPublicGroup, getPublicGroupParticipated, getMemberGroup, getPublicGroupById, getAllPostInGroup }
