import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import LivePrediction from './pages/LivePrediction';
import LiveMonitoring from './pages/LiveMonitoring';
import ModelMetrics from './pages/ModelMetrics';
import PredictionHistory from './pages/PredictionHistory';
import About from './pages/About';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="monitoring" element={<LiveMonitoring />} />
          <Route path="predict" element={<LivePrediction />} />
          <Route path="metrics" element={<ModelMetrics />} />
          <Route path="history" element={<PredictionHistory />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
