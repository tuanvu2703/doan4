import axios from "axios";
import authToken from "../components/authToken";
import Apiuri from './apiuri';
const url = Apiuri.Apiuri()

export async function OtherProfile(id) {
    try {
        const request = axios.get(`${url}/user/getDetailUser/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${authToken.getToken()}`
                }
            }
        )
        return request
    } catch (error) {

    }
}
export async function getAllOtherPosts(id) {
    try {
        const request = axios.get(`${url}/post/friend/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${authToken.getToken()}`
                }
            }
        )
        return request
    } catch (error) {

    }
}