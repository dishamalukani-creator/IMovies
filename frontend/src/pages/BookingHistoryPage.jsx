import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Ticket, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import bookingService from '../services/booking.service';

export const BookingHistoryPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelMessage, setCancelMessage] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data || []);
    } catch (err) {
      console.warn('Failed to load user bookings:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (booking) => {
    setCancelModalBooking(booking);
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setCancellingId(cancelModalBooking._id);

    try {
      await bookingService.cancelBooking(cancelModalBooking._id);
      setCancelMessage(`Booking ${cancelModalBooking.bookingId} cancelled successfully.`);
      setCancelModalBooking(null);
      loadBookings();
      setTimeout(() => setCancelMessage(null), 5000);
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 pb-2 border-bottom border-secondary border-opacity-25">
        <div>
          <h2 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
            <Ticket size={26} className="text-danger" />
            <span>My Cinema Bookings</span>
          </h2>
          <p className="text-secondary small mb-0">View all your confirmed reservations and tickets</p>
        </div>
        <button onClick={loadBookings} disabled={loading} className="btn btn-cinema-secondary btn-sm align-self-start">
          <RefreshCw size={14} className={loading ? 'spin-animation' : ''} /> Refresh
        </button>
      </div>

      {cancelMessage && (
        <div className="alert alert-success bg-success bg-opacity-10 border border-success border-opacity-25 text-success small mb-4 d-flex align-items-center gap-2">
          <CheckCircle2 size={16} /> {cancelMessage}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status" />
          <div className="text-secondary small mt-2">Loading ticket history...</div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="cinema-card p-5 text-center my-4">
          <Ticket size={48} className="text-secondary mb-3 opacity-50" />
          <h5 className="text-white">No Bookings Found</h5>
          <p className="text-secondary small">You haven't booked any cinema tickets yet.</p>
          <Link to="/movies" className="btn btn-cinema-primary btn-sm mt-2">
            Discover Movies & Book Tickets
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {bookings.map((booking) => {
            const isCancelled = booking.status === 'cancelled';
            const showTime = new Date(booking.showTime);
            const now = new Date();
            const diffHours = (showTime.getTime() - now.getTime()) / (1000 * 60 * 60);
            const canCancel = !isCancelled && diffHours >= 2;

            return (
              <div
                key={booking._id}
                className={`cinema-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 ${
                  isCancelled ? 'opacity-75' : ''
                }`}
              >
                {/* Left: Movie & Info */}
                <div className="d-flex gap-3 align-items-center">
                  <img
                    src={booking.movieSnapshot?.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80'}
                    alt={booking.movieSnapshot?.title}
                    className="rounded object-fit-cover shadow-sm"
                    style={{ width: 70, height: 95 }}
                  />
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h5 className="text-white fw-bold mb-0">{booking.movieSnapshot?.title}</h5>
                      <span className={`badge ${isCancelled ? 'bg-secondary' : 'bg-success'}`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-secondary small d-flex flex-column gap-1">
                      <div className="d-flex align-items-center gap-1">
                        <MapPin size={14} className="text-danger" />
                        <span>{booking.theatreSnapshot?.name} ({booking.theatreSnapshot?.screenName})</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span>
                          <Calendar size={14} className="me-1" />
                          {showTime.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span className="text-white fw-semibold">
                          <Clock size={14} className="me-1" />
                          {showTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div>
                        Seats: <strong className="text-white font-monospace">{booking.seats.map((s) => s.seatId).join(', ')}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Total & Actions */}
                <div className="text-md-end border-top-md border-secondary border-opacity-25 pt-3 pt-md-0">
                  <div className="text-secondary small">Total Paid: <strong className="text-white font-monospace">${booking.totalAmount}</strong></div>
                  <div className="text-secondary small font-monospace mb-2">ID: {booking.bookingId}</div>

                  <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                    <Link
                      to={`/confirmation/${booking.bookingId}`}
                      className="btn btn-cinema-secondary btn-sm d-flex align-items-center gap-1"
                    >
                      <Eye size={14} /> View Ticket
                    </Link>

                    {canCancel && (
                      <button
                        onClick={() => handleCancelClick(booking)}
                        disabled={cancellingId === booking._id}
                        className="btn btn-outline-danger btn-sm"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Policy Modal */}
      {cancelModalBooking && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content cinema-card border-danger text-white">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold text-danger d-flex align-items-center gap-2">
                  <AlertCircle size={20} /> Cancel Booking Confirmation
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setCancelModalBooking(null)}
                />
              </div>
              <div className="modal-body small text-secondary">
                <p>
                  Are you sure you want to cancel booking <strong className="text-white">{cancelModalBooking.bookingId}</strong> for <strong className="text-white">{cancelModalBooking.movieSnapshot.title}</strong>?
                </p>
                <div className="p-3 rounded bg-dark border border-secondary border-opacity-25 mb-3">
                  <div className="fw-semibold text-white mb-1">Cancellation Terms:</div>
                  <ul className="mb-0 ps-3">
                    <li>Seats ({cancelModalBooking.seats.map((s) => s.seatId).join(', ')}) will be released immediately.</li>
                    <li>Simulated refund of 85% (${Math.round(cancelModalBooking.subtotal * 0.85)}) will be processed.</li>
                    <li>Cancellation is valid because show starts in more than 2 hours.</li>
                  </ul>
                </div>
              </div>
              <div className="modal-footer border-secondary border-opacity-25">
                <button
                  type="button"
                  className="btn btn-cinema-secondary btn-sm"
                  onClick={() => setCancelModalBooking(null)}
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  disabled={cancellingId !== null}
                  onClick={handleConfirmCancel}
                  className="btn btn-danger btn-sm"
                >
                  {cancellingId ? 'Processing...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistoryPage;
