import React, { useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import './App.css'; // Assume basic styling

function App() {
  const [symbol, setSymbol] = useState('AAPL');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    setData(null);
    try {
      // Call the Python backend
      const response = await axios.get(`http://localhost:8000/api/predict/${symbol}`);
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch data. Check the symbol or backend.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 AutoTrade Dashboard</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          value={symbol} 
          onChange={(e) => setSymbol(e.target.value)} 
          placeholder="Enter Symbol (e.g. AAPL)" 
          style={{ padding: '10px', fontSize: '16px', marginRight: '10px' }}
        />
        <button onClick={fetchData} disabled={loading} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          {loading ? 'Training Model & Analyzing...' : 'Analyze'}
        </button>
      </div>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      {data && (
        <div className="dashboard-grid">
          {/* VISUAL INDICATORS */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <IndicatorCard title="Current Price" value={`$${data.current_price.toFixed(2)}`} />
            <IndicatorCard 
              title="Predicted Price" 
              value={`$${data.predicted_price.toFixed(2)}`} 
              color={data.direction === 'BUY' ? 'green' : 'red'} 
            />
            <IndicatorCard 
              title="Signal" 
              value={data.direction} 
              sub={data.is_strong_signal ? "🔥 STRONG" : "⏳ WEAK"}
              color={data.direction === 'BUY' ? 'green' : 'red'} 
            />
            <IndicatorCard title="Confidence" value={`${data.confidence.toFixed(2)}%`} />
          </div>

          {/* CHARTS - FIXED SIZE TO PREVENT CRASH */}
          <div style={{ marginBottom: '40px' }}>
            <h3>Price vs SMA (Last 100 mins)</h3>
            
            <LineChart width={800} height={400} data={data.chart_data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={false} />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="price" stroke="#8884d8" dot={false} name="Close Price" />
              <Line type="monotone" dataKey="sma" stroke="#ff7300" dot={false} name="SMA 20" />
            </LineChart>
          </div>

          <div>
            <h3>RSI Indicator</h3>
            
            <LineChart width={800} height={300} data={data.chart_data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={false} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <ReferenceLine y={70} stroke="red" strokeDasharray="3 3" />
              <ReferenceLine y={30} stroke="green" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="rsi" stroke="#82ca9d" dot={false} />
            </LineChart>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Helper Component for the visual cards
const IndicatorCard = ({ title, value, sub, color = 'black' }) => (
  <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', minWidth: '150px', textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
    <div style={{ color: '#666', marginBottom: '5px' }}>{title}</div>
    <div style={{ fontSize: '24px', fontWeight: 'bold', color: color }}>{value}</div>
    {sub && <div style={{ fontSize: '12px', marginTop: '5px', fontWeight: 'bold' }}>{sub}</div>}
  </div>
);

export default App;