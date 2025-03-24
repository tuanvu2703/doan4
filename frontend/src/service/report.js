import axios from 'axios';
import authToken from '../components/authToken';

async function sendReport(report) {
    try {
        const request = await axios.post(
            `${process.env.REACT_APP_API_URL}/report/sendReport`, report,
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

export { sendReport }