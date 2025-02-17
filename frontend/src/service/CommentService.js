import axios from "axios";
import authToken from "../components/authToken";
import Apiuri from './apiuri';
const url = Apiuri.Apiuri()

export async function getComment(postId) {
    try {
        const request = await axios.get(`${url}/comments/post/${postId}`, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`
            }
        })
        return request
    } catch (error) {
        console.log(error)
    }
}
//like
export async function handleLike(cmtId) {
    try {
        const request = await axios.put(`${url}/comments/${cmtId}/like`, {}, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`
            }
        })
        return request
    } catch (error) {
        console.log(error)
    }
}

//unlike

export async function handleUnLike(cmtId) {
    try {
        const request = await axios.put(`${url}/comments/${cmtId}/unlike`, {}, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`
            }
        })
        return request
    } catch (error) {
        console.log(error)
    }
}

//create comment

export async function createComment(postId, content) {
    try {
        const request = await axios.post(`${url}/comments/${postId}`, { content }, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`
            }
        })
        return request
    } catch (error) {
        console.log(error)
    }
}
//create reply comment

export async function createReplyComment(cmtId, content) {
    try {
        const request = await axios.post(`${url}/comments/${cmtId}/reply`, { content }, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`
            }
        })
        return request
    } catch (error) {
        console.log(error)
    }
}
