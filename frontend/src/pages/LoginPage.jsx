import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

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
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="cinema-card p-4 p-md-5 w-100" style={{ maxWidth: 460 }}>
        {/* Header */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded mb-3"
            style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #e50914, #990008)' }}
          >
            <Film size={26} className="text-white" />
          </div>
          <h3 className="text-white fw-bold mb-1">Welcome Back</h3>
          <p className="text-secondary small">Sign in to book tickets and manage your reservations</p>
        </div>

        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger d-flex align-items-center gap-2 small mb-4">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          <div className="mb-4">
            <label className="form-label text-secondary small fw-semibold">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary border-opacity-25 text-secondary">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                className="form-control bg-dark text-white border-secondary border-opacity-25"
                placeholder="••••••••"
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
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-secondary small">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-danger text-decoration-none fw-semibold">
            Create an Account
          </Link>
        </div>

        <div className="border-top border-secondary border-opacity-25 mt-4 pt-3 text-center">
          <Link to="/admin/login" className="text-secondary opacity-75 text-decoration-none small">
            Are you an administrator? Admin Portal →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
