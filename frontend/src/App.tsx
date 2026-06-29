import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Droplets, 
  Sun, 
  Wind, 
  Settings, 
  Play, 
  AlertTriangle, 
  Activity,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import FarmScene from './components/FarmScene';
import './index.css';

const App = () => {
  const [simulationActive, setSimulationActive] = useState(false);
  const [yieldData, setYieldData] = useState<any[]>([]);
  const [liveData, setLiveData] = useState<any>(null);
  const [params, setParams] = useState({
    crop: 'Sugarcane',
    rainfall: 0,
    fertilizer: 0,
    area: 5,
    seedCost: 2000,
    fertCost: 3000,
    location: { lat: 20.0112, lon: 73.7902 }
  });

  useEffect(() => {
    // Attempt Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setParams(prev => ({
          ...prev,
          location: { lat: position.coords.latitude, lon: position.coords.longitude }
        }));
      });
    }
  }, []);

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const query = `lat=${params.location.lat}&lon=${params.location.lon}&area=${params.area}&seed_cost=${params.seedCost}&fert_cost=${params.fertCost}`;
        const res = await fetch(`http://localhost:8000/farms/farm-001/live-data?${query}`);
        const data = await res.json();
        setLiveData(data);
      } catch (err) {
        console.error("Live data fetch failed", err);
      }
    };
    fetchLiveData();
  }, [params.area, params.seedCost, params.fertCost, params.location]);

  const runSimulation = () => {
    setSimulationActive(true);
    // Simulate API call and results
    setTimeout(() => {
      const mockData = Array.from({ length: 20 }).map((_, i) => ({
        day: i,
        yield: 2 + Math.random() * 2 + (i * 0.1),
        moisture: 0.4 + Math.random() * 0.3
      }));
      setYieldData(mockData);
      setSimulationActive(false);
    }, 1500);
  };

  return (
    <div className="dashboard-grid">
      {/* Header */}
      <header className="header glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--accent-green)', padding: '8px', borderRadius: '8px' }}>
            <Zap size={24} color="black" />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '24px', fontWeight: '800' }}>
            AGRI DIGITAL TWIN <span style={{ color: 'var(--text-dim)', fontWeight: '300' }}>— V1.0</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <StatBox icon={<Activity size={16} />} label="System Status" value="Online" />
          <StatBox icon={<Sun size={16} />} label="Last Sync" value="2m ago" />
        </div>
      </header>

      {/* Left Sidebar: Data Controls */}
      <aside className="sidebar">
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={18} /> SCENARIO INPUTS
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="stat-label">Select Crop</label>
              <select value={params.crop} onChange={e => setParams({...params, crop: e.target.value})}>
                <option>Sugarcane</option>
                <option>Jowar (Sorghum)</option>
                <option>Soybean</option>
                <option>Cotton (Kapas)</option>
                <option>Onion (Nashik)</option>
                <option>Grape (Nashik)</option>
              </select>
            </div>
            
            <div>
              <label className="stat-label">Rainfall Delta (%)</label>
              <input 
                type="range" min="-100" max="100" 
                value={params.rainfall}
                onChange={e => setParams({...params, rainfall: parseInt(e.target.value)})}
              />
              <div style={{ textAlign: 'right', fontSize: '12px' }}>{params.rainfall}%</div>
            </div>

            <div>
              <label className="stat-label">Farm Area (Acres)</label>
              <input 
                type="number" min="1" max="1000" 
                value={params.area}
                onChange={e => setParams({...params, area: parseFloat(e.target.value)})}
                style={{ width: '100%', padding: '8px', fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-green)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)' }}
              />
            </div>

            <div>
              <label className="stat-label">Seed Cost (₹/Acre)</label>
              <input 
                type="range" min="500" max="10000" step="500"
                value={params.seedCost}
                onChange={e => setParams({...params, seedCost: parseInt(e.target.value)})}
              />
              <div style={{ textAlign: 'right', fontSize: '12px' }}>₹{params.seedCost.toLocaleString()}</div>
            </div>

            <div>
              <label className="stat-label">Fertilizer Cost (₹/Acre)</label>
              <input 
                type="range" min="500" max="15000" step="500"
                value={params.fertCost}
                onChange={e => setParams({...params, fertCost: parseInt(e.target.value)})}
              />
              <div style={{ textAlign: 'right', fontSize: '12px' }}>₹{params.fertCost.toLocaleString()}</div>
            </div>

            <button onClick={runSimulation} disabled={simulationActive}>
              {simulationActive ? 'SIMULATING...' : 'RUN SIMULATION'}
            </button>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', flex: 1 }}>
          <h3 style={{ marginBottom: '16px' }}>REAL-TIME TELEMETRY</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <MetricLine label="Soil Moisture" value="64%" color="var(--accent-blue)" />
            <MetricLine label="Soil Temp" value="24.2°C" color="#f59e0b" />
            <MetricLine label="Soil pH" value="6.8" color="#a855f7" />
            <MetricLine label="NDVI Index" value={liveData?.satellite?.ndvi || "0.72"} color="var(--accent-green)" />
          </div>
          
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-glass)', paddingTop: '15px' }}>
             <h4 style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '10px' }}>7-DAY CLIMATE OUTLOOK</h4>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {liveData?.weather_forecast?.map((day: any, i: number) => (
                  <div key={i} style={{ textAlign: 'center', fontSize: '10px' }}>
                    <div style={{ color: 'var(--text-dim)' }}>{day.date.split('-')[2]}</div>
                    <div style={{ color: day.condition === 'Rainy' ? 'var(--accent-blue)' : day.condition === 'Drought' ? '#ef4444' : 'white' }}>
                       {day.condition === 'Rainy' ? '🌧️' : day.condition === 'Drought' ? '☀️' : '⛅'}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </aside>

      {/* Main View: 3D Visualization */}
      <main className="main-view glass-card">
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
           <div className="glass-card" style={{ padding: '10px 20px', background: 'rgba(0,0,0,0.5)' }}>
              <span className="stat-label">Location:</span> Nashik District, Maharashtra
           </div>
           <div className="glass-card" style={{ padding: '10px 20px', background: 'rgba(0,0,0,0.5)', marginTop: '8px' }}>
              <span className="stat-label">Satellite Status:</span> <span style={{ color: 'var(--accent-green)' }}>LIVE (Sentinel-2)</span>
           </div>
        </div>
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 10 }}>
           <div className="glass-card" style={{ padding: '10px 20px', display: 'flex', gap: '15px' }}>
              <div><span className="stat-label">NDVI:</span> {liveData?.satellite?.ndvi || '0.75'}</div>
              <div><span className="stat-label">Canopy:</span> {liveData?.satellite?.canopy_cover || '75%'}</div>
           </div>
        </div>
        <FarmScene />
      </main>

      {/* Right Sidebar: Projections */}
      <aside className="sidebar">
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} /> YIELD PROJECTION
          </h3>
          <div style={{ height: '150px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yieldData}>
                <defs>
                  <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="yield" stroke="#22c55e" fillOpacity={1} fill="url(#colorYield)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div className="stat-label">AI Predicted Yield</div>
              <div className="stat-val">{liveData?.ai_prediction?.estimated_yield_q || '--'} Q</div>
            </div>
            <div>
              <div className="stat-label">Net Profit Est. (₹)</div>
              <div className="stat-val" style={{ color: (liveData?.ai_prediction?.net_profit_inr || 0) < 0 ? '#ef4444' : 'var(--accent-green)' }}>
                ₹{liveData?.ai_prediction?.net_profit_inr?.toLocaleString() || '--'}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '12px', fontSize: '10px', color: 'var(--text-dim)', borderTop: '1px solid var(--border-glass)', paddingTop: '8px' }}>
             Model: Gradient Boosting (XGBoost) | Location: {params.location.lat.toFixed(4)}, {params.location.lon.toFixed(4)} <br/>
             Yield: {liveData?.ai_prediction?.yield_per_acre} Q/Acre | Confidence: {(liveData?.ai_prediction?.confidence * 100).toFixed(0)}%
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', flex: 1 }}>
          <h3 style={{ marginBottom: '16px' }}>RISK ANALYSIS</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <RiskItem label="Water Stress" level="Low" color="var(--accent-green)" />
            <RiskItem label="Pest Outbreak" level="Medium" color="#f59e0b" />
            <RiskItem label="Nutrient Leaching" level="High" color="#ef4444" />
          </div>
          
          <div className="glass-card" style={{ marginTop: '20px', padding: '15px', background: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: 'bold' }}>
              <AlertTriangle size={16} /> ADVISORY
            </div>
            <p style={{ fontSize: '13px', marginTop: '8px', color: '#f87171' }}>
              High rainfall predicted next week. Delay nitrogen application to prevent leaching.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

const StatBox = ({ icon, label, value }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ color: 'var(--text-dim)' }}>{icon}</div>
    <div>
      <div className="stat-label" style={{ fontSize: '10px' }}>{label}</div>
      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{value}</div>
    </div>
  </div>
);

const MetricLine = ({ label, value, color }: any) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>{label}</span>
    <span style={{ fontWeight: '600', color: color }}>{value}</span>
  </div>
);

const RiskItem = ({ label, level, color }: any) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
      <span>{label}</span>
      <span style={{ color: color }}>{level}</span>
    </div>
    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
      <div style={{ 
          height: '100%', 
          width: level === 'Low' ? '30%' : level === 'Medium' ? '60%' : '90%', 
          background: color,
          borderRadius: '2px'
        }} 
      />
    </div>
  </div>
);

export default App;
