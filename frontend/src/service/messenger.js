import axios from 'axios';
import authToken from '../components/authToken';


const getListMessenger = async (iduser, message) => {
    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/chat/getMylistChat`,
            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );
        return { success: true, data: response.data };
    } catch (response) {
        return { success: false, data: response.response.data.message };
    }
};

const getListMessengerByUser = async (iduser) => {
    // if(!iduser){
    //     return { success: false};
    // }

    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/chat/getmessagestouser/${iduser}`,
            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );
        return { success: true, data: response.data };
    } catch (response) {
        return { success: false, data: response.response.data.message };
    }


};
const sendMess = async (iduser, message, file) => {
    try {
        const formData = new FormData();
        formData.append('content', message); // Thêm nội dung tin nhắn

        if (file) {
            formData.append('files', file); // Đảm bảo tên trường là 'files' (khớp với backend)
        }

        const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/chat/sendmessageToUser/${iduser}`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${authToken.getToken()}`,
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, data: error.response ? error.response.data.message : 'An error occurred' };
    }
};
const revokedMesage = async (idMess) => {
    ///chat/revokedMesage/{messageId}
    try {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/chat/revokedMesage/${idMess}`,{},
            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );
        return { success: true, data: response.data };
    } catch (response) {
        return { success: false, data: response.response.data.message };
    }
};
//getmessagestouser
export default {
    sendMess,
    getListMessenger,
    getListMessengerByUser,
    revokedMesage,
}