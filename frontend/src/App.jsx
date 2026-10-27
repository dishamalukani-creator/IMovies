import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLoginPage from './pages/AdminLoginPage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import TheatresPage from './pages/TheatresPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import CheckoutPage from './pages/CheckoutPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

// Guards
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

export function App() {
  const [backendStatus, setBackendStatus] = useState(null);

  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <Navbar backendStatus={backendStatus} />
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage onStatusUpdate={setBackendStatus} />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/movies" element={<MoviesPage />} />
              <Route path="/movies/:id" element={<MovieDetailsPage />} />
              <Route path="/theatres" element={<TheatresPage />} />
              <Route path="/shows/:id/seats" element={<SeatSelectionPage />} />

              {/* Customer Protected Routes */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/confirmation/:id"
                element={
                  <ProtectedRoute>
                    <BookingConfirmationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <BookingHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <FavoritesPage />
                  </ProtectedRoute>
                }
              />

              {/* Administrator Protected Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
