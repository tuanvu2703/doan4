import axios from 'axios';
import authToken from '../components/authToken';
import Apiuri from './apiuri';
const url = Apiuri.Apiuri()

const getAllUser = async () => {
    try {
        const response = await axios.get(`${url}/user/getAllUser`,

            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );
        return { success: true, data: response.data };
    } catch (response) {
        return { success: false, data: response.response.data.message };
    }
};

//getHomeFeed
async function getAllPost() {
    try {
        const request = await axios.get(`${url}/post/getAllPost`,
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
export {getAllUser, getAllPost}