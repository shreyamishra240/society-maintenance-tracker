import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function NoticeBoard() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [posting, setPosting] = useState(false);

  const load = () => {
    API.get('/api/notices').then((res) => setNotices(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    setPosting(true);
    try {
      await API.post('/api/notices', { title, content, is_important: isImportant });
      setTitle(''); setContent(''); setIsImportant(false); setShowForm(false);
      load();
    } finally {
      setPosting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '30px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2>📢 Notice Board</h2>
          {user.role === 'admin' && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '+ Post Notice'}
            </button>
          )}
        </div>

        {showForm && (
          <div className="card" style={{ marginBottom: 20 }}>
            <form onSubmit={handlePost}>
              <div className="form-group">
                <label>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Notice title" />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea rows={3} value={content} onChange={(e) => setContent(e.target.value)} required placeholder="Notice details..." />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 14 }}>
                <input type="checkbox" style={{ width: 'auto' }} checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} />
                Mark as important (pins to top + emails all residents)
              </label>
              <button className="btn btn-primary" disabled={posting}>{posting ? 'Posting...' : 'Post Notice'}</button>
            </form>
          </div>
        )}

        {loading && <div className="loading">Loading...</div>}
        {!loading && notices.length === 0 && <div className="card empty"><h3>No notices yet</h3></div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notices.map((n) => (
            <div key={n.id} className="card" style={n.is_important ? { borderLeft: '4px solid #dc2626' } : {}}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 16 }}>{n.is_important && '📌 '}{n.title}</h3>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(n.posted_at).toLocaleDateString()}</span>
              </div>
              <p style={{ marginTop: 8, color: '#475569', fontSize: 14, lineHeight: 1.5 }}>{n.content}</p>
              <p style={{ marginTop: 8, fontSize: 12, color: '#94a3b8' }}>Posted by {n.admin_name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
