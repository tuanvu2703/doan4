import axios from 'axios';
import authToken from '../components/authToken';
import Apiuri from './apiuri';

async function getAllEmoji() {
    try {
        const request = await axios.get(`https://emoji-api.com/emojis?access_key=388e50ed78f726a217e25609ed0effa2a348ecfa`,
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
export { getAllEmoji }