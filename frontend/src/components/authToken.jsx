import cookieModule from "./cookie.module";
import axios from "axios";


function getToken() {
  return cookieModule().getCookie("TokenDoan3");
}
function setToken(value) {
  if (getToken()) {
    logout()
    deleteToken();
    return cookieModule().setCookie("TokenDoan3", value, 24)
  } else {
    return cookieModule().setCookie("TokenDoan3", value, 24)
  }
}
function deleteToken() {
  cookieModule().deleteCookie("refreshToken")
  cookieModule().deleteCookie("TokenDoan3")
  logout()
}
const logout = async () => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_API_URL}/user/logout`, {}, {
      withCredentials: true
    });
    console.log(response.data.message); 

  } catch (error) {
    console.error('Logout failed:', error.response?.data || error.message);
    throw error; 
  }
};

const refreshAccessToken = async () => {
  try {
    const res = await axios.post("http://localhost:3001/user/refresh-token", {}, {
      withCredentials: true
    });

    const { accessToken } = res.data;
    setToken(accessToken);
  } catch (error) {
    console.error("Failed to refresh token", error);
    return null;
  }
};

export default { getToken, setToken, deleteToken, refreshAccessToken };