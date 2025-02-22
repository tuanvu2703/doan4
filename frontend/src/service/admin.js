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
export {
    getAllUser
}