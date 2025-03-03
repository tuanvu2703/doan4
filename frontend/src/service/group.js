import axios from 'axios';
import authToken from '../components/authToken';


const createGroup = async (groupName, members) => {
    if (groupName.length > 50) {
        return { success: false, data: 'Tên dài quá nhập lại đi' };
    } else {
        try {
            // Convert members array to an object as expected by the API
            const participants = members;

            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/chat/creategroup`,
                {
                    name: groupName,
                    participants, // Pass the object instead of an array
                },
                {
                    headers: { Authorization: `Bearer ${authToken.getToken()}` },
                }
            );

            return { success: true, data: response.data };
        } catch (response) {
            return { success: false, data: response.response.data.message };
        }
    }
};

const addMemberGroup = async (idgr, listmember) => {
    try {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/chat/addMembersTogroup/${idgr}`, {
            participants: listmember
        },
            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );
        return { success: true, data: response.data };
    } catch (response) {
        return { success: false, data: response.response.data.message };
    }
};
const removeMemberGroup = async (idgr, listmember) => {
    try {
        const response = await axios.put(`${process.env.REACT_APP_API_URL}/chat/removeMemBerInGroup/${idgr}`, {
            participants: listmember
        },
            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );
        return { success: true, data: response.data };
    } catch (response) {
        return { success: false, data: response.response.data };
    }
};
const removeGroup = async (idgr) => {
    try {
        const response = await axios.delete(`${process.env.REACT_APP_API_URL}/chat/deleteGroup/${idgr}`, 
            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );
        return { success: true, data: response.data };
    } catch (response) {
        return { success: false, data: response.response.data };
    }
};
const getMyListChat = async () => {
    // if(!iduser){
    //     return { success: false};
    // }

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
const getMemberIngroup = async (idgr) => {
    if (!idgr) {
        return { success: false };
    }

    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/chat/MembersGroup/${idgr}`,
            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );
        return { success: true, data: response.data };
    } catch (response) {
        return { success: false, data: response.response.data.message };
    }
};
const getMessengerGroup = async (idgr) => {
    if (!idgr) {
        return { success: false };
    }

    try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/chat/getmessagegroup/${idgr}`,
            {
                headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );
        return { success: true, data: response.data };
    } catch (response) {
        return { success: false, data: response.response.data.message };
    }
};
const sendMessGroup = async (idgroup, message, file) => {
    try {
        const formData = new FormData();
        formData.append('content', message); // Thêm nội dung tin nhắn

        if (file) {
            formData.append('files', file); // Đảm bảo tên trường là 'files' (khớp với backend)
        }

        const response = await axios.post(
            `${process.env.REACT_APP_API_URL}/chat/sendmessagetoGroup/${idgroup}`,
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
///chat/MembersGroup/{idgr}
//getmessagestouser
export default {
    createGroup,
    getMyListChat,
    getMemberIngroup,
    getMessengerGroup,
    sendMessGroup,
    addMemberGroup,
    removeMemberGroup,
    removeGroup,
}