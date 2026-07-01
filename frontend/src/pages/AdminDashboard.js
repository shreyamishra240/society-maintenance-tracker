import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { StatusBadge, OverdueBadge } from '../components/Badges';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/api/dashboard').then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div><Navbar /><div className="loading">Loading...</div></div>;

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '30px auto', padding: '0 20px' }}>
        <h2 style={{ marginBottom: 20 }}>Admin Dashboard</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          <div className="card">
            <div style={{ fontSize: 13, color: '#64748b' }}>Total Complaints</div>
            <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4 }}>{data.total}</div>
          </div>
          <div className="card">
            <div style={{ fontSize: 13, color: '#64748b' }}>Overdue</div>
            <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4, color: '#be185d' }}>{data.overdue_count}</div>
          </div>
          <div className="card">
            <div style={{ fontSize: 13, color: '#64748b' }}>Open</div>
            <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4, color: '#dc2626' }}>
              {data.by_status.find(s => s.status === 'Open')?.count || 0}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <div className="card">
            <h3 style={{ marginBottom: 12, fontSize: 15 }}>By Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.by_status} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75} label>
                  {data.by_status.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 12, fontSize: 15 }}>By Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.by_category}>
                <XAxis dataKey="category" fontSize={11} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: 15 }}>Recent Complaints</h3>
            <Link to="/admin/complaints" style={{ fontSize: 13, color: '#6366f1' }}>View all →</Link>
          </div>
          {data.recent_complaints.map((c) => (
            <Link to={`/complaint/${c.id}`} key={c.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <span style={{ fontWeight: 500 }}>{c.category}</span>
                  <span style={{ color: '#94a3b8', fontSize: 13, marginLeft: 8 }}>{c.resident_name} · {c.flat_number}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {c.is_overdue && <OverdueBadge />}
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
