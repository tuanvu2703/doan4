import { io } from "socket.io-client";
import authToken from "../../components/authToken";
import apiuri from "../apiuri";
const URL = apiuri.Socketuri()
const socket = io(URL, {
  extraHeaders: {
    Authorization: `Bearer ${authToken.getToken()}`,
  },
});

export default socket;
