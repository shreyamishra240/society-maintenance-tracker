import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../components/Badges';
import { useAuth } from '../context/AuthContext';

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    API.get(`/api/complaints/${id}`)
      .then((res) => {
        setComplaint(res.data);
        setStatus(res.data.status);
        setPriority(res.data.priority);
      })
      .catch(() => setError('Could not load complaint'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleUpdate = async () => {
    setUpdating(true);
    setError('');
    try {
      await API.patch(`/api/complaints/${id}`, { status, priority, note });
      setNote('');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div><Navbar /><div className="loading">Loading...</div></div>;
  if (!complaint) return <div><Navbar /><div className="loading">Complaint not found</div></div>;

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '30px auto', padding: '0 20px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', marginBottom: 16, fontSize: 14 }}>← Back</button>

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h2 style={{ marginBottom: 6 }}>{complaint.category}</h2>
              <p style={{ color: '#64748b', fontSize: 14 }}>By {complaint.resident_name} ({complaint.flat_number})</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {complaint.is_overdue && <OverdueBadge />}
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
            </div>
          </div>
          <p style={{ marginTop: 16, lineHeight: 1.6 }}>{complaint.description}</p>
          {complaint.photo_url && (
            <img src={complaint.photo_url} alt="complaint" style={{ marginTop: 14, maxWidth: '100%', borderRadius: 8, maxHeight: 300 }} />
          )}
        </div>

        {user.role === 'admin' && complaint.status !== 'Resolved' && (
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginBottom: 14, fontSize: 15 }}>Update Complaint</h3>
            {error && <div className="error">{error}</div>}
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Note (optional)</label>
              <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note about this update..." />
            </div>
            <button className="btn btn-primary" onClick={handleUpdate} disabled={updating}>
              {updating ? 'Updating...' : 'Update Complaint'}
            </button>
          </div>
        )}

        <div className="card">
          <h3 style={{ marginBottom: 14, fontSize: 15 }}>Status History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {complaint.history.map((h) => (
              <div key={h.id} style={{ borderLeft: '3px solid #6366f1', paddingLeft: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {h.old_status ? `${h.old_status} → ${h.new_status}` : `Created: ${h.new_status}`}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  by {h.actor_name} on {new Date(h.changed_at).toLocaleString()}
                </div>
                {h.note && <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>{h.note}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
