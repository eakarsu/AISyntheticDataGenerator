import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={() => navigate('/')}>
        <span className="navbar-logo">🧬</span>
        <span className="navbar-title">SynthData<span className="text-ai">AI</span></span>
      </div>
      <div className="navbar-center">
        {location.pathname !== '/' && (
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
            ← Dashboard
          </button>
        )}
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
