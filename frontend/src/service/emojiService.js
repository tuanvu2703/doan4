import axios from 'axios';
import authToken from '../components/authToken';

const API_EMOJI_KEY = process.env.REACT_APP_EMOJI_KEY;
async function getAllEmoji() {
    try {
        const request = await axios.get(`https://api.api-ninjas.com/v1/emoji?name=all`,
            {
                headers: {
                    'X-Api-Key': API_EMOJI_KEY, // Truyền API Key vào header
                    'Content-Type': 'application/json'
                }
            }
        )
        return request
    } catch (error) {

    }
}


export { getAllEmoji }

