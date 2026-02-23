import React, { useState, useEffect } from 'react';
import { getLatestVibrationData } from './services/api';
import Dashboard from './components/Dashboard';

function App() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getLatestVibrationData();
        setData(result);

        // Update history (keep last 60 points / 30 seconds)
        setHistory(prev => {
          const newPoint = {
            ...result,
            time: new Date().toLocaleTimeString()
          };
          const newHistory = [...prev, newPoint];
          return newHistory.slice(-60);
        });

        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Waiting for Arduino data...');
        // Keep loading state if we never got data
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 500);
    return () => clearInterval(intervalId);
  }, []);

  if (loading && !error) {
    return (
      <div className="full-screen">
        <div>
          <div className="spinner" style={{ margin: '0 auto 1.5rem' }}></div>
          <p style={{ fontSize: '0.875rem', letterSpacing: '0.05em' }}>INITIALIZING SYSTEM...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="full-screen">
        <div style={{ maxWidth: '300px' }}>
          <h2 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>CONNECTION PENDING</h2>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
      <Dashboard data={data} history={history} />
    </div>
  );
}

export default App;
