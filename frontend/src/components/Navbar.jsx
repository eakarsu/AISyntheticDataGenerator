import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navBtn = (label, path) => (
    <button
      onClick={() => navigate(path)}
      style={{
        padding: '0.3rem 0.75rem',
        cursor: 'pointer',
        background: location.pathname === path ? '#3B82F6' : 'transparent',
        color: location.pathname === path ? 'white' : '#374151',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: location.pathname === path ? 600 : 400,
      }}
    >
      {label}
    </button>
  );

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')}>
        <span className="navbar-logo">🧬</span>
        <span className="navbar-title">SynthData<span className="text-ai">AI</span></span>
      </div>
      <div className="navbar-center" style={{ display: 'flex', gap: '0.5rem' }}>
        {navBtn('Dashboard', '/')}
        {navBtn('Schema Builder', '/schema-builder')}
        {navBtn('Stream Generator', '/streaming')}
        {navBtn('Schema Infer', '/schema-infer')}
        {navBtn('Redact PII', '/redact-pii')}
        {navBtn('Distribution', '/distribution-preserve')}
        {navBtn('Edge Cases', '/edge-cases')}
        {navBtn('Synth Views', '/custom-views')}
      </div>
      <div className="navbar-right">
        <div className="navbar-user">
          <div className="avatar">{(user?.name || 'U')[0].toUpperCase()}</div>
          <span className="user-name">{user?.name || user?.email}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
