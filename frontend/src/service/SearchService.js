import axios from "axios";
import authToken from "../components/authToken";


export async function getSearchResult(search) {
    try {
        const request = await axios.get(`${process.env.REACT_APP_API_URL}/post/getPostByContent/${search}`, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`
            }
        })
        return request
    } catch (error) {
        console.log(error)
    }
}

export async function getSearchUser(search) {
    try {
        const request = await axios.get(`${process.env.REACT_APP_API_URL}/user/getUserByName/${search}`, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`
            }
        })
        return request
    } catch (error) {
        console.log(error)
    }
}