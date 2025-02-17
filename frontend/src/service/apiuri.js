
const Apiuri = () => {
    // const API_URL = process.env.REACT_APP_API_URL;
    // console.log(API_URL);
    // const url = "https://social-network-jbtx.onrender.com";
    const url = 'http://localhost:3001'
    return url
}
const Socketuri = () => {
    // const url = "wss://social-network-jbtx.onrender.com";
    const url = "http://localhost:3001";
    return url
}
export default { Apiuri, Socketuri };