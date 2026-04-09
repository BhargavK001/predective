import { useState, useEffect } from 'react';
import { getLatestVibrationData } from './services/api';
import Dashboard from './components/Dashboard';
import { colors, typography } from './tokens';

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

        setHistory(prev => {
          const newPoint = {
            ...result,
            time: new Date().toLocaleTimeString(),
          };
          const newHistory = [...prev, newPoint];
          return newHistory.slice(-60);
        });

        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Waiting for sensor data...');
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
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{
            fontSize: typography.labelSize,
            fontWeight: typography.labelWeight,
            letterSpacing: typography.labelLetterSpacing,
            textTransform: 'uppercase',
            color: colors.textSecondary,
          }}>
            Initializing system…
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="full-screen">
        <div style={{ maxWidth: 300, textAlign: 'center' }}>
          <p style={{
            fontSize: '14px',
            fontWeight: typography.headingWeight,
            color: colors.textPrimary,
            marginBottom: 8,
          }}>
            Connection Pending
          </p>
          <p style={{
            fontSize: '13px',
            color: colors.textSecondary,
          }}>
            {error}
          </p>
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
