const express = require('express');
const router = express.Router();
const predictController = require('../controllers/predictController');

router.get('/health', predictController.getHealth);
router.post('/predict', predictController.predictFailure);
router.get('/metrics', predictController.getMetrics);
router.get('/history', predictController.getHistory);
router.post('/history', predictController.saveHistory);

module.exports = router;
