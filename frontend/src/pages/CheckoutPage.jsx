import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Film, 
  MapPin, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft,
  Ticket
} from 'lucide-react';
import showService from '../services/show.service';
import bookingService from '../services/booking.service';
import { useAuth } from '../context/AuthContext';

export const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const showId = searchParams.get('showId');
  const seatIdsParam = searchParams.get('seats');
  const seatIds = seatIdsParam ? seatIdsParam.split(',').filter(Boolean) : [];

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('demo_card');

  useEffect(() => {
    if (!showId || seatIds.length === 0) {
      navigate('/movies');
      return;
    }
    loadShow();
  }, [showId]);

  const loadShow = async () => {
    setLoading(true);
    try {
      const res = await showService.getShow(showId);
      setShow(res.show);
    } catch (err) {
      setError(err.message || 'Failed to retrieve show checkout data');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const booking = await bookingService.checkoutBooking({
        showId,
        seatIds,
      });

      // Redirect to confirmation screen with the generated booking reference
      navigate(`/confirmation/${booking.bookingId}`);
    } catch (err) {
      setError(err.message || 'Checkout failed. Seats may have expired or been allocated.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status" />
        <div className="text-secondary small mt-2">Preparing secure order summary...</div>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="cinema-card p-5 mx-auto" style={{ maxWidth: 500 }}>
          <AlertTriangle size={48} className="text-danger mb-3" />
          <h4 className="text-white">Checkout Error</h4>
          <p className="text-secondary small">{error || 'Invalid checkout parameters.'}</p>
          <Link to="/movies" className="btn btn-cinema-secondary btn-sm mt-3">
            Return to Movies
          </Link>
        </div>
      </div>
    );
  }

  // Calculate pricing breakdown
  const categoryPriceMap = new Map();
  (show.pricing || []).forEach((p) => {
    categoryPriceMap.set(p.category, p.price);
  });

  const selectedSeatsDetailed = show.seats.filter((s) => seatIds.includes(s.seatId));
  const subtotal = selectedSeatsDetailed.reduce((acc, s) => {
    const price = categoryPriceMap.get(s.category) || 200;
    return acc + price;
  }, 0);
  const convenienceFee = Math.round(subtotal * 0.08);
  const tax = Math.round((subtotal + convenienceFee) * 0.18);
  const grandTotal = subtotal + convenienceFee + tax;

  return (
    <div className="container py-5">
      <div className="mb-4">
        <Link to={`/shows/${showId}/seats`} className="text-secondary text-decoration-none small d-inline-flex align-items-center gap-1 hover-white">
          <ArrowLeft size={16} /> Return to Seat Selection
        </Link>
        <h2 className="text-white fw-bold mt-2">Review & Demo Checkout</h2>
      </div>

      {/* Prominent Demo Notice Banner */}
      <div className="alert alert-warning border border-warning border-opacity-50 bg-dark p-3 p-md-4 mb-4 d-flex align-items-start gap-3">
        <AlertTriangle size={24} className="text-warning flex-shrink-0 mt-1" />
        <div>
          <h6 className="text-warning fw-bold mb-1">
            DEMO SIMULATION TRANSACTION
          </h6>
          <p className="text-secondary small mb-0">
            This application is running in demonstration mode. No real payment gateway credentials are required and no real credit card or bank account will be charged. Clicking confirm will simulate an approved transaction and generate your valid ticket reference.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger bg-danger bg-opacity-10 border border-danger border-opacity-25 text-danger mb-4 small">
          {error}
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Order Summary */}
        <div className="col-lg-7">
          <div className="cinema-card p-4 mb-4">
            <h5 className="text-white fw-bold mb-3 border-bottom border-secondary border-opacity-25 pb-2">
              Screening Information
            </h5>

            <div className="d-flex gap-3 align-items-start mb-4">
              <img
                src={show.movie.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80'}
                alt={show.movie.title}
                className="rounded object-fit-cover shadow-sm"
                style={{ width: 80, height: 110 }}
              />
              <div>
                <h5 className="text-white fw-bold mb-1">{show.movie.title}</h5>
                <span className="badge bg-danger mb-2">{show.movie.certification || 'UA'}</span>
                <div className="text-secondary small d-flex flex-column gap-1">
                  <div className="d-flex align-items-center gap-1">
                    <MapPin size={14} className="text-danger" />
                    <span>{show.theatre.name} — {show.screenName}</span>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <Calendar size={14} />
                    <span>{new Date(show.startTime).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <Clock size={14} />
                    <span>{new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Seats Itemization */}
            <h6 className="text-white fw-semibold mb-2">Reserved Seats</h6>
            <div className="table-responsive">
              <table className="table table-dark table-borderless small mb-0">
                <thead>
                  <tr className="border-bottom border-secondary border-opacity-25 text-secondary">
                    <th>Seat</th>
                    <th>Category</th>
                    <th className="text-end">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSeatsDetailed.map((seat) => {
                    const price = categoryPriceMap.get(seat.category) || 200;
                    return (
                      <tr key={seat.seatId} className="border-bottom border-secondary border-opacity-10">
                        <td className="fw-bold text-white font-monospace">{seat.seatId}</td>
                        <td className="text-secondary">{seat.category}</td>
                        <td className="text-end text-white font-monospace">${price}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="cinema-card p-4">
            <h5 className="text-white fw-bold mb-3 border-bottom border-secondary border-opacity-25 pb-2">
              Select Demo Payment Method
            </h5>

            <div className="d-flex flex-column gap-2 mb-3">
              <label
                onClick={() => setPaymentMethod('demo_card')}
                className={`p-3 rounded border d-flex align-items-center justify-content-between cursor-pointer ${
                  paymentMethod === 'demo_card'
                    ? 'border-danger bg-danger bg-opacity-10'
                    : 'border-secondary border-opacity-25 bg-dark'
                }`}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <CreditCard size={20} className={paymentMethod === 'demo_card' ? 'text-danger' : 'text-secondary'} />
                  <div>
                    <div className="text-white fw-semibold small">Simulated Instant Credit/Debit Card</div>
                    <div className="text-secondary small">Demo test card (Mock 4111-XXXX-XXXX-1111)</div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'demo_card'}
                  onChange={() => setPaymentMethod('demo_card')}
                  className="form-check-input"
                />
              </label>

              <label
                onClick={() => setPaymentMethod('demo_upi')}
                className={`p-3 rounded border d-flex align-items-center justify-content-between cursor-pointer ${
                  paymentMethod === 'demo_upi'
                    ? 'border-danger bg-danger bg-opacity-10'
                    : 'border-secondary border-opacity-25 bg-dark'
                }`}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <Ticket size={20} className={paymentMethod === 'demo_upi' ? 'text-danger' : 'text-secondary'} />
                  <div>
                    <div className="text-white fw-semibold small">Simulated UPI / Instant NetBanking</div>
                    <div className="text-secondary small">Simulated instant wallet confirmation</div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'demo_upi'}
                  onChange={() => setPaymentMethod('demo_upi')}
                  className="form-check-input"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Price Breakdown & Action */}
        <div className="col-lg-5">
          <div className="cinema-card p-4 sticky-top" style={{ top: 90 }}>
            <h5 className="text-white fw-bold mb-3 border-bottom border-secondary border-opacity-25 pb-2">
              Payment Summary
            </h5>

            <div className="d-flex flex-column gap-2 mb-3 small">
              <div className="d-flex justify-content-between text-secondary">
                <span>Tickets Subtotal ({seatIds.length} seats)</span>
                <span className="text-white font-monospace">${subtotal}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary">
                <span>Convenience Fee (8%)</span>
                <span className="text-white font-monospace">${convenienceFee}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary">
                <span>Integrated Taxes (18%)</span>
                <span className="text-white font-monospace">${tax}</span>
              </div>
            </div>

            <div className="border-top border-secondary border-opacity-25 pt-3 mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fs-5 fw-bold text-white">Total Payable</span>
                <span className="fs-4 fw-black text-danger font-monospace">${grandTotal}</span>
              </div>
              <span className="text-secondary small d-block mt-1" style={{ fontSize: '0.75rem' }}>
                Server calculated price breakdown
              </span>
            </div>

            <button
              onClick={handleConfirmBooking}
              disabled={submitting}
              className="btn btn-cinema-primary btn-lg w-100 py-3 d-flex align-items-center justify-content-center gap-2 mb-3"
            >
              <CheckCircle2 size={20} />
              <span>{submitting ? 'Processing Demo Transaction...' : `Confirm Demo Booking ($${grandTotal})`}</span>
            </button>

            <div className="text-center text-secondary small" style={{ fontSize: '0.75rem' }}>
              <ShieldCheck size={14} className="text-success me-1" />
              Secure 256-bit Simulated Session
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
