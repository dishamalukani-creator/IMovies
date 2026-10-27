import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLoginPage = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await adminLogin(formData.email, formData.password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Administrator authorization failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="cinema-card p-4 p-md-5 w-100 border-danger" style={{ maxWidth: 440 }}>
        {/* Header */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded mb-3 bg-danger bg-opacity-25 border border-danger border-opacity-50"
            style={{ width: 52, height: 52 }}
          >
            <Shield size={28} className="text-danger" />
          </div>
          <h3 className="text-white fw-bold mb-1">Administrator Portal</h3>
          <p className="text-secondary small">Restricted access: Cinema operations and scheduling</p>
        </div>

        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger d-flex align-items-center gap-2 small mb-4">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-secondary small fw-semibold">Admin Email</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary border-opacity-25 text-secondary">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                className="form-control bg-dark text-white border-secondary border-opacity-25"
                placeholder="admin@imovies.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary small fw-semibold">Admin Master Password</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary border-opacity-25 text-secondary">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                className="form-control bg-dark text-white border-secondary border-opacity-25"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-cinema-primary w-100 py-2 fw-semibold mb-3"
          >
            {loading ? 'Authenticating...' : 'Enter Admin Console'}
          </button>
        </form>

        <div className="text-center text-secondary small">
          <Link to="/" className="text-secondary text-decoration-none hover-white">
            ← Return to Customer Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
