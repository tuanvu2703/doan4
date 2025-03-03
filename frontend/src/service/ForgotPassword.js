import axios from "axios";


export async function forgotPassword(email) {
    try {
        const request = await axios.post(`${process.env.REACT_APP_API_URL}/user/send-otp-resetpassword`, { email });
        return request;
    } catch (error) {
        console.log(error);
    }
}
export async function verifyOTP(email, otp) {
    try {
        const request = await axios.post(`${process.env.REACT_APP_API_URL}/user/verify-otp`, { email, otp });
        return request;
    } catch (error) {
        console.log(error);
    }
}

export async function resetPassword(email, otp, newPassword) {
    try {
        const request = await axios.post(`${process.env.REACT_APP_API_URL}/user/reset-password`, { email, otp, newPassword });
        return request;
    } catch (error) {
        console.log(error);
    }
}