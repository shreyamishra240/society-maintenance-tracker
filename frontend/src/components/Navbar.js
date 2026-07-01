import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ background: '#1e293b', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>🏠 Society Tracker</span>
        {user.role === 'resident' ? (
          <>
            <Link to="/dashboard" style={linkStyle}>My Complaints</Link>
            <Link to="/new-complaint" style={linkStyle}>Raise Complaint</Link>
            <Link to="/notices" style={linkStyle}>Notice Board</Link>
          </>
        ) : (
          <>
            <Link to="/admin" style={linkStyle}>Dashboard</Link>
            <Link to="/admin/complaints" style={linkStyle}>All Complaints</Link>
            <Link to="/notices" style={linkStyle}>Notice Board</Link>
          </>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ color: '#cbd5e1', fontSize: 14 }}>{user.name} ({user.role})</span>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

const linkStyle = { color: '#cbd5e1', textDecoration: 'none', fontSize: 14, fontWeight: 500 };
