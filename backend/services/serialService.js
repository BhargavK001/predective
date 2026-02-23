const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
require('dotenv').config();

let latestData = {
    pwm: 0,
    pulse: 0,
    duty: 0,
    stability: 0,
    shock: 0,
    vibration: "WAITING",
    motor: "STOPPED",
    distance: "UNKNOWN"
};

const portPath = process.env.SERIAL_PORT || 'COM3';
const baudRate = parseInt(process.env.BAUD_RATE) || 9600;

let port;

function initSerial() {
    console.log(`Attempting to connect to serial port: ${portPath}`);
    
    port = new SerialPort({
        path: portPath,
        baudRate: baudRate,
        autoOpen: false
    });

    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

    port.open((err) => {
        if (err) {
            console.error(`Error opening port ${portPath}: `, err.message);
            console.log('Starting Mock Data Generator for testing...');
            startMockData();
            return;
        }
        console.log(`Serial Port ${portPath} opened successfully.`);
    });

    parser.on('data', (data) => {
        try {
            const parsed = JSON.parse(data);
            latestData = { ...latestData, ...parsed };
            console.log('New data received:', latestData);
        } catch (e) {
            console.error('Error parsing JSON from serial:', data);
        }
    });

    port.on('close', () => {
        console.log('Serial port closed.');
        // Auto reconnect logic could go here
    });

    port.on('error', (err) => {
        console.error('Serial port error: ', err.message);
    });
}

function startMockData() {
    setInterval(() => {
        const vibrationStates = ["NORMAL", "WARNING", "CRITICAL"];
        const motorStates = ["MOTOR RUNNING", "MOTOR STOPPED"];
        const distanceStates = ["CLOSE RANGE", "MID RANGE", "FAR RANGE"];
        
        latestData = {
            pwm: Math.floor(Math.random() * 255),
            pulse: Math.floor(Math.random() * 100),
            duty: parseFloat((Math.random() * 100).toFixed(1)),
            stability: parseFloat(Math.random().toFixed(2)),
            shock: Math.random() > 0.8 ? 1 : 0,
            vibration: vibrationStates[Math.floor(Math.random() * vibrationStates.length)],
            motor: motorStates[Math.floor(Math.random() * motorStates.length)],
            distance: distanceStates[Math.floor(Math.random() * distanceStates.length)]
        };
    }, 1000);
}

const getLatestData = () => latestData;

module.exports = {
    initSerial,
    getLatestData
};
