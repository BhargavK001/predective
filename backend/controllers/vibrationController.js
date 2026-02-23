const serialService = require('../services/serialService');

const getLatestVibrationData = (req, res) => {
    try {
        const data = serialService.getLatestData();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving vibration data', error: error.message });
    }
};

module.exports = {
    getLatestVibrationData
};
