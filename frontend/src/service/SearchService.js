import axios from "axios";
import authToken from "../components/authToken";
import Apiuri from './apiuri';
const url = Apiuri.Apiuri()

export async function getSearchResult(search) {
    try {
        const request = await axios.get(`${url}/post/getPostByContent/${search}`, {
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
        const request = await axios.get(`${url}/user/getUserByName/${search}`, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`
            }
        })
        return request
    } catch (error) {
        console.log(error)
    }
}