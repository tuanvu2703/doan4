import authToken from '../components/authToken';
import API from './API';

async function createPublicGroup(data) {
    try {
        const request = await API.post(`${process.env.REACT_APP_API_URL}/PublicGroup/creategroup`, data,
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


export { createPublicGroup }
