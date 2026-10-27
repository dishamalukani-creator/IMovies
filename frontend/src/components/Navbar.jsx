import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, User, LogOut, Ticket, Heart, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ backendStatus }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header
      className="sticky-top border-bottom border-secondary border-opacity-25"
      style={{ backgroundColor: 'rgba(10, 13, 20, 0.95)', backdropFilter: 'blur(12px)', zIndex: 1030 }}
    >
      <div className="container py-2 d-flex align-items-center justify-content-between">
        {/* Brand */}
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
          <div
            className="d-flex align-items-center justify-content-center rounded"
            style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #e50914, #990008)' }}
          >
            <Film size={20} className="text-white" />
          </div>
          <div>
            <span className="fs-4 fw-bold tracking-tight text-white">
              I<span style={{ color: 'var(--accent-red)' }}>Movies</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="d-none d-md-flex align-items-center gap-4">
          <Link to="/" className="text-white-50 text-decoration-none hover-white fw-medium small">
            Home
          </Link>
          <Link to="/movies" className="text-white-50 text-decoration-none hover-white fw-medium small">
            Movies
          </Link>
          <Link to="/theatres" className="text-white-50 text-decoration-none hover-white fw-medium small">
            Theatres
          </Link>
          {isAuthenticated && !isAdmin && (
            <>
              <Link to="/my-bookings" className="text-white-50 text-decoration-none hover-white fw-medium small d-flex align-items-center gap-1">
                <Ticket size={14} /> My Bookings
              </Link>
              <Link to="/favorites" className="text-white-50 text-decoration-none hover-white fw-medium small d-flex align-items-center gap-1">
                <Heart size={14} /> Favorites
              </Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin" className="text-danger text-decoration-none fw-semibold small d-flex align-items-center gap-1">
              <Shield size={14} /> Admin Dashboard
            </Link>
          )}
        </nav>

        {/* Status Badge & Auth Actions */}
        <div className="d-flex align-items-center gap-2">
          {/* Live Status indicator */}
          {backendStatus && (
            <div
              className={`badge ${backendStatus.status === 'healthy' ? 'badge-status-online' : 'badge-status-degraded'} d-none d-lg-flex align-items-center gap-1 px-2 py-1`}
              style={{ fontSize: '0.7rem' }}
              title={`API: ${backendStatus.status}`}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: backendStatus.status === 'healthy' ? '#22c55e' : '#eab308',
                }}
              />
              <span>{backendStatus.status === 'healthy' ? 'ONLINE' : 'DEGRADED'}</span>
            </div>
          )}

          {isAuthenticated ? (
            <div className="d-flex align-items-center gap-2">
              <span className="text-white small fw-medium d-none d-sm-inline">
                {isAdmin ? (
                  <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-50">
                    Admin
                  </span>
                ) : (
                  <span className="text-secondary">Hi, <strong className="text-white">{user?.username}</strong></span>
                )}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-cinema-secondary btn-sm d-flex align-items-center gap-1 py-1 px-2"
                title="Sign out"
              >
                <LogOut size={14} />
                <span className="d-none d-md-inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link to="/login" className="btn btn-cinema-secondary btn-sm py-1 px-3">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-cinema-primary btn-sm py-1 px-3">
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger toggle */}
          <button
            className="btn btn-cinema-secondary btn-sm p-1 d-md-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="d-md-none border-top border-secondary border-opacity-25 p-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="d-flex flex-column gap-3">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-white text-decoration-none">
              Home
            </Link>
            <Link to="/movies" onClick={() => setMobileMenuOpen(false)} className="text-white text-decoration-none">
              Movies
            </Link>
            <Link to="/theatres" onClick={() => setMobileMenuOpen(false)} className="text-white text-decoration-none">
              Theatres
            </Link>
            {isAuthenticated && !isAdmin && (
              <>
                <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)} className="text-white text-decoration-none d-flex align-items-center gap-2">
                  <Ticket size={16} /> My Bookings
                </Link>
                <Link to="/favorites" onClick={() => setMobileMenuOpen(false)} className="text-white text-decoration-none d-flex align-items-center gap-2">
                  <Heart size={16} /> Favorites
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-danger text-decoration-none fw-bold d-flex align-items-center gap-2">
                <Shield size={16} /> Admin Dashboard
              </Link>
            )}
            {!isAuthenticated && (
              <Link to="/admin/login" onClick={() => setMobileMenuOpen(false)} className="text-secondary text-decoration-none small">
                Administrator Portal
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
