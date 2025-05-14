import authToken from '../components/authToken';
import API from './API';
const getAllUser = async () => {
    try {
        const response = await API.get(`${process.env.REACT_APP_API_URL}/user/alluseradmin`,

            {
                extraHeaders: { Authorization: `Bearer ${authToken.getToken()}` },
                // headers: { Authorization: `Bearer ${authToken.getToken()}` },
            }
        );
        return { success: true, data: response.data };
    } catch (response) {
        return { success: false, data: response.response.data.message };
    }
};


async function getAllPost() {
    try {
        const request = await API.get(`${process.env.REACT_APP_API_URL}/post/getAllPost`,
            {
                headers: {
                    Authorization: `Bearer ${authToken.getToken()}`, // Use your auth token provider
                    'Content-Type': 'application/json'
                }
            }
        )
        return request
    } catch (error) {

    }
}

async function getALlReport() {
    try {
        const request = await API.get(`${process.env.REACT_APP_API_URL}/report/getReports`,
            {
                headers: {
                    Authorization: `Bearer ${authToken.getToken()}`,
                    'Content-Type': 'application/json' // Use your auth token provider
                }
            }
        )
        return request
    } catch (error) {

    }
}

async function activeUser(userId) {
    try {
        const request = await API.put(`${process.env.REACT_APP_API_URL}/user/activeUser/${userId}`,
            {
                headers: {
                    Authorization: `Bearer ${authToken.getToken()}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        return request
    } catch (error) {
        return error
    }
}

async function handleReport(reportId, implementation) {
    try {
        const request = await API.patch(`${process.env.REACT_APP_API_URL}/report/implementationReport/${reportId}`, { implementation },
            {
                headers: {
                    Authorization: `Bearer ${authToken.getToken()}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        return request
    } catch (error) {
        return error
    }
}


async function unactivePost(postId) {
    try {
        const request = await API.patch(`${process.env.REACT_APP_API_URL}/post/acctivePost/${postId}`,
            {
                headers: {
                    Authorization: `Bearer ${authToken.getToken()}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        return request
    } catch (error) {
        return error
    }
}

async function getAllPeal() {
    try {
        const request = await API.get(`${process.env.REACT_APP_API_URL}/report/getAllAppeal`,
            {
                headers: {
                    Authorization: `Bearer ${authToken.getToken()}`,
                    'Content-Type': 'application/json' // Use your auth token provider
                }
            }
        )
        return request
    } catch (error) {

    }
}

async function handleApeal(appealId, implementation) {
    try {
        const request = await API.patch(`${process.env.REACT_APP_API_URL}/report/implementationAppeal/${appealId}`, { implementation },
            {
                headers: {
                    Authorization: `Bearer ${authToken.getToken()}`,
                    'Content-Type': 'application/json'
                }
            }
        )
        return request
    } catch (error) {
        return error
    }
}


export { getAllUser, getAllPost, getALlReport, activeUser, handleReport, unactivePost, getAllPeal, handleApeal }
