const simulationService = require('../services/simulationService');

exports.startSimulation = (req, res) => {
    const result = simulationService.start();
    res.json(result);
};

exports.stopSimulation = (req, res) => {
    const result = simulationService.stop();
    res.json(result);
};

exports.getSimulationStatus = (req, res) => {
    res.json(simulationService.getStatus());
};

exports.getLatestLive = (req, res) => {
    const latest = simulationService.getLatest();
    if (!latest) {
        return res.status(404).json({ message: 'No live data available yet. Ensure simulation is running.' });
    }
    res.json(latest);
};

exports.getLiveHistory = (req, res) => {
    res.json(simulationService.getHistory());
};
