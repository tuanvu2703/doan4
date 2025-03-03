import axios from "axios";
import authToken from "../components/authToken";

export async function profileUserCurrent() {
    try {
        var request = await axios.get(`${process.env.REACT_APP_API_URL}/user/current`, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`
            }
        })
        return request
    } catch (error) {

        console.log(error)
        authToken.deleteToken();
    }
}

export async function updateName(firstName, lastName) {
    try {
        const request = await axios.put(`${process.env.REACT_APP_API_URL}/user/update`, { firstName, lastName }, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`
            }
        })
        return request
    } catch (error) {
        console.log(error)
    }
}

export async function updateInformation(birthday, gender, address, email) {
    try {
        const request = await axios.put(`${process.env.REACT_APP_API_URL}/user/update`, { birthday, gender, address, email }, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`
            }
        })
        return request
    } catch (error) {
        console.log(error)
    }
}

export async function uploadAvatar(file) {
    try {
        const formData = new FormData();
        formData.append('files', file);
        const request = await axios.post(`${process.env.REACT_APP_API_URL}/user/upload-avatar`, formData, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`,
                'Content-Type': 'multipart/form-data'
            }
        })
        return request
    } catch (error) {
        console.log(error)
    }
}

export async function uploadBackground(file) {
    try {
        const formData = new FormData();
        formData.append('files', file);
        const request = await axios.post(`${process.env.REACT_APP_API_URL}/user/uploadcoveravatar`, formData, {
            headers: {
                Authorization: `Bearer ${authToken.getToken()}`,
                'Content-Type': 'multipart/form-data'
            }
        })
        return request
    } catch (error) {
        console.log(error)
    }
}