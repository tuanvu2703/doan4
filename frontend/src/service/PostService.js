import axios from "axios";
import authToken from "../components/authToken";
import Apiuri from './apiuri';
const url = Apiuri.Apiuri()

export async function getPostPersonal() {
    try {
        const request = await axios.get(`${url}/post/crpost`,
            {
                headers: {
                    Authorization: `Bearer ${authToken.getToken()}`, // Use your auth token provider
                    'Content-Type': 'application/json'
                }
            }
        )
        return request.data
    } catch (error) {

    }
}
//getHomeFeed
export async function getHomeFeed() {
    try {
        const request = await axios.get(`${url}/post/getHomeFeed`,
            {
                headers: {
                    Authorization: `Bearer ${authToken.getToken()}`, // Use your auth token provider
                    'Content-Type': 'application/json'
                }
            }
        )
        return request
    } catch (error) {

    }
}
//Like
export async function handleLike(postId) {
    try {
        const request = await axios.put(`${url}/post/${postId}/like`, {}, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`
            }
        })
        return request
    } catch (error) {

    }
}
//unlike
export async function handleUnLike(postId) {
    try {
        const request = await axios.put(`${url}/post/${postId}/unlike`, {}, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`
            }
        })
        return request
    } catch (error) {

    }
}

// Dislike
export async function handleDisLike(postId) {
    try {
        const request = await axios.put(`${url}/post/${postId}/dislike`, {}, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`
            }
        })
        return request
    } catch (error) {

    }
}
//undislike
export async function handleUnDisLike(postId) {
    try {
        const request = await axios.put(`${url}/post/${postId}/undislike`, {}, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`
            }
        })
        return request
    } catch (error) {

    }
}
// bookmark
//add
export async function handleAddBookmark(postId) {
    try {
        const request = await axios.post(`${url}/user/${postId}/bookmark`, {}, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`
            }
        })
        return request
    } catch (error) {

    }
}
//remove
export async function handleRemoveBookmark(postId) {
    try {
        const request = await axios.delete(`${url}/user/${postId}/bookmark`, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`
            }
        })
        return request
    } catch (error) {

    }
}
//getallBookmark from myself
export async function getAllBookmark(userId) {
    try {
        const request = await axios.get(`${url}/user/${userId}/bookmark`, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`
            }
        })
        return request
    } catch (error) {

    }
}
//detail post
export async function getDetailPost(postId) {
    try {
        const request = await axios.get(`${url}/post/${postId}/privacy`, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`
            }
        })
        return request
    } catch (error) {

    }
}

//update post
export async function updatePost(postId, content) {
    try {
        const request = await axios.put(`${url}/post/updatePost/${postId}`, { content }, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`,
                'Content-Type': 'multipart/form-data',
            }
        })
        return request
    } catch (error) {

    }
}

export async function updatePrivacyPost(postId, privacy) {
    try {
        const request = await axios.put(`${url}/post/settingprivacy/${postId}`, { privacy }, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`,
            }
        })
        return request
    } catch (error) {

    }
}
//delete post
export async function deletePost(postId) {
    try {
        const request = await axios.delete(`${url}/post/deletePost/${postId}`, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`,
            }
        })
        return request
    } catch (error) {

    }
}