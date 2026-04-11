const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
const HISTORY_FILE_PATH = path.join(__dirname, '../data/history.json');
// Adjust path depending on project structure: predective/backend and predective/ml-service are siblings
const METRICS_FILE_PATH = path.join(__dirname, '../../ml-service/metrics.json');

const readJsonFile = (filePath, defaultData = []) => {
    if (!fs.existsSync(filePath)) {
        return defaultData;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    try {
        return JSON.parse(data);
    } catch {
        return defaultData;
    }
};

const writeJsonFile = (filePath, data) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
};

exports.getHealth = (req, res) => {
    res.json({ status: 'ok', service: 'Node.js Backend' });
};

exports.predictFailure = async (req, res) => {
    try {
        const reqBody = req.body || {};
        const { air_temperature, process_temperature, rotational_speed, torque, tool_wear } = reqBody;
        
        // Basic validation
        if (air_temperature === undefined || process_temperature === undefined || 
            rotational_speed === undefined || torque === undefined || tool_wear === undefined) {
            return res.status(400).json({ error: 'Missing required parameters: air_temperature, process_temperature, rotational_speed, torque, tool_wear' });
        }
        
        // Call Python ML Service
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
            air_temperature, process_temperature, rotational_speed, torque, tool_wear
        });
        
        const predictionResult = mlResponse.data;
        
        // Save to history
        const historyItem = {
            input: { air_temperature, process_temperature, rotational_speed, torque, tool_wear },
            ...predictionResult,
            timestamp: new Date().toISOString()
        };
        
        const history = readJsonFile(HISTORY_FILE_PATH, []);
        history.push(historyItem);
        writeJsonFile(HISTORY_FILE_PATH, history);
        
        res.json(predictionResult);
    } catch (error) {
        console.error('Error in predict API:', error.message);
        res.status(500).json({ 
            error: 'Failed to communicate with ML service or perform prediction.',
            details: error.response?.data || error.message
        });
    }
};

exports.getMetrics = (req, res) => {
    try {
        const metrics = readJsonFile(METRICS_FILE_PATH, {});
        // If file doesn't exist or is empty Array, check if it has properties
        if (Array.isArray(metrics) && metrics.length === 0) {
            res.status(404).json({ error: 'Metrics file not found or empty. Please train the ML model first.'});
            return;
        }
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read metrics file.' });
    }
};

exports.getHistory = (req, res) => {
    try {
        const history = readJsonFile(HISTORY_FILE_PATH, []);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read history.' });
    }
};

exports.saveHistory = (req, res) => {
    try {
        const historyItem = {
            ...req.body,
            timestamp: new Date().toISOString()
        };
        const history = readJsonFile(HISTORY_FILE_PATH, []);
        history.push(historyItem);
        writeJsonFile(HISTORY_FILE_PATH, history);
        res.json({ status: 'success', savedItem: historyItem });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save history.' });
    }
};
