const express = require('express');
const cors = require('cors');
require('dotenv').config();
const vibrationRoutes = require('./routes/vibrationRoutes');
const serialService = require('./services/serialService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/vibration', vibrationRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('Predictive Maintenance API is running...');
});

// Initialize Serial Connection
serialService.initSerial();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
