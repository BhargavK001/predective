const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
require('dotenv').config();

// ─── Fault Labels ────────────────────────────────────────────────────────────
const FAULT_LABELS = {
  0: 'HEALTHY',
  1: 'UNBALANCE',
  2: 'MISALIGNMENT',
  3: 'BEARING_WEAR',
  4: 'OVERLOAD',
  5: 'LOOSE_MOUNTING',
  6: 'SHAFT_ECCENTRICITY',
  7: 'WINDING_SHORT',
  8: 'STALLED_ROTOR',
};

// ─── State ───────────────────────────────────────────────────────────────────
let latestData = {};
const historyBuffer = [];
const MAX_HISTORY = 500;

const portPath = process.env.SERIAL_PORT || 'COM3';
const baudRate = parseInt(process.env.BAUD_RATE) || 9600;
let port;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const rand = (min, max) => +(Math.random() * (max - min) + min).toFixed(4);
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function pickFaultLabel() {
  const r = Math.random();
  if (r < 0.60) return 0; // HEALTHY 60%
  if (r < 0.70) return 1; // UNBALANCE
  if (r < 0.78) return 2; // MISALIGNMENT
  if (r < 0.84) return 3; // BEARING_WEAR
  if (r < 0.89) return 4; // OVERLOAD
  if (r < 0.93) return 5; // LOOSE_MOUNTING
  if (r < 0.96) return 6; // SHAFT_ECCENTRICITY
  if (r < 0.98) return 7; // WINDING_SHORT
  return 8;               // STALLED_ROTOR
}

// ─── Mock Data Generator ─────────────────────────────────────────────────────
function generateMockData() {
  const fault_label = pickFaultLabel();
  const isFault = fault_label > 0;
  const faultName = FAULT_LABELS[fault_label];

  // ── Base values (HEALTHY ranges) ──
  let accel_rms = rand(0.5, 1.4);
  let accel_peak = accel_rms * rand(1.4, 2.0);
  let accel_kurtosis = rand(2.5, 3.5);
  let accel_skewness = rand(-0.3, 0.3);
  let accel_crest_factor = rand(2.5, 4.0);

  let fft_1x_amplitude = rand(0.1, 0.5);
  let fft_2x_amplitude = rand(0.05, 0.25);
  let fft_3x_amplitude = rand(0.02, 0.15);
  let fft_bpfo = rand(0.02, 0.1);
  let fft_bpfi = rand(0.02, 0.1);
  let fft_bsf = rand(0.01, 0.08);
  let fft_ftf = rand(0.01, 0.06);

  let rpm_current = rand(1800, 2400);
  let rpm_std = rand(5, 18);

  let current_mean = rand(3, 7.5);
  let current_peak = current_mean * rand(1.1, 1.3);
  let current_rms = current_mean * rand(1.0, 1.05);

  let temp_current = rand(35, 55);
  let temp_rise_rate = rand(0.01, 0.1);

  let health_index = rand(82, 100);

  let sound_level_instant = rand(40, 65);

  // ── Fault-specific biases ──
  if (fault_label === 1) {
    // UNBALANCE → elevated 1x
    fft_1x_amplitude = rand(1.5, 4.0);
    accel_rms = rand(1.6, 3.8);
    accel_peak = accel_rms * rand(1.8, 2.5);
    rpm_std = rand(20, 45);
    health_index = rand(45, 75);
  } else if (fault_label === 2) {
    // MISALIGNMENT → elevated 2x
    fft_2x_amplitude = rand(1.0, 3.0);
    fft_1x_amplitude = rand(0.8, 2.0);
    accel_rms = rand(1.8, 4.0);
    health_index = rand(40, 70);
  } else if (fault_label === 3) {
    // BEARING_WEAR → elevated bpfo + kurtosis
    fft_bpfo = rand(0.8, 3.0);
    fft_bpfi = rand(0.5, 2.0);
    accel_kurtosis = rand(5.0, 12.0);
    accel_rms = rand(2.0, 4.5);
    sound_level_instant = rand(70, 90);
    health_index = rand(30, 60);
  } else if (fault_label === 4) {
    // OVERLOAD → elevated current + temp
    current_mean = rand(9, 15);
    current_peak = current_mean * rand(1.3, 1.8);
    current_rms = current_mean * rand(1.05, 1.15);
    temp_current = rand(65, 90);
    temp_rise_rate = rand(0.3, 1.5);
    rpm_current = rand(1400, 1800);
    health_index = rand(25, 55);
  } else if (fault_label === 5) {
    // LOOSE_MOUNTING → elevated 2x/3x + broadband
    fft_2x_amplitude = rand(0.8, 2.5);
    fft_3x_amplitude = rand(0.5, 1.5);
    accel_rms = rand(2.0, 4.2);
    health_index = rand(40, 65);
  } else if (fault_label === 6) {
    // SHAFT_ECCENTRICITY → elevated 1x, variable rpm
    fft_1x_amplitude = rand(1.2, 3.0);
    rpm_std = rand(25, 55);
    accel_rms = rand(1.5, 3.5);
    health_index = rand(35, 65);
  } else if (fault_label === 7) {
    // WINDING_SHORT → elevated current, moderate temp
    current_mean = rand(8, 14);
    current_peak = current_mean * rand(1.4, 2.0);
    temp_current = rand(60, 85);
    health_index = rand(20, 50);
  } else if (fault_label === 8) {
    // STALLED_ROTOR → near-zero rpm, max current
    rpm_current = rand(0, 200);
    current_mean = rand(12, 15);
    current_peak = current_mean * rand(1.5, 2.5);
    temp_current = rand(75, 90);
    health_index = rand(0, 20);
  }

  // ── Raw accelerometer / gyroscope ──
  const accel_x = rand(-accel_peak, accel_peak);
  const accel_y = rand(-accel_peak, accel_peak);
  const accel_z = rand(9.0, 10.5);
  const gyro_x = rand(-50, 50);
  const gyro_y = rand(-50, 50);
  const gyro_z = rand(-50, 50);

  // ── Derived accel stats ──
  const accel_mean_x = rand(-0.5, 0.5);
  const accel_mean_y = rand(-0.5, 0.5);
  const accel_mean_z = rand(9.5, 10.0);
  const accel_std_x = rand(0.1, accel_rms * 0.6);
  const accel_std_y = rand(0.1, accel_rms * 0.6);
  const accel_std_z = rand(0.05, 0.3);

  // ── FFT derived ──
  const fft_dominant_freq = rand(20, 200);
  const fft_spectral_centroid = rand(50, 300);
  const total_power = rand(1, 10);
  const fft_power_ratio_low = rand(0.2, 0.5);
  const fft_power_ratio_mid = rand(0.2, 0.5);
  const fft_power_ratio_high = +(1 - fft_power_ratio_low - fft_power_ratio_mid).toFixed(4);

  // ── Speed ──
  const rpm_mean = rand(rpm_current - 50, rpm_current + 50);
  const rpm_min = rand(rpm_current - rpm_std * 3, rpm_current - rpm_std);
  const rpm_max = rand(rpm_current + rpm_std, rpm_current + rpm_std * 3);
  const rpm_range = +(rpm_max - rpm_min).toFixed(2);
  const rpm_coefficient_of_variation = +((rpm_std / Math.max(rpm_mean, 1)) * 100).toFixed(4);

  // ── Current ──
  const current_instant = rand(current_mean - 1.5, current_mean + 1.5);
  const current_std = rand(0.1, current_mean * 0.15);
  const current_min = rand(current_mean - current_std * 3, current_mean - current_std);
  const current_power_estimated = +(current_rms * rand(220, 240)).toFixed(2);
  const current_spike_count = isFault ? randInt(1, 10) : randInt(0, 2);

  // ── Voltage ──
  const voltage_instant = rand(218, 242);
  const voltage_mean = rand(220, 240);
  const voltage_std = rand(0.5, 3.0);
  const voltage_min = rand(215, 225);
  const voltage_sag = rand(0, 5);
  const voltage_ripple = rand(0.1, 2.0);

  // ── Temperature ──
  const temp_mean = rand(temp_current - 3, temp_current + 3);
  const temp_max = rand(temp_current, temp_current + 10);
  const temp_delta_ambient = +(temp_current - rand(22, 28)).toFixed(2);
  const temp_steady_state = rand(temp_current - 5, temp_current + 2);

  // ── Acoustic ──
  const sound_level_mean = rand(sound_level_instant - 5, sound_level_instant + 5);
  const sound_level_peak = rand(sound_level_instant, sound_level_instant + 15);
  const sound_level_std = rand(1, 8);
  const sound_spectral_centroid = rand(500, 3000);
  const sound_zero_crossing_rate = rand(0.05, 0.4);

  // ── Multi-sensor derived ──
  const power_factor = rand(0.7, 0.98);
  const mechanical_power = +(current_rms * voltage_mean * power_factor / 1000).toFixed(3);
  const vibration_to_speed_ratio = +((accel_rms / Math.max(rpm_current, 1)) * 1000).toFixed(4);
  const current_to_speed_ratio = +((current_mean / Math.max(rpm_current, 1)) * 1000).toFixed(4);
  const temp_to_current_ratio = +((temp_current / Math.max(current_mean, 0.1))).toFixed(4);

  // ── Temporal ──
  const vibration_trend = rand(-0.5, 0.5);
  const temperature_trend = rand(-0.3, 0.3);
  const rpm_stability_score = clamp(+(100 - rpm_std * 2).toFixed(2), 0, 100);
  const fault_duration = isFault ? randInt(1, 600) : 0;

  return {
    // Timestamp
    timestamp: new Date().toISOString(),

    // Vibration — Raw
    accel_x, accel_y, accel_z,
    gyro_x, gyro_y, gyro_z,

    // Vibration — Derived Time-Domain
    accel_rms: +accel_rms.toFixed(4),
    accel_peak: +accel_peak.toFixed(4),
    accel_mean_x, accel_mean_y, accel_mean_z,
    accel_std_x, accel_std_y, accel_std_z,
    accel_kurtosis: +accel_kurtosis.toFixed(4),
    accel_skewness: +accel_skewness.toFixed(4),
    accel_crest_factor: +accel_crest_factor.toFixed(4),

    // Vibration — Derived Frequency-Domain (FFT)
    fft_1x_amplitude: +fft_1x_amplitude.toFixed(4),
    fft_2x_amplitude: +fft_2x_amplitude.toFixed(4),
    fft_3x_amplitude: +fft_3x_amplitude.toFixed(4),
    fft_bpfo: +fft_bpfo.toFixed(4),
    fft_bpfi: +fft_bpfi.toFixed(4),
    fft_bsf: +fft_bsf.toFixed(4),
    fft_ftf: +fft_ftf.toFixed(4),
    fft_dominant_freq: +fft_dominant_freq.toFixed(2),
    fft_spectral_centroid: +fft_spectral_centroid.toFixed(2),
    fft_power_ratio_low: +fft_power_ratio_low.toFixed(4),
    fft_power_ratio_mid: +fft_power_ratio_mid.toFixed(4),
    fft_power_ratio_high: +Math.max(0, fft_power_ratio_high).toFixed(4),

    // Speed
    rpm_current: +rpm_current.toFixed(1),
    rpm_mean: +rpm_mean.toFixed(1),
    rpm_std: +rpm_std.toFixed(2),
    rpm_min: +rpm_min.toFixed(1),
    rpm_max: +rpm_max.toFixed(1),
    rpm_range: +rpm_range,
    rpm_coefficient_of_variation: +rpm_coefficient_of_variation,

    // Current
    current_instant: +current_instant.toFixed(3),
    current_mean: +current_mean.toFixed(3),
    current_std: +current_std.toFixed(3),
    current_peak: +current_peak.toFixed(3),
    current_min: +current_min.toFixed(3),
    current_rms: +current_rms.toFixed(3),
    current_power_estimated: +current_power_estimated,
    current_spike_count,

    // Voltage
    voltage_instant: +voltage_instant.toFixed(2),
    voltage_mean: +voltage_mean.toFixed(2),
    voltage_std: +voltage_std.toFixed(3),
    voltage_min: +voltage_min.toFixed(2),
    voltage_sag: +voltage_sag.toFixed(3),
    voltage_ripple: +voltage_ripple.toFixed(3),

    // Temperature
    temp_current: +temp_current.toFixed(2),
    temp_mean: +temp_mean.toFixed(2),
    temp_max: +temp_max.toFixed(2),
    temp_rise_rate: +temp_rise_rate.toFixed(4),
    temp_delta_ambient: +temp_delta_ambient,
    temp_steady_state: +temp_steady_state.toFixed(2),

    // Acoustic
    sound_level_instant: +sound_level_instant.toFixed(2),
    sound_level_mean: +sound_level_mean.toFixed(2),
    sound_level_peak: +sound_level_peak.toFixed(2),
    sound_level_std: +sound_level_std.toFixed(3),
    sound_spectral_centroid: +sound_spectral_centroid.toFixed(2),
    sound_zero_crossing_rate: +sound_zero_crossing_rate.toFixed(4),

    // Multi-Sensor Derived
    power_factor: +power_factor.toFixed(4),
    mechanical_power: +mechanical_power,
    health_index: +clamp(health_index, 0, 100).toFixed(2),
    vibration_to_speed_ratio: +vibration_to_speed_ratio,
    current_to_speed_ratio: +current_to_speed_ratio,
    temp_to_current_ratio: +temp_to_current_ratio,

    // Temporal
    vibration_trend: +vibration_trend.toFixed(4),
    temperature_trend: +temperature_trend.toFixed(4),
    rpm_stability_score: +rpm_stability_score,
    fault_duration,

    // Fault Classification
    fault_label,
    fault_name: faultName,
  };
}

// ─── Serial Init ─────────────────────────────────────────────────────────────
function initSerial() {
  console.log(`Attempting to connect to serial port: ${portPath}`);

  port = new SerialPort({
    path: portPath,
    baudRate: baudRate,
    autoOpen: false,
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
      latestData = {
        timestamp: new Date().toISOString(),
        ...parsed,
        fault_name: FAULT_LABELS[parsed.fault_label] || 'UNKNOWN',
      };
      pushHistory(latestData);
      console.log('New data received:', Object.keys(latestData).length, 'fields');
    } catch (e) {
      console.error('Error parsing JSON from serial:', data);
    }
  });

  port.on('close', () => console.log('Serial port closed.'));
  port.on('error', (err) => console.error('Serial port error: ', err.message));
}

function pushHistory(snapshot) {
  historyBuffer.push(snapshot);
  if (historyBuffer.length > MAX_HISTORY) {
    historyBuffer.shift();
  }
}

function startMockData() {
  setInterval(() => {
    latestData = generateMockData();
    pushHistory(latestData);
  }, 1000);
}

// ─── Exports ─────────────────────────────────────────────────────────────────
const getLatestData = () => latestData;
const getHistory = (limit = 100) => {
  const n = Math.min(Math.max(1, limit), MAX_HISTORY);
  return historyBuffer.slice(-n);
};

module.exports = {
  initSerial,
  getLatestData,
  getHistory,
};
