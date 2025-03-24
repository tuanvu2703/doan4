import axios from 'axios';
import authToken from '../components/authToken';

async function getAllNotification() {
    try {
        const request = await axios.get(
            `${process.env.REACT_APP_API_URL}/notifications/getnotifications`,
            {
                headers: {
                    Authorization: `Bearer ${authToken.getToken()}`
                }
            }
        );
        return request.data;
    } catch (error) {
    }
}

export { getAllNotification }