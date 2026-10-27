import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ShieldCheck, Heart, AlertTriangle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-top border-secondary border-opacity-25 mt-auto py-5" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        <div className="row g-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div
                className="d-flex align-items-center justify-content-center rounded"
                style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #e50914, #990008)' }}
              >
                <Film size={18} className="text-white" />
              </div>
              <span className="fs-5 fw-bold text-white">IMovies</span>
            </div>
            <p className="text-secondary small mb-3">
              Movie Ticket Booking Made Simple. Discover the latest releases, browse auditoriums, reserve your favorite seats in real time, and experience cinema at its finest.
            </p>
            <div className="d-flex align-items-center gap-2 text-secondary small">
              <ShieldCheck size={16} className="text-success" />
              <span>JWT & Role-Protected REST API</span>
            </div>
          </div>

          <div className="col-lg-2 col-6">
            <h6 className="text-white fw-bold mb-3">Explore</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/movies" className="text-secondary text-decoration-none hover-white">Now Showing</Link></li>
              <li><Link to="/movies?status=upcoming" className="text-secondary text-decoration-none hover-white">Coming Soon</Link></li>
              <li><Link to="/theatres" className="text-secondary text-decoration-none hover-white">Cinemas & Theatres</Link></li>
              <li><Link to="/my-bookings" className="text-secondary text-decoration-none hover-white">Ticket History</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-6">
            <h6 className="text-white fw-bold mb-3">Account</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/login" className="text-secondary text-decoration-none hover-white">Sign In</Link></li>
              <li><Link to="/register" className="text-secondary text-decoration-none hover-white">Create Account</Link></li>
              <li><Link to="/favorites" className="text-secondary text-decoration-none hover-white">My Watchlist</Link></li>
              <li><Link to="/admin/login" className="text-secondary text-decoration-none hover-white">Admin Portal</Link></li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6 className="text-white fw-bold mb-3">Simulation Notice</h6>
            <div className="p-3 rounded border border-warning border-opacity-25 bg-dark bg-opacity-50 small text-secondary">
              <div className="d-flex align-items-center gap-2 text-warning fw-semibold mb-1">
                <AlertTriangle size={16} /> Demo Environment
              </div>
              All ticket checkout operations are demo simulations. No actual banking or payment gateway charges are incurred.
            </div>
          </div>
        </div>

        <div className="border-top border-secondary border-opacity-25 pt-4 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 text-secondary small">
          <div>
            © {new Date().getFullYear()} IMovies Cinema Network. All rights reserved.
          </div>
          <div>
            Modular Monolith Architecture • Node.js, Express, MongoDB, React, Vite, Socket.IO
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
