import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../components/Badges';

const CATEGORIES = ['Plumbing', 'Electrical', 'Lift', 'Cleaning', 'Security', 'Other'];

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  const load = () => {
    setLoading(true);
    const params = {};
    if (status) params.status = status;
    if (category) params.category = category;
    API.get('/api/complaints', { params }).then((res) => setComplaints(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [status, category]);

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '30px auto', padding: '0 20px' }}>
        <h2 style={{ marginBottom: 20 }}>All Complaints</h2>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: 180 }}>
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: 180 }}>
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading && <div className="loading">Loading...</div>}
        {!loading && complaints.length === 0 && <div className="card empty"><h3>No complaints found</h3></div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {complaints.map((c) => (
            <Link to={`/complaint/${c.id}`} key={c.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...(c.is_overdue ? { borderLeft: '4px solid #be185d' } : {}) }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.category} <span style={{ fontWeight: 400, color: '#94a3b8', fontSize: 13 }}>· {c.resident_name} ({c.flat_number})</span></div>
                  <div style={{ color: '#64748b', fontSize: 14, marginTop: 2 }}>{c.description.slice(0, 80)}{c.description.length > 80 ? '...' : ''}</div>
                  <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 6 }}>{new Date(c.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {c.is_overdue && <OverdueBadge />}
                  <PriorityBadge priority={c.priority} />
                  <StatusBadge status={c.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
