import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, User, Mail, Lock, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check input requirements.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="cinema-card p-4 p-md-5 w-100" style={{ maxWidth: 480 }}>
        {/* Header */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded mb-3"
            style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #e50914, #990008)' }}
          >
            <Film size={26} className="text-white" />
          </div>
          <h3 className="text-white fw-bold mb-1">Create Account</h3>
          <p className="text-secondary small">Join IMovies to book cinema tickets with instant confirmation</p>
        </div>

        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger d-flex align-items-center gap-2 small mb-4">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-secondary small fw-semibold">Username</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary border-opacity-25 text-secondary">
                <User size={16} />
              </span>
              <input
                type="text"
                required
                className="form-control bg-dark text-white border-secondary border-opacity-25"
                placeholder="cinephile_99"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary small fw-semibold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary border-opacity-25 text-secondary">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                className="form-control bg-dark text-white border-secondary border-opacity-25"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-secondary small fw-semibold">Mobile Phone (Optional)</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary border-opacity-25 text-secondary">
                <Phone size={16} />
              </span>
              <input
                type="tel"
                className="form-control bg-dark text-white border-secondary border-opacity-25"
                placeholder="+1 555-0192"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="row g-2 mb-4">
            <div className="col-sm-6">
              <label className="form-label text-secondary small fw-semibold">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary border-opacity-25 text-secondary">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  className="form-control bg-dark text-white border-secondary border-opacity-25"
                  placeholder="Min 6 chars"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="col-sm-6">
              <label className="form-label text-secondary small fw-semibold">Confirm</label>
              <div className="input-group">
                <span className="input-group-text bg-dark border-secondary border-opacity-25 text-secondary">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  className="form-control bg-dark text-white border-secondary border-opacity-25"
                  placeholder="Confirm"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-cinema-primary w-100 py-2 fw-semibold mb-3"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="text-center text-secondary small">
          Already registered?{' '}
          <Link to="/login" className="text-danger text-decoration-none fw-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
