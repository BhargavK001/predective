const express = require('express');
const router = express.Router();
const vibrationController = require('../controllers/vibrationController');

router.get('/latest', vibrationController.getLatestVibrationData);

module.exports = router;
