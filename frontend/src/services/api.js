import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Based on Node backend route prefix in server.js

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkHealth = async () => {
    try {
        const response = await apiClient.get('/health');
        return response.data;
    } catch (error) {
        console.error('API Error (health):', error);
        throw error;
    }
};

export const predictMachineFailure = async (sensorData) => {
    try {
        const response = await apiClient.post('/predict', sensorData);
        return response.data;
    } catch (error) {
        console.error('API Error (predict):', error);
        throw error;
    }
};

export const getModelMetrics = async () => {
    try {
        const response = await apiClient.get('/metrics');
        return response.data;
    } catch (error) {
        console.error('API Error (metrics):', error);
        throw error;
    }
};

export const getPredictionHistory = async () => {
    try {
        const response = await apiClient.get('/history');
        return response.data;
    } catch (error) {
        console.error('API Error (history):', error);
        throw error;
    }
};

// Simulation Endpoints
export const startSimulation = async () => {
    const res = await apiClient.post('/simulation/start');
    return res.data;
};

export const stopSimulation = async () => {
    const res = await apiClient.post('/simulation/stop');
    return res.data;
};

export const getSimulationStatus = async () => {
    const res = await apiClient.get('/simulation/status');
    return res.data;
};

export const getLiveLatest = async () => {
    const res = await apiClient.get('/live/latest');
    return res.data;
};

export const getLiveHistory = async () => {
    const res = await apiClient.get('/live/history');
    return res.data;
};
