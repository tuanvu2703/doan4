import axios from "axios";
import authToken from "../components/authToken";
import Apiuri from './apiuri';
const url = Apiuri.Apiuri()

export async function changepass(currentPassword, newPassword) {
    try {
        const request = await axios.put(
            `${url}/user/change-password`, 
            { currentPassword, newPassword },
            {
                headers: {
                    Authorization: `Bearer ${authToken.getToken()}`
                }
            }
        );
        return { success: true, messenger: request.data.message, status: request.status };
    } catch (error) {
        const errorMessage = error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
        return { success: false, messenger: errorMessage, status: error.response?.status || 500 };
    }
}
