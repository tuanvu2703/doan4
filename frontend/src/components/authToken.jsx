import cookieModule from "./cookie.module";
import axios from "axios";

function getToken() {
  return cookieModule().getCookie("TokenDoan3");
}
function setToken(value) {
  if (getToken()) {
    deleteToken();
    return cookieModule().setCookie("TokenDoan3", value, 24)
  } else {
    return cookieModule().setCookie("TokenDoan3", value, 24)
  }
}
function deleteToken() {
  cookieModule().deleteCookie("refreshToken")
  cookieModule().deleteCookie("TokenDoan3")
}


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