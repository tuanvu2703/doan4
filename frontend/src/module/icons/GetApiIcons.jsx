import axios from 'axios';

const GetApiIcons = async () => {
  try {
    // Lấy dữ liệu từ file JSON trong thư mục public
    const response = await axios.get('/icons.json'); // Lấy file JSON từ thư mục public
    return response.data; // Trả về dữ liệu từ file JSON
  } catch (error) {
    console.error('Error fetching the emojis from local file:', error);
    return [];
  }
};

export default GetApiIcons;
