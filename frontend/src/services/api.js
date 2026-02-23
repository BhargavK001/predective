import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getLatestVibrationData = async () => {
    try {
        const response = await api.get('/vibration/latest');
        return response.data;
    } catch (error) {
        console.error('API Error:', error.message);
        throw error;
    }
};

export default api;
