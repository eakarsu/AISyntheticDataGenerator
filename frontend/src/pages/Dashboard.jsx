import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { datasets } from '../services/api';

function Dashboard({ categories }) {
  const navigate = useNavigate();
  const [categoryCounts, setCategoryCounts] = useState({});
  const [stats, setStats] = useState({ totalDatasets: 0, totalCategories: 15 });

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const data = await datasets.getCategories();
      const counts = {};
      let total = 0;
      data.forEach((c) => {
        counts[c.category] = parseInt(c.count);
        total += parseInt(c.count);
      });
      setCategoryCounts(counts);
      setStats({ totalDatasets: total, totalCategories: Object.keys(categories).length });
    } catch (err) {
      console.error('Failed to load counts:', err);
    }
  };

  const handleCardClick = (category) => {
    navigate(`/feature/${category}`);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>AI Synthetic Data Generator</h1>
          <p className="dashboard-subtitle">
            Generate privacy-compliant synthetic datasets powered by AI. Choose a data category to get started.
          </p>
        </div>
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.totalDatasets}</div>
            <div className="stat-label">Total Datasets</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalCategories}</div>
            <div className="stat-label">Categories</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">$2.1B</div>
            <div className="stat-label">Market by 2028</div>
          </div>
        </div>
      </div>

      <div className="category-grid">
        {Object.entries(categories).map(([key, cat]) => (
          <div
            key={key}
            className="category-card"
            onClick={() => handleCardClick(key)}
            style={{ '--card-color': cat.color }}
          >
            <div className="category-card-header">
              <span className="category-icon">{cat.icon}</span>
              <span className="category-count">{categoryCounts[key] || 0} datasets</span>
            </div>
            <h3>{cat.label}</h3>
            <p>{cat.description}</p>
            <div className="category-card-footer">
              <span className="card-action">Explore & Generate →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
