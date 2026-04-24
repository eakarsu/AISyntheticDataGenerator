import React, { useState, useEffect } from 'react';
import { auth } from '../services/api';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAutoFill = async () => {
    try {
      const defaults = await auth.getDefaults();
      setEmail(defaults.email);
      setPassword(defaults.password);
      setError('');
    } catch {
      setEmail('admin@synthdata.ai');
      setPassword('admin123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await auth.login(email, password);
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-gradient" />
        <div className="login-bg-grid" />
      </div>
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <span className="login-logo-icon">🧬</span>
              <h1>SynthData<span className="login-logo-ai">AI</span></h1>
            </div>
            <p className="login-subtitle">AI-Powered Synthetic Data Generator</p>
            <div className="login-market-badge">
              <span className="badge-dot" />
              $2.1B Market by 2028
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="login-error">{error}</div>}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? (
                <><span className="spinner" /> Signing in...</>
              ) : (
                'Sign In'
              )}
            </button>

            <button type="button" className="btn btn-secondary btn-full" onClick={handleAutoFill}>
              🔑 Auto-Fill Demo Credentials
            </button>
          </form>

          <div className="login-features">
            <div className="login-feature">
              <span>🛡️</span>
              <span>Privacy-First</span>
            </div>
            <div className="login-feature">
              <span>🤖</span>
              <span>AI-Powered</span>
            </div>
            <div className="login-feature">
              <span>⚡</span>
              <span>Real-Time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
