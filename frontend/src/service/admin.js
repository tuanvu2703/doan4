import axios from 'axios';
import authToken from '../components/authToken';

const getAllUser = async () => {
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

//getHomeFeed
async function getAllPost() {
    try {
        const request = await axios.get(`${process.env.REACT_APP_API_URL}/post/getAllPost`,
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

async function getALlReport() {
    try {
        const request = await axios.get(`${process.env.REACT_APP_API_URL}/report/getReports`,
            {
                headers: {
                    Authorization: `Bearer ${authToken.getToken()}`,
                    'Content-Type': 'application/json' // Use your auth token provider
                }
            }
        )
        return request
    } catch (error) {

    }
}

export { getAllUser, getAllPost, getALlReport }