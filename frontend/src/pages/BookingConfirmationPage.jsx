import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Film, 
  MapPin, 
  Calendar, 
  Clock, 
  Printer, 
  ArrowRight, 
  AlertCircle,
  Ticket,
  QrCode
} from 'lucide-react';
import bookingService from '../services/booking.service';

export const BookingConfirmationPage = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    setLoading(true);
    try {
      const data = await bookingService.getBooking(id);
      setBooking(data);
    } catch (err) {
      setError(err.message || 'Failed to retrieve booking confirmation');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status" />
        <div className="text-secondary small mt-2">Retrieving ticket confirmation...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="cinema-card p-5 mx-auto" style={{ maxWidth: 500 }}>
          <AlertCircle size={48} className="text-danger mb-3" />
          <h4 className="text-white">Booking Not Found</h4>
          <p className="text-secondary small">{error || 'Could not locate this ticket reference.'}</p>
          <Link to="/movies" className="btn btn-cinema-secondary btn-sm mt-3">
            Browse Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Success Banner */}
      <div className="text-center mb-5">
        <div
          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-20 border border-success border-opacity-50 p-3 mb-3 text-success"
          style={{ width: 68, height: 68 }}
        >
          <CheckCircle2 size={38} />
        </div>
        <h2 className="text-white fw-bold mb-1">Booking Confirmed!</h2>
        <p className="text-secondary small">
          Your cinema tickets are reserved. A confirmation copy is stored in your booking history.
        </p>
      </div>

      {/* Digital Cinema Ticket Card */}
      <div className="cinema-card p-0 mx-auto overflow-hidden shadow-lg border-danger mb-4" style={{ maxWidth: 680 }}>
        {/* Ticket Header */}
        <div className="p-4 bg-danger bg-opacity-10 border-bottom border-danger border-opacity-25 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div className="d-flex align-items-center gap-2">
            <Film size={22} className="text-danger" />
            <span className="fs-5 fw-bold text-white">IMovies Cinema Ticket</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success text-white py-1 px-3 fw-bold">
              {booking.status.toUpperCase()}
            </span>
            <span className="badge bg-dark border border-secondary text-secondary font-monospace">
              {booking.bookingId}
            </span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-4 p-md-5">
          <div className="row g-4 mb-4">
            <div className="col-md-8">
              <h3 className="text-white fw-bold mb-1">{booking.movieSnapshot.title}</h3>
              <div className="d-flex align-items-center gap-2 text-secondary small mb-3">
                <span className="badge bg-dark border border-secondary text-secondary">
                  {booking.movieSnapshot.certification}
                </span>
                <span>{booking.movieSnapshot.durationMinutes} mins</span>
              </div>

              <div className="d-flex flex-column gap-2 text-secondary small">
                <div className="d-flex align-items-center gap-2">
                  <MapPin size={16} className="text-danger" />
                  <span className="text-white fw-medium">
                    {booking.theatreSnapshot.name} ({booking.theatreSnapshot.screenName})
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Calendar size={16} />
                  <span>
                    {new Date(booking.showTime).toLocaleDateString([], {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Clock size={16} />
                  <span className="text-white fw-bold fs-6">
                    {new Date(booking.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-md-4 text-center text-md-end border-start-md border-secondary border-opacity-25">
              <span className="text-secondary small d-block mb-1">Seats Reserved</span>
              <div className="d-flex flex-wrap justify-content-center justify-content-md-end gap-1 mb-3">
                {booking.seats.map((seat) => (
                  <span key={seat.seatId} className="badge bg-danger text-white fs-6 py-2 px-3 font-monospace">
                    {seat.seatId}
                  </span>
                ))}
              </div>
              <span className="text-secondary small d-block">Total Paid</span>
              <span className="fs-4 fw-black text-white font-monospace">${booking.totalAmount}</span>
              <span className="text-success small d-block mt-1 font-monospace" style={{ fontSize: '0.7rem' }}>
                Simulated Approved
              </span>
            </div>
          </div>

          {/* Barcode & Simulation Details */}
          <div className="border-top border-dashed border-secondary border-opacity-50 pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div className="text-secondary small">
              <div>Txn Ref: <span className="text-white font-monospace">{booking.paymentDetails?.transactionId}</span></div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                {booking.paymentDetails?.disclaimer}
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 bg-dark p-2 px-3 rounded border border-secondary border-opacity-25">
              <QrCode size={32} className="text-white" />
              <div className="font-monospace text-secondary small" style={{ fontSize: '0.7rem' }}>
                SCAN AT GATE<br />
                <strong>{booking.bookingId}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex flex-wrap justify-content-center gap-3">
        <button onClick={handlePrint} className="btn btn-cinema-secondary">
          <Printer size={18} /> Print Ticket
        </button>
        <Link to="/my-bookings" className="btn btn-cinema-secondary">
          <Ticket size={18} /> View Booking History
        </Link>
        <Link to="/movies" className="btn btn-cinema-primary">
          Explore More Movies <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
