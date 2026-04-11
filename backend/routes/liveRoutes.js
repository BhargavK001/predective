const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');

router.get('/latest', simulationController.getLatestLive);
router.get('/history', simulationController.getLiveHistory);

module.exports = router;
