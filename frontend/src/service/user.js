import axios from 'axios';
import authToken from '../components/authToken';
import API from './API';



const getAllUser = async (id) => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/getAllUser`,

            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );
        return { success: true, data: response.data };
    } catch (response) {
        return { success: false, data: response.response.data.message };
    }
};

//http://localhost:3001/user/getDetailUser/${id}
const getProfileUser = async (id) => {
    if (id === '') {
        return { success: false };
    }
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/getDetailUser/${id}`,
            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );
        return { success: true, data: response.data };
    } catch (response) {
        return { success: false, data: response.response.data.message };
    }
};

const checkLogin = async () => {
    try {
        const response = await API.get(`${process.env.REACT_APP_API_URL}/user/current`, {
            headers: { Authorization: `Bearer ${authToken.getToken()}` },
        });

        if (response && response.data) {
            return { success: true, data: response.data };
        } else {
            return { success: false };
        }
    } catch (error) {

        return { success: false };
    }
};

export default {
    getAllUser,
    getProfileUser
}

export {
    checkLogin
}