const axios = require('axios');

class SimulationService {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
        this.liveHistory = [];
        this.toolWear = 0; 
        this.pythonApiUrl = process.env.MODEL_API_URL || 'http://127.0.0.1:8000';
    }

    start() {
        if (this.isRunning) return { message: 'Already running' };
        this.isRunning = true;
        this.intervalId = setInterval(() => this.runCycle(), 2500);
        return { message: 'Simulation started' };
    }

    stop() {
        if (!this.isRunning) return { message: 'Already stopped' };
        this.isRunning = false;
        if (this.intervalId) clearInterval(this.intervalId);
        return { message: 'Simulation stopped' };
    }

    getStatus() {
        return { isRunning: this.isRunning };
    }

    getLatest() {
        return this.liveHistory.length > 0 ? this.liveHistory[this.liveHistory.length - 1] : null;
    }

    getHistory() {
        return this.liveHistory;
    }

    generateSensorData() {
        const airTemp = 295 + Math.random() * 10;
        const processTemp = airTemp + 10 + Math.random() * 4;
        
        let rpm = 1400 + Math.random() * 200;
        let torque = 35 + Math.random() * 10;

        // Tool wear escalating much faster to hit degradation testing
        this.toolWear += 5 + (Math.random() * 5); 

        // Pseudo-realistic spikes logic guaranteeing Machine Failure Prediction (e.g. TWF or HDF)
        const isCriticalFailure = Math.random() < 0.15; // 15% chance of sudden critical torque/rpm fault
        
        if (isCriticalFailure || this.toolWear > 210) {
            rpm = 1200; // severe engine stall
            torque = 70; // massive extreme torque overstrain
            this.toolWear = Math.max(this.toolWear, 230); // ensures tool wear fault kicks in if Model weights it heavily
        }

        if (this.toolWear > 260) {
            this.toolWear = 0; // Engine fixed/replaced
        }

        return {
            air_temperature: parseFloat(airTemp.toFixed(1)),
            process_temperature: parseFloat(processTemp.toFixed(1)),
            rotational_speed: parseInt(rpm),
            torque: parseFloat(torque.toFixed(1)),
            tool_wear: parseInt(this.toolWear)
        };
    }

    async runCycle() {
        const payload = this.generateSensorData();
        try {
            const response = await axios.post(`${this.pythonApiUrl}/predict`, payload);
            const data = response.data;

            const record = {
                timestamp: new Date().toISOString(),
                ...payload,
                prediction: data.prediction,
                confidence: data.confidence,
                suggestion: data.suggestion,
                status: data.prediction === 1 ? 'Failure Risk' : 'Normal'
            };

            this.liveHistory.push(record);
            
            if (this.liveHistory.length > 50) {
                this.liveHistory.shift(); // Bound memory footprint
            }

        } catch (error) {
            console.error("Simulation loop error calling Python ML:", error.message);
        }
    }
}

module.exports = new SimulationService();
