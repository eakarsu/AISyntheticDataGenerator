import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeaturePage from './pages/FeaturePage';
import Navbar from './components/Navbar';

const CATEGORIES = {
  tabular: { label: 'Tabular Data', icon: '📊', color: '#3B82F6', description: 'Generate structured CSV/table data with custom schemas' },
  text: { label: 'Text Data', icon: '📝', color: '#8B5CF6', description: 'NLP training text, sentiment data, and text corpora' },
  customers: { label: 'Customer Profiles', icon: '👥', color: '#EC4899', description: 'Synthetic customer demographics and behavioral data' },
  medical: { label: 'Medical Records', icon: '🏥', color: '#EF4444', description: 'HIPAA-compliant synthetic health records' },
  financial: { label: 'Financial Transactions', icon: '💰', color: '#10B981', description: 'Transaction data for fraud detection and analytics' },
  timeseries: { label: 'Time Series', icon: '📈', color: '#F59E0B', description: 'Temporal data for forecasting and anomaly detection' },
  logs: { label: 'Log Data', icon: '🖥️', color: '#6366F1', description: 'Application and system log entries' },
  surveys: { label: 'Survey Responses', icon: '📋', color: '#14B8A6', description: 'Survey and questionnaire response data' },
  reviews: { label: 'Product Reviews', icon: '⭐', color: '#F97316', description: 'Product ratings, reviews, and feedback data' },
  iot: { label: 'IoT Sensor Data', icon: '📡', color: '#06B6D4', description: 'Device telemetry and sensor readings' },
  addresses: { label: 'Address Data', icon: '📍', color: '#84CC16', description: 'Synthetic addresses and geographic locations' },
  emails: { label: 'Email Data', icon: '✉️', color: '#A855F7', description: 'Synthetic email correspondence and metadata' },
  social: { label: 'Social Media', icon: '💬', color: '#E11D48', description: 'Social media posts, engagement, and sentiment data' },
  api_test: { label: 'API Test Data', icon: '🔗', color: '#0EA5E9', description: 'API request/response payloads for testing' },
  images: { label: 'Image Metadata', icon: '🖼️', color: '#D946EF', description: 'Image descriptions and metadata for CV training' },
};

export { CATEGORIES };

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard categories={CATEGORIES} />} />
          <Route path="/feature/:category" element={<FeaturePage categories={CATEGORIES} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
