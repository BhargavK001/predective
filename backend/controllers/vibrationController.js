const serialService = require('../services/serialService');

const getLatestVibrationData = (req, res) => {
    try {
        const data = serialService.getLatestData();
        if (!data || Object.keys(data).length === 0) {
            return res.status(503).json({ message: 'No sensor data available yet' });
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving vibration data', error: error.message });
    }
};

const getVibrationHistory = (req, res) => {
    try {
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 100, 1), 500);
        const history = serialService.getHistory(limit);
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving vibration history', error: error.message });
    }
};

module.exports = {
    getLatestVibrationData,
    getVibrationHistory,
};
