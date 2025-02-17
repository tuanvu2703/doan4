import axios from "axios";
import Apiuri from './apiuri';
const url = Apiuri.Apiuri()

export async function forgotPassword(email) {
    try {
        const request = await axios.post(`${url}/user/send-otp-resetpassword`, { email });
        return request;
    } catch (error) {
        console.log(error);
    }
}
export async function verifyOTP(email, otp) {
    try {
        const request = await axios.post(`${url}/user/verify-otp`, { email, otp });
        return request;
    } catch (error) {
        console.log(error);
    }
}

export async function resetPassword(email, otp, newPassword) {
    try {
        const request = await axios.post(`${url}/user/reset-password`, { email, otp, newPassword });
        return request;
    } catch (error) {
        console.log(error);
    }
}