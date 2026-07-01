import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../components/Badges';

export default function ResidentDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/api/complaints/mine')
      .then((res) => setComplaints(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '30px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2>My Complaints</h2>
          <Link to="/new-complaint" className="btn btn-primary">+ Raise Complaint</Link>
        </div>

        {loading && <div className="loading">Loading...</div>}

        {!loading && complaints.length === 0 && (
          <div className="card empty">
            <h3>No complaints yet</h3>
            <p>Raise your first complaint to get started</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {complaints.map((c) => (
            <Link to={`/complaint/${c.id}`} key={c.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{c.category}</div>
                  <div style={{ color: '#64748b', fontSize: 14 }}>{c.description.slice(0, 80)}{c.description.length > 80 ? '...' : ''}</div>
                  <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 6 }}>Raised on {new Date(c.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
