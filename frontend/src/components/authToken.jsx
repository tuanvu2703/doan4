import cookieModule from "./cookie.module";

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
    return cookieModule().deleteCookie("TokenDoan3")
}
export default { getToken, setToken, deleteToken };