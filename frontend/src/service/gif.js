import axios from 'axios';



async function getGif(query) {
    try {
        const request = await axios.get(`https://tenor.googleapis.com/v2/search?q=${query}&key=${process.env.REACT_APP_TENOR_KEY}&client_key=my_test_app`
        )
        return request
    } catch (error) {
        
    }

}
export { getGif }