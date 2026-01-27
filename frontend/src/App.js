import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Chart from 'react-apexcharts';
import './App.css';

// ================== MOCK DATA GENERATOR ==================
const generateMarketData = (count = 50) => {
  const exchanges = ['NSE', 'BSE'];
  const symbols = ['TCS', 'INFY', 'WIPRO', 'HCL', 'MINDTREE', 'RELIANCE', 'HDFC', 'ICICIBANK', 'AXISBANK', 'MARUTI', 'BAJAJFINSV', 'SUNPHARMA', 'DMART', 'NESTLEIND', 'LTTS'];
  const data = [];
  
  for (let i = 0; i < count; i++) {
    const open = Math.random() * 5000 + 100;
    const chng = (Math.random() - 0.48) * 10;
    const ltp = open * (1 + chng / 100);
    
    data.push({
      symbol: symbols[i % symbols.length] + (i > symbols.length ? i : ''),
      open: open.toFixed(2),
      high: (open * 1.05).toFixed(2),
      low: (open * 0.95).toFixed(2),
      prevClose: (open * (1 - chng / 100)).toFixed(2),
      ltp: ltp.toFixed(2),
      chng: chng.toFixed(2),
      volume: Math.floor(Math.random() * 100000000),
      value: (ltp * Math.random() * 100000000).toFixed(0),
      ca: (Math.random() * 100).toFixed(2),
      exchange: exchanges[Math.floor(Math.random() * 2)]
    });
  }
  
  return data;
};

const getTopGainersLosers = (data, type, period) => {
  let filtered = [...data];
  if (type === 'gainers') {
    filtered.sort((a, b) => parseFloat(b.chng) - parseFloat(a.chng));
  } else {
    filtered.sort((a, b) => parseFloat(a.chng) - parseFloat(b.chng));
  }
  return filtered.slice(0, 5);
};

// ================== DASHBOARD PAGE ==================
const DashboardPage = ({ darkMode, toggleDarkMode }) => {
  const [marketData] = useState(generateMarketData(50));
  const [timePeriod, setTimePeriod] = useState('Day');
  const [exchange, setExchange] = useState('All');
  const [sortBy, setSortBy] = useState('chng');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  let filteredData = marketData.filter(d => exchange === 'All' || d.exchange === exchange);
  filteredData = filteredData.filter(d => d.symbol.toLowerCase().includes(searchTerm.toLowerCase()));
  const topGainers = getTopGainersLosers(filteredData, 'gainers', timePeriod);
  const topLosers = getTopGainersLosers(filteredData, 'losers', timePeriod);
  const suggestions = filteredData.filter(d => parseFloat(d.chng) > 2).sort((a, b) => parseFloat(b.chng) - parseFloat(a.chng)).slice(0, 5);

  return (
    <div style={{...styles.consoleContainer, background: darkMode ? '#0a0e27' : '#f0f4f9', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
      <div style={styles.consoleHeader}>
        <div style={{fontSize: '24px', fontWeight: 'bold', color: darkMode ? '#00ff88' : '#667eea', textShadow: darkMode ? '0 0 10px #00ff88' : 'none'}}>
          AUTOTRADE 
        </div>
        <button onClick={toggleDarkMode} style={{...styles.themeBtnConsole, background: darkMode ? '#1a1a3e' : '#fff'}}>
          {darkMode ? '☀' : '☽'}
        </button>
      </div>

      {/* Navigation */}
      <div style={styles.consoleNav}>
        <button onClick={() => navigate('/chart/INFY')} style={styles.navBtn}>→ CHART VIEW</button>
        <button onClick={() => navigate('/portfolio')} style={styles.navBtn}>→ PORTFOLIO</button>
      </div>

      {/* Search Bar */}
      <div style={{padding: '15px', borderBottom: `1px solid ${darkMode ? '#2a2a4e' : '#ddd'}`, background: darkMode ? '#1a1a3e' : '#fff'}}>
        <input
          type="text"
          placeholder="🔍 Search stocks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 15px',
            borderRadius: '8px',
            border: `1px solid ${darkMode ? '#00ff88' : '#667eea'}`,
            background: darkMode ? '#0a0e27' : '#f9f9f9',
            color: darkMode ? '#00ff88' : '#000',
            fontSize: '14px',
            boxShadow: `0 0 10px ${darkMode ? 'rgba(0,255,136,0.3)' : 'rgba(102,126,234,0.1)'}`,
            outline: 'none'
          }}
        />
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label style={{color: darkMode ? '#00ff88' : '#667eea', fontWeight: 'bold'}}>PERIOD:</label>
          {['Day', 'Week', 'Month', 'Year'].map(p => (
            <button
              key={p}
              onClick={() => setTimePeriod(p)}
              style={{
                ...styles.filterBtn,
                background: timePeriod === p ? (darkMode ? '#00ff88' : '#667eea') : (darkMode ? '#1a1a3e' : '#e8eef5'),
                color: timePeriod === p ? (darkMode ? '#0a0e27' : '#fff') : (darkMode ? '#00ff88' : '#667eea'),
                boxShadow: timePeriod === p ? `0 0 15px ${darkMode ? '#00ff88' : '#667eea'}` : 'none'
              }}
            >
              {p}
            </button>
          ))}
        </div>

        <div style={styles.filterGroup}>
          <label style={{color: darkMode ? '#00ffff' : '#667eea', fontWeight: 'bold'}}>EXCHANGE:</label>
          {['All', 'NSE', 'BSE'].map(ex => (
            <button
              key={ex}
              onClick={() => setExchange(ex)}
              style={{
                ...styles.filterBtn,
                background: exchange === ex ? (darkMode ? '#00ffff' : '#667eea') : (darkMode ? '#1a1a3e' : '#e8eef5'),
                color: exchange === ex ? (darkMode ? '#0a0e27' : '#fff') : (darkMode ? '#00ffff' : '#667eea'),
                boxShadow: exchange === ex ? `0 0 15px ${darkMode ? '#00ffff' : '#667eea'}` : 'none'
              }}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '15px'}}>
        {/* Top Gainers & Losers */}
        <div style={styles.gainersLosersContainer}>
          <div style={styles.gainersBox}>
            <div style={{...styles.sectionTitle, color: darkMode ? '#00ff88' : '#10b981', textShadow: darkMode ? '0 0 10px #00ff88' : 'none'}}>
              TOP GAINERS
            </div>
            {topGainers.map((stock, idx) => (
              <div key={idx} style={{...styles.gainerCard, borderLeft: `3px solid #10b981`}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{fontWeight: 'bold', color: darkMode ? '#fff' : '#000'}}>{stock.symbol}</span>
                  <span style={{color: '#10b981', fontWeight: 'bold', fontSize: '16px'}}>↑ {stock.chng}%</span>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.losersBox}>
            <div style={{...styles.sectionTitle, color: darkMode ? '#ff4444' : '#ef4444', textShadow: darkMode ? '0 0 10px #ff4444' : 'none'}}>
              TOP LOSERS
            </div>
            {topLosers.map((stock, idx) => (
              <div key={idx} style={{...styles.loserCard, borderLeft: `3px solid #ef4444`}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{fontWeight: 'bold', color: darkMode ? '#fff' : '#000'}}>{stock.symbol}</span>
                  <span style={{color: '#ef4444', fontWeight: 'bold', fontSize: '16px'}}>↓ {stock.chng}%</span>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.suggestionsBox}>
            <div style={{...styles.sectionTitle, color: darkMode ? '#ffff00' : '#f59e0b', textShadow: darkMode ? '0 0 10px #ffff00' : 'none'}}>
              BUY SUGGESTIONS
            </div>
            {suggestions.map((stock, idx) => (
              <div key={idx} style={{...styles.suggestionCard, borderLeft: `3px solid #f59e0b`, cursor: 'pointer'}} onClick={() => navigate(`/chart/${stock.symbol}`)}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{fontWeight: 'bold', color: darkMode ? '#fff' : '#000'}}>{stock.symbol}</span>
                  <span style={{color: '#f59e0b', fontWeight: 'bold'}}>+{stock.chng}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div style={styles.tableContainer}>
          <div style={{...styles.sectionTitle, color: darkMode ? '#00ffff' : '#667eea', marginBottom: '15px', textShadow: darkMode ? '0 0 10px #00ffff' : 'none'}}>
            MARKET DATA [{filteredData.length} STOCKS]
          </div>
          
          <div style={styles.tableScroll}>
            <table style={styles.dataTable}>
              <thead>
                <tr style={{borderBottom: `2px solid ${darkMode ? '#00ffff' : '#667eea'}`, background: darkMode ? '#1a1a3e' : '#f0f4f9'}}>
                  <th style={styles.tableHeader}>SYMBOL</th>
                  <th style={styles.tableHeader}>OPEN</th>
                  <th style={styles.tableHeader}>HIGH</th>
                  <th style={styles.tableHeader}>LOW</th>
                  <th style={styles.tableHeader}>PREV CLOSE</th>
                  <th style={styles.tableHeader}>LTP</th>
                  <th style={styles.tableHeader}>%CHG</th>
                  <th style={styles.tableHeader}>VOLUME</th>
                  <th style={styles.tableHeader}>VALUE</th>
                  <th style={styles.tableHeader}>CA</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((stock, idx) => (
                  <tr
                    key={idx}
                    style={{
                      ...styles.tableRow,
                      borderBottom: `1px solid ${darkMode ? '#2a2a4e' : '#ddd'}`,
                      background: idx % 2 === 0 ? (darkMode ? '#0f1229' : '#fafbfc') : (darkMode ? '#1a1a3e' : '#fff'),
                      animation: `fadeIn 0.5s ease ${idx * 0.05}s both`
                    }}
                    onClick={() => navigate(`/chart/${stock.symbol}`)}
                  >
                    <td style={{...styles.tableCell, fontWeight: 'bold', color: darkMode ? '#00ffff' : '#667eea'}}>{stock.symbol}</td>
                    <td style={styles.tableCell}>{stock.open}</td>
                    <td style={{...styles.tableCell, color: '#10b981'}}>{stock.high}</td>
                    <td style={{...styles.tableCell, color: '#ef4444'}}>{stock.low}</td>
                    <td style={styles.tableCell}>{stock.prevClose}</td>
                    <td style={{...styles.tableCell, fontWeight: 'bold'}}>{stock.ltp}</td>
                    <td style={{
                      ...styles.tableCell,
                      color: parseFloat(stock.chng) > 0 ? '#10b981' : '#ef4444',
                      fontWeight: 'bold'
                    }}>
                      {parseFloat(stock.chng) > 0 ? '↑' : '↓'} {stock.chng}
                    </td>
                    <td style={styles.tableCell}>{(stock.volume / 1000000).toFixed(2)}M</td>
                    <td style={styles.tableCell}>{(stock.value / 1000000000).toFixed(2)}B</td>
                    <td style={styles.tableCell}>{stock.ca}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================== LANDING PAGE ==================
const LandingPage = ({ darkMode, toggleDarkMode }) => {
  const [symbol, setSymbol] = useState('');
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];
  });
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (symbol.trim()) {
      const sym = symbol.toUpperCase();
      if (!watchlist.includes(sym)) {
        const newList = [...watchlist, sym];
        setWatchlist(newList);
        localStorage.setItem('watchlist', JSON.stringify(newList));
      }
      navigate(`/chart/${sym}`);
    }
  };

  const removeFromWatchlist = (sym) => {
    const newList = watchlist.filter(s => s !== sym);
    setWatchlist(newList);
    localStorage.setItem('watchlist', JSON.stringify(newList));
  };

  return (
    <div style={{...styles.landingContainer, background: darkMode ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      <button onClick={toggleDarkMode} style={styles.darkModeBtn}>
        {darkMode ? '☀' : '☽'}
      </button>

      <a href="#portfolio" onClick={(e) => { e.preventDefault(); navigate('/portfolio'); }} style={{position: 'absolute', top: '20px', left: '20px', color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px', background: 'rgba(255,255,255,0.2)', padding: '8px 15px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'all 0.3s ease'}}>
        ▦ Portfolio
      </a>
      
      <div style={{...styles.logo, color: '#fff', fontSize: '48px', marginBottom: '10px'}}>⚡ AutoTrade</div>
      <p style={{color: 'rgba(255,255,255,0.8)', fontSize: '18px', marginTop: '5px'}}>AI-Powered Stock Trading Signals</p>
      
      <div style={styles.centerContent}>
        <h1 style={{color: '#fff', fontSize: '42px', marginBottom: '30px'}}>View Live Movements</h1>
        <form onSubmit={handleSearch} style={styles.searchBox}>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Search stocks (e.g. AAPL)..."
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchButton}>Search</button>
        </form>
        
        <div style={{marginTop: '60px', textAlign: 'left'}}>
          <h3 style={{color: '#fff', marginBottom: '15px'}}>★ Your Watchlist</h3>
          <div style={styles.watchlistGrid}>
            {watchlist.map(sym => (
              <div key={sym} style={styles.watchlistCard}>
                <span style={{fontSize: '16px', fontWeight: 'bold', color: '#667eea'}}>{sym}</span>
                <button onClick={() => removeFromWatchlist(sym)} style={styles.removeBtn}>✕</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{marginTop: '50px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', color: '#fff'}}>
          <div style={styles.featureBox}>
            <div style={{fontSize: '32px'}}>◆</div>
            <h4>AI Predictions</h4>
            <p>Neural networks for price forecasting</p>
          </div>
          <div style={styles.featureBox}>
            <div style={{fontSize: '32px'}}>▲</div>
            <h4>Real-Time Data</h4>
            <p>Live market candlestick charts</p>
          </div>
          <div style={styles.featureBox}>
            <div style={{fontSize: '32px'}}>◉</div>
            <h4>Trading Signals</h4>
            <p>Buy/Sell alerts with confidence</p>
          </div>
          <div style={styles.featureBox}>
            <div style={{fontSize: '32px'}}>▦</div>
            <h4>Portfolio Tracking</h4>
            <p>Monitor multiple stocks at once</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================== CHART PAGE ==================
const ChartPage = ({ darkMode, toggleDarkMode }) => {
  const { symbol } = useParams();
  const [data, setData] = useState(null);
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshCountdown, setRefreshCountdown] = useState(3600);
  const [timePeriod, setTimePeriod] = useState('1h');
  const navigate = useNavigate();
  
  const timePeriods = ['1m', '2m', '5m', '10m', '15m', '20m', '30m', '1h', '2h', '5h', '1d'];
  const timePeriodLabels = ['1min', '2min', '5min', '10min', '15min', '20min', '30min', '1hr', '2hr', '5hr', '1day'];
  
  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://autotrade-t5g6.onrender.com/api/predict/${symbol}`);
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('API Error:', err);
        setError('Using mock data (API unavailable). Try checking backend is running on port 8000.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 3600000); 
    return () => clearInterval(interval);
  }, [symbol]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown(prev => prev > 0 ? prev - 1 : 3600);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Chart Configuration
  const chartOptions = {
    chart: {
      type: 'candlestick',
      background: darkMode ? '#1e1e1e' : '#fff',
      toolbar: { show: true, tools: { download: true, selection: true, zoom: true, zoomin: true, zoomout: true, pan: true, reset: true } }
    },
    title: {
      text: `${symbol} - Price Chart`,
      style: { color: darkMode ? '#fff' : '#000' }
    },
    xaxis: {
      type: 'datetime',
      labels: { style: { colors: darkMode ? '#aaa' : '#000' } }
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: { style: { colors: darkMode ? '#aaa' : '#000' } }
    },
    plotOptions: {
      candlestick: {
        colors: { upward: '#10b981', downward: '#ef4444' }
      }
    },
    grid: { borderColor: darkMode ? '#444' : '#ddd' }
  };

  const toggleWatchlist = () => {
    let newList = [...watchlist];
    if (newList.includes(symbol)) {
      newList = newList.filter(s => s !== symbol);
    } else {
      newList.push(symbol);
    }
    setWatchlist(newList);
    localStorage.setItem('watchlist', JSON.stringify(newList));
  };

  return (
    <div style={{...styles.chartContainer, background: darkMode ? '#0f0f0f' : '#f8f9fa'}}>
      {/* Header */}
      <div style={{...styles.chartHeader, borderBottom: `1px solid ${darkMode ? '#333' : '#eee'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <a href="/" style={{ textDecoration: 'none', color: darkMode ? '#667eea' : '#007bff', fontSize: '18px', fontWeight: 'bold', transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.color = '#00ff88'} onMouseLeave={(e) => e.target.style.color = darkMode ? '#667eea' : '#007bff'}>← Home</a>
          <h1 style={{margin: '0', color: darkMode ? '#fff' : '#000', fontSize: '28px'}}>{symbol}</h1>
          <button onClick={toggleWatchlist} style={{...styles.favBtn, background: watchlist.includes(symbol) ? '#f59e0b' : 'transparent', color: watchlist.includes(symbol) ? '#000' : (darkMode ? '#aaa' : '#666'), border: `1px solid ${watchlist.includes(symbol) ? '#f59e0b' : (darkMode ? '#aaa' : '#ccc')}`, padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.3s ease'}}>
            {watchlist.includes(symbol) ? '★' : '☆'} {watchlist.includes(symbol) ? 'Remove' : 'Add'}
          </button>
        </div>
        <button onClick={toggleDarkMode} style={{...styles.darkModeBtn, padding: '10px 15px', fontSize: '20px', border: `1px solid ${darkMode ? '#00ffff' : '#ddd'}`, borderRadius: '8px', background: darkMode ? '#1a1a3e' : '#fff', cursor: 'pointer', transition: 'all 0.3s ease'}}>
          {darkMode ? '☀' : '☽'}
        </button>
      </div>

      {/* Time Period Selector */}
      <div style={{padding: '12px 20px', borderBottom: `1px solid ${darkMode ? '#2a2a4e' : '#ddd'}`, background: darkMode ? '#1a1a3e' : '#fff', overflowX: 'auto'}}>
        <div style={{display: 'flex', gap: '8px', alignItems: 'center', minWidth: 'min-content'}}>
          <label style={{color: darkMode ? '#00ff88' : '#667eea', fontWeight: 'bold', whiteSpace: 'nowrap'}}>INTERVAL:</label>
          {timePeriods.map((period, idx) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: timePeriod === period ? `2px solid ${darkMode ? '#00ff88' : '#667eea'}` : `1px solid ${darkMode ? '#2a2a4e' : '#ddd'}`,
                background: timePeriod === period ? (darkMode ? '#1a1a3e' : '#e3f2fd') : 'transparent',
                color: timePeriod === period ? (darkMode ? '#00ff88' : '#667eea') : (darkMode ? '#aaa' : '#666'),
                fontSize: '12px',
                fontWeight: timePeriod === period ? 'bold' : 'normal',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: timePeriod === period ? `0 0 10px ${darkMode ? 'rgba(0,255,136,0.3)' : 'rgba(102,126,234,0.2)'}` : 'none'
              }}
            >
              {timePeriodLabels[idx]}
            </button>
          ))}
        </div>
      </div>

      <div style={{display: 'flex', gap: '20px', padding: '20px', flex: 1, flexDirection: window.innerWidth < 1024 ? 'column' : 'row', minHeight: '0'}}>
        
        {/* Chart Area */}
        <div style={{flex: window.innerWidth < 1024 ? '1' : '3', display: 'flex', flexDirection: 'column', minHeight: window.innerWidth < 1024 ? '400px' : '0', minWidth: '0'}}>
          <div style={{...styles.chartBox, background: darkMode ? '#1e1e1e' : 'white', borderColor: darkMode ? '#333' : '#ddd', height: '100%', minHeight: window.innerWidth < 1024 ? '400px' : 'calc(100vh - 200px)', position: 'relative'}}>
            {loading ? (
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: darkMode ? '#aaa' : '#666'}}>
                ⧖ Loading price data...
              </div>
            ) : error ? (
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#ef4444'}}>
                ⚠ {error}
              </div>
            ) : data ? (
              <div style={{width: '100%', height: '100%'}}>
                <div style={{fontSize: '12px', color: darkMode ? '#aaa' : '#666', marginBottom: '8px', textAlign: 'center'}}>
                  ⏳ Data aggregated to {timePeriodLabels[timePeriods.indexOf(timePeriod)]} intervals
                </div>
                <Chart 
                  options={{...chartOptions, subtitle: { text: `Interval: ${timePeriodLabels[timePeriods.indexOf(timePeriod)]}` }}} 
                  series={[{ data: data.chart_data.slice(0, Math.max(10, Math.floor(data.chart_data.length / (11 - timePeriods.indexOf(timePeriod))))) }]} 
                  type="candlestick" 
                  height="100%" 
                  width="100%"
                />
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Panel */}
        <div style={{flex: window.innerWidth < 1024 ? '1' : '1', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: window.innerWidth < 1024 ? 'auto' : 'calc(100vh - 200px)', minWidth: window.innerWidth < 1024 ? '0' : '320px'}}>
          
          {/* Signal Card */}
          {data && (
            <div style={{...styles.signalCard, background: darkMode ? '#1e1e2e' : '#fff', borderColor: darkMode ? '#333' : '#ddd', borderLeft: `4px solid ${data.direction === 'BUY' ? '#10b981' : '#ef4444'}`}}>
              <h3 style={{margin: '0 0 15px 0', color: darkMode ? '#fff' : '#000'}}>◉ Trading Signal</h3>
              
              <div style={styles.signalRow}>
                <span style={{color: darkMode ? '#aaa' : '#666'}}>Direction:</span>
                <span style={{fontSize: '18px', fontWeight: 'bold', color: data.direction === 'BUY' ? '#10b981' : '#ef4444', textTransform: 'uppercase'}}>
                  {data.direction === 'BUY' ? '▲' : '▼'} {data.direction}
                </span>
              </div>

              <div style={styles.signalRow}>
                <span style={{color: darkMode ? '#aaa' : '#666'}}>Current Price:</span>
                <span style={{fontSize: '18px', fontWeight: 'bold', color: darkMode ? '#fff' : '#000'}}>₹{data.current_price.toFixed(2)}</span>
              </div>

              <div style={styles.signalRow}>
                <span style={{color: darkMode ? '#aaa' : '#666'}}>Predicted Price:</span>
                <span style={{fontSize: '18px', fontWeight: 'bold', color: darkMode ? '#fff' : '#000'}}>₹{data.predicted_price.toFixed(2)}</span>
              </div>

              <div style={{...styles.signalRow, paddingTop: '10px', borderTop: `1px solid ${darkMode ? '#333' : '#eee'}`}}>
                <span style={{color: darkMode ? '#aaa' : '#666'}}>Expected Move:</span>
                <span style={{fontSize: '18px', fontWeight: 'bold', color: '#667eea'}}>{data.move_pct.toFixed(3)}%</span>
              </div>

              <div style={styles.confidenceBar}>
                <span style={{color: darkMode ? '#aaa' : '#666', fontSize: '12px'}}>Confidence</span>
                <div style={{...styles.barContainer, background: darkMode ? '#333' : '#eee'}}>
                  <div style={{...styles.barFill, width: `${Math.min(data.confidence, 100)}%`, background: data.confidence >= 70 ? '#10b981' : data.confidence >= 50 ? '#f59e0b' : '#ef4444'}}></div>
                </div>
                <span style={{fontWeight: 'bold', color: darkMode ? '#fff' : '#000'}}>{data.confidence.toFixed(1)}%</span>
              </div>
            </div>
          )}

          {/* Status Card */}
          {data && (
            <div style={{...styles.statusCard, background: data.status_message.includes('FIRE') ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}}>
              <h3 style={{margin: '0 0 10px 0', color: '#fff'}}>● Status</h3>
              <p style={{margin: '0', color: '#fff', fontSize: '16px', fontWeight: 'bold'}}>{data.status_message}</p>
            </div>
          )}

          {/* Info Card */}
          <div style={{...styles.infoCard, background: darkMode ? '#1e1e2e' : '#f0f9ff', color: darkMode ? '#aaa' : '#0c4a6e', border: `1px solid ${darkMode ? '#333' : '#e0f2fe'}`}}>
            <p><strong>Last Updated:</strong> {data?.last_updated || 'N/A'}</p>
            <p><strong>Data Source:</strong> Real-time market data (Yahoo Finance)</p>
            <p><strong>Model Type:</strong> LSTM Neural Network</p>
            <p style={{fontSize: '12px', marginTop: '10px'}}><em>⚠ For educational purposes. Not financial advice.</em></p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================== PORTFOLIO PAGE ==================
const PortfolioPage = ({ darkMode, toggleDarkMode }) => {
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('watchlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('symbol');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const data = [];
        for (const symbol of watchlist) {
          try {
            const response = await axios.get(`https://autotrade-t5g6.onrender.com/api/predict/${symbol}`);
            data.push(response.data);
          } catch (err) {
            console.error(`Failed to fetch ${symbol}:`, err);
          }
        }
        setPortfolioData(data);
      } finally {
        setLoading(false);
      }
    };
    
    if (watchlist.length > 0) {
      fetchAllData();
    } else {
      setPortfolioData([]);
      setLoading(false);
    }
  }, [watchlist]);

  const sortedData = () => {
    const data = [...portfolioData];
    switch(sortBy) {
      case 'symbol':
        return data.sort((a, b) => a.symbol.localeCompare(b.symbol));
      case 'confidence':
        return data.sort((a, b) => b.confidence - a.confidence);
      case 'move':
        return data.sort((a, b) => b.move_pct - a.move_pct);
      case 'direction':
        return data.sort((a, b) => {
          if (a.direction === b.direction) return 0;
          return a.direction === 'BUY' ? -1 : 1;
        });
      default:
        return data;
    }
  };

  const buySignals = portfolioData.filter(d => d.direction === 'BUY').length;
  const sellSignals = portfolioData.filter(d => d.direction === 'SELL').length;
  const avgConfidence = portfolioData.length > 0 
    ? (portfolioData.reduce((sum, d) => sum + d.confidence, 0) / portfolioData.length).toFixed(1)
    : 0;

  return (
    <div style={{...styles.portfolioContainer, background: darkMode ? '#0f0f0f' : '#f8f9fa'}}>
      {/* Header */}
      <div style={{...styles.portfolioHeader, borderBottom: `1px solid ${darkMode ? '#333' : '#eee'}`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
          <a href="/" style={{ textDecoration: 'none', color: darkMode ? '#667eea' : '#007bff', fontSize: '18px', fontWeight: 'bold' }}>← Home</a>
          <h1 style={{margin: '0', color: darkMode ? '#fff' : '#000'}}>▦ Portfolio</h1>
        </div>
        <button onClick={toggleDarkMode} style={styles.darkModeBtn}>
          {darkMode ? '☀' : '☽'}
        </button>
      </div>

      <div style={{padding: '20px', overflowY: 'auto', flex: 1}}>
        
        {/* Summary Stats */}
        {watchlist.length > 0 && (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px'}}>
            <div style={{...styles.statBox, background: darkMode ? '#1e1e2e' : '#fff', borderLeft: '4px solid #667eea'}}>
              <p style={{margin: '0 0 8px 0', color: darkMode ? '#aaa' : '#666'}}>Total Stocks</p>
              <h3 style={{margin: '0', fontSize: '28px', color: darkMode ? '#fff' : '#000'}}>{watchlist.length}</h3>
            </div>
            <div style={{...styles.statBox, background: darkMode ? '#1e1e2e' : '#fff', borderLeft: '4px solid #10b981'}}>
              <p style={{margin: '0 0 8px 0', color: darkMode ? '#aaa' : '#666'}}>Buy Signals</p>
              <h3 style={{margin: '0', fontSize: '28px', color: '#10b981'}}>{buySignals}</h3>
            </div>
            <div style={{...styles.statBox, background: darkMode ? '#1e1e2e' : '#fff', borderLeft: '4px solid #ef4444'}}>
              <p style={{margin: '0 0 8px 0', color: darkMode ? '#aaa' : '#666'}}>Sell Signals</p>
              <h3 style={{margin: '0', fontSize: '28px', color: '#ef4444'}}>{sellSignals}</h3>
            </div>
            <div style={{...styles.statBox, background: darkMode ? '#1e1e2e' : '#fff', borderLeft: '4px solid #f59e0b'}}>
              <p style={{margin: '0 0 8px 0', color: darkMode ? '#aaa' : '#666'}}>Avg Confidence</p>
              <h3 style={{margin: '0', fontSize: '28px', color: '#f59e0b'}}>{avgConfidence}%</h3>
            </div>
          </div>
        )}

        {/* Sort Controls */}
        <div style={{marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          <label style={{color: darkMode ? '#aaa' : '#666'}}>Sort by:</label>
          {['symbol', 'confidence', 'move', 'direction'].map(option => (
            <button 
              key={option}
              onClick={() => setSortBy(option)}
              style={{
                padding: '8px 15px',
                borderRadius: '20px',
                border: sortBy === option ? '2px solid #667eea' : `1px solid ${darkMode ? '#444' : '#ddd'}`,
                background: sortBy === option ? '#667eea' : (darkMode ? '#1e1e2e' : '#fff'),
                color: sortBy === option ? '#fff' : (darkMode ? '#aaa' : '#666'),
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {/* Portfolio Table */}
        {loading ? (
          <div style={{textAlign: 'center', padding: '40px', color: darkMode ? '#aaa' : '#666'}}>
            ⏳ Loading portfolio data...
          </div>
        ) : watchlist.length === 0 ? (
          <div style={{textAlign: 'center', padding: '40px', color: darkMode ? '#aaa' : '#666'}}>
            <p style={{fontSize: '18px', fontWeight: 'bold'}}>📭 Your watchlist is empty</p>
            <p>Search for stocks on the home page to add them to your portfolio</p>
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{borderBottom: `2px solid ${darkMode ? '#333' : '#ddd'}`}}>
                  <th style={{padding: '12px', textAlign: 'left', color: darkMode ? '#aaa' : '#666', fontWeight: 'bold'}}>Symbol</th>
                  <th style={{padding: '12px', textAlign: 'right', color: darkMode ? '#aaa' : '#666', fontWeight: 'bold'}}>Current</th>
                  <th style={{padding: '12px', textAlign: 'right', color: darkMode ? '#aaa' : '#666', fontWeight: 'bold'}}>Predicted</th>
                  <th style={{padding: '12px', textAlign: 'right', color: darkMode ? '#aaa' : '#666', fontWeight: 'bold'}}>Move %</th>
                  <th style={{padding: '12px', textAlign: 'center', color: darkMode ? '#aaa' : '#666', fontWeight: 'bold'}}>Signal</th>
                  <th style={{padding: '12px', textAlign: 'right', color: darkMode ? '#aaa' : '#666', fontWeight: 'bold'}}>Confidence</th>
                  <th style={{padding: '12px', textAlign: 'center', color: darkMode ? '#aaa' : '#666', fontWeight: 'bold'}}>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedData().map((stock, idx) => (
                  <tr key={idx} style={{borderBottom: `1px solid ${darkMode ? '#222' : '#eee'}`, ':hover': {background: darkMode ? '#1a1a2e' : '#f8f9fa'}}}>
                    <td style={{padding: '12px', fontWeight: 'bold', color: darkMode ? '#fff' : '#000'}}>{stock.symbol}</td>
                    <td style={{padding: '12px', textAlign: 'right', color: darkMode ? '#aaa' : '#666'}}>${stock.current_price.toFixed(2)}</td>
                    <td style={{padding: '12px', textAlign: 'right', color: darkMode ? '#aaa' : '#666'}}>${stock.predicted_price.toFixed(2)}</td>
                    <td style={{padding: '12px', textAlign: 'right', fontWeight: 'bold', color: stock.move_pct > 0.5 ? '#10b981' : stock.move_pct > 0.3 ? '#667eea' : '#f59e0b'}}>
                      {stock.move_pct.toFixed(3)}%
                    </td>
                    <td style={{padding: '12px', textAlign: 'center'}}>
                      <span style={{padding: '4px 12px', borderRadius: '20px', background: stock.direction === 'BUY' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: stock.direction === 'BUY' ? '#10b981' : '#ef4444', fontWeight: 'bold', fontSize: '12px'}}>
                        {stock.direction === 'BUY' ? '⬆️' : '⬇️'} {stock.direction}
                      </span>
                    </td>
                    <td style={{padding: '12px', textAlign: 'right', fontWeight: 'bold', color: stock.confidence >= 70 ? '#10b981' : stock.confidence >= 50 ? '#f59e0b' : '#ef4444'}}>
                      {stock.confidence.toFixed(1)}%
                    </td>
                    <td style={{padding: '12px', textAlign: 'center'}}>
                      <button onClick={() => window.location.hash = `/chart/${stock.symbol}`} style={{padding: '6px 12px', borderRadius: '6px', background: '#667eea', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', transition: 'all 0.3s ease'}}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ================== MAIN APP ==================
function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
        <Route path="/chart/:symbol" element={<ChartPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
        <Route path="/portfolio" element={<PortfolioPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
      </Routes>
    </Router>
  );
}

// ================== STYLES ==================
const styles = {
  // Console Dashboard Styles
  consoleContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    fontFamily: '"Courier New", monospace',
    overflow: 'hidden'
  },
  consoleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '2px solid',
    borderImage: 'linear-gradient(90deg, #00ff88, #00ffff) 1',
  },
  themeBtnConsole: {
    border: '2px solid #00ffff',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
  },
  consoleNav: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    animation: 'slideInRight 0.5s ease'
  },
  navBtn: {
    background: 'transparent',
    border: '2px solid #00ffff',
    color: '#00ffff',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: '"Courier New", monospace',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
    ':hover': {
      background: '#00ffff',
      color: '#0a0e27'
    }
  },
  filterBar: {
    display: 'flex',
    gap: '30px',
    marginBottom: '20px',
    padding: '15px',
    background: 'rgba(0, 255, 255, 0.1)',
    borderRadius: '8px',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    animation: 'fadeIn 0.5s ease'
  },
  filterGroup: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  filterBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontFamily: '"Courier New", monospace',
    transition: 'all 0.3s ease',
    fontSize: '13px'
  },
  gainersLosersContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
    animation: 'fadeIn 0.5s ease 0.1s both'
  },
  gainersBox: {
    padding: '15px',
    borderRadius: '8px',
    border: '2px solid #10b981',
    boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
  },
  losersBox: {
    padding: '15px',
    borderRadius: '8px',
    border: '2px solid #ef4444',
    boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)'
  },
  suggestionsBox: {
    padding: '15px',
    borderRadius: '8px',
    border: '2px solid #f59e0b',
    boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '12px',
    paddingBottom: '10px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
  },
  gainerCard: {
    padding: '10px',
    marginBottom: '8px',
    borderRadius: '4px',
    fontSize: '13px',
    transition: 'all 0.3s ease'
  },
  loserCard: {
    padding: '10px',
    marginBottom: '8px',
    borderRadius: '4px',
    fontSize: '13px',
    transition: 'all 0.3s ease'
  },
  suggestionCard: {
    padding: '10px',
    marginBottom: '8px',
    borderRadius: '4px',
    fontSize: '13px',
    transition: 'all 0.3s ease'
  },
  tableContainer: {
    flex: 1,
    borderRadius: '8px',
    border: '2px solid #00ffff',
    padding: '15px',
    boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
    animation: 'fadeIn 0.5s ease 0.2s both'
  },
  tableScroll: {
    overflowX: 'auto',
    height: '100%',
    borderRadius: '6px'
  },
  dataTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: '"Courier New", monospace',
    fontSize: '12px'
  },
  tableHeader: {
    padding: '12px 8px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#00ffff',
    whiteSpace: 'nowrap'
  },
  tableRow: {
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  tableCell: {
    padding: '10px 8px',
    textAlign: 'left'
  },

  landingContainer: {
    height: '100vh', 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '20px',
    position: 'relative',
    overflow: 'auto'
  },
  darkModeBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    fontSize: '24px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    ':hover': {
      background: 'rgba(255,255,255,0.3)'
    }
  },
  logo: { 
    fontSize: '48px', 
    fontWeight: 'bold', 
    marginBottom: '10px',
    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
  },
  centerContent: { 
    textAlign: 'center',
    width: '100%',
    maxWidth: '1000px'
  },
  searchBox: {
    display: 'flex', 
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    borderRadius: '50px', 
    background: 'rgba(255,255,255,0.95)', 
    padding: '8px', 
    marginTop: '20px',
    backdropFilter: 'blur(10px)'
  },
  searchInput: { 
    flex: 1, 
    border: 'none', 
    padding: '15px 25px', 
    fontSize: '16px', 
    outline: 'none',
    background: 'transparent'
  },
  searchButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    color: 'white', 
    border: 'none',
    padding: '12px 35px', 
    fontSize: '16px', 
    fontWeight: 'bold',
    borderRadius: '40px', 
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
  },
  watchlistGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '10px',
    marginTop: '15px',
    maxWidth: '600px'
  },
  watchlistCard: {
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '10px',
    padding: '10px 15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    ':hover': {
      background: 'rgba(255,255,255,0.25)'
    }
  },
  removeBtn: {
    background: 'rgba(255,0,0,0.3)',
    border: 'none',
    color: '#fff',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },
  featureBox: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '15px',
    padding: '25px',
    textAlign: 'center',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    ':hover': {
      background: 'rgba(255,255,255,0.15)',
      transform: 'translateY(-5px)'
    }
  },
  
  // Chart Page Styles
  chartContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    width: '100%'
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    flexShrink: 0,
    flexWrap: 'wrap',
    gap: '10px'
  },
  chartBox: {
    border: '1px solid #ddd',
    borderRadius: '12px',
    padding: '10px',
    width: '100%',
    overflow: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  signalCard: {
    border: '1px solid #ddd',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  },
  signalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    alignItems: 'center'
  },
  confidenceBar: {
    marginTop: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  barContainer: {
    flex: 1,
    height: '8px',
    borderRadius: '10px',
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.5s ease'
  },
  statusCard: {
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    textAlign: 'center'
  },
  infoCard: {
    borderRadius: '12px',
    padding: '15px',
    fontSize: '13px',
    lineHeight: '1.8'
  },
  favBtn: {
    border: '2px solid',
    background: 'transparent',
    borderRadius: '20px',
    padding: '8px 15px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  },
  refreshBadge: {
    padding: '8px 15px',
    borderRadius: '20px',
    fontSize: '13px',
    border: '1px solid',
    fontWeight: 'bold'
  },
  header: {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: '20px', 
    paddingBottom: '10px'
  },
  terminalCard: {
    background: '#1e1e1e', 
    color: '#e0e0e0', 
    padding: '20px',
    borderRadius: '10px', 
    height: '100%', 
    fontFamily: 'monospace',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
  },
  terminalText: {
    lineHeight: '1.8', 
    fontSize: '14px', 
    whiteSpace: 'pre-wrap'
  },

  // Portfolio Page Styles
  portfolioContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  portfolioHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    flexShrink: 0
  },
  statBox: {
    border: '1px solid #ddd',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease'
  }
};

export default App;
