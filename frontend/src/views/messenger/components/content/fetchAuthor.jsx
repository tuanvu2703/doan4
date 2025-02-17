import axios from "axios";
import authToken from "../../../../components/authToken";

const userCache = {};
const cacheExpiryTime = 300000; // 5 minutes

const fetchAuthor = async (authorId) => {
    const cachedUser = userCache[authorId];
    const now = Date.now();

    if (cachedUser && now - cachedUser.timestamp < cacheExpiryTime) {
        return cachedUser.data;
    }

    try {
        const response = await axios.get(`http://localhost:3001/user/${authorId}`, {
            headers: { Authorization: `Bearer ${authToken.getToken()}` },
        });
        const user = response.data;
        userCache[authorId] = { data: user, timestamp: now };
        return user;
    } catch (error) {
        console.error("Error fetching author:", error);
        return { firstName: "Unknown", lastName: "" };
    }
};
export default fetchAuthor