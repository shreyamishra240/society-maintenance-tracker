import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';

const CATEGORIES = ['Plumbing', 'Electrical', 'Lift', 'Cleaning', 'Security', 'Other'];

export default function NewComplaint() {
  const [category, setCategory] = useState('Plumbing');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('description', description);
      if (photo) formData.append('photo', photo);

      await API.post('/api/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 600, margin: '30px auto', padding: '0 20px' }}>
        <h2 style={{ marginBottom: 20 }}>Raise a New Complaint</h2>
        <div className="card">
          {error && <div className="error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Describe the issue in detail..." />
            </div>
            <div className="form-group">
              <label>Photo (optional)</label>
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
              {preview && <img src={preview} alt="preview" style={{ marginTop: 10, maxWidth: '100%', borderRadius: 8, maxHeight: 200 }} />}
            </div>
            <button className="btn btn-primary" style={{ width: '100%', padding: 12 }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
