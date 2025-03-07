import axios from "axios";
import authToken from "../components/authToken";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, 
});

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRrefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

API.interceptors.request.use(
  (config) => {
    const token = authToken.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshResponse = await API.post("/user/refresh-token", {}, { withCredentials: true });
          const newToken = refreshResponse.data.accessToken;

          authToken.setToken(newToken);
          isRefreshing = false;
          onRrefreshed(newToken);

          return API(originalRequest);
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
          authToken.removeToken();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }

      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(API(originalRequest));
          } else {
            reject(error);
          }
        });
      });
    }

    return Promise.reject(error);
  }
);

export default API;
