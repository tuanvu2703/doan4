import { io } from "socket.io-client";
import authToken from "../../components/authToken";
const URL = process.env.REACT_APP_API_SOCKET_URL

const socket = io(URL, {
  extraHeaders: {
    Authorization: `Bearer ${authToken.getToken()}`,
  },
});

// const socketcall = io(URLCALL, {
//   extraHeaders: {
//     Authorization: `Bearer ${authToken.getToken()}`,
//   },
// });

export default socket;
