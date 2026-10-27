import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Film, 
  MapPin, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  Info
} from 'lucide-react';
import showService from '../services/show.service';
import { joinShowRoom, leaveShowRoom, getSocket } from '../services/socket.service';
import { useAuth } from '../context/AuthContext';

export const SeatSelectionPage = () => {
  const { id: showId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [show, setShow] = useState(null);
  const [screenLayout, setScreenLayout] = useState(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locking, setLocking] = useState(false);

  useEffect(() => {
    loadShowDetails();

    // Join Socket.IO room for live seat updates
    joinShowRoom(showId);

    const socket = getSocket();
    if (socket) {
      // Listen to real-time seat lock and booking events
      socket.on('seats:locked', (data) => {
        if (data.showId === showId) {
          setShow((prev) => {
            if (!prev) return prev;
            const updatedSeats = prev.seats.map((seat) => {
              if (data.seatIds.includes(seat.seatId) && !selectedSeatIds.includes(seat.seatId)) {
                return { ...seat, status: 'locked' };
              }
              return seat;
            });
            return { ...prev, seats: updatedSeats };
          });
        }
      });

      socket.on('seats:released', (data) => {
        if (data.showId === showId) {
          setShow((prev) => {
            if (!prev) return prev;
            const updatedSeats = prev.seats.map((seat) => {
              if (data.seatIds.includes(seat.seatId)) {
                return { ...seat, status: 'available' };
              }
              return seat;
            });
            return { ...prev, seats: updatedSeats };
          });
        }
      });

      socket.on('seats:booked', (data) => {
        if (data.showId === showId) {
          setShow((prev) => {
            if (!prev) return prev;
            const updatedSeats = prev.seats.map((seat) => {
              if (data.seatIds.includes(seat.seatId)) {
                return { ...seat, status: 'booked' };
              }
              return seat;
            });
            return { ...prev, seats: updatedSeats };
          });
        }
      });
    }

    return () => {
      leaveShowRoom(showId);
      if (socket) {
        socket.off('seats:locked');
        socket.off('seats:released');
        socket.off('seats:booked');
      }
    };
  }, [showId]);

  const loadShowDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await showService.getShow(showId);
      setShow(res.show);
      setScreenLayout(res.screenLayout);
    } catch (err) {
      setError(err.message || 'Failed to load auditorium seat map');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.status === 'booked' || seat.status === 'locked') return;

    if (selectedSeatIds.includes(seat.seatId)) {
      setSelectedSeatIds(selectedSeatIds.filter((id) => id !== seat.seatId));
    } else {
      if (selectedSeatIds.length >= 8) {
        alert('You can select a maximum of 8 seats per booking');
        return;
      }
      setSelectedSeatIds([...selectedSeatIds, seat.seatId]);
    }
  };

  const handleProceedToCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/shows/${showId}/seats` } } });
      return;
    }

    if (selectedSeatIds.length === 0) {
      alert('Please select at least one seat to proceed');
      return;
    }

    setLocking(true);
    try {
      // Temporarily hold seats on the server
      await showService.lockSeats(showId, selectedSeatIds);
      navigate(`/checkout?showId=${showId}&seats=${selectedSeatIds.join(',')}`);
    } catch (err) {
      alert(err.message || 'Some of the selected seats were taken. Please re-select.');
      loadShowDetails(); // Refresh
      setSelectedSeatIds([]);
    } finally {
      setLocking(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status" />
        <div className="text-secondary small mt-2">Connecting to auditorium seat grid...</div>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="cinema-card p-5 mx-auto" style={{ maxWidth: 500 }}>
          <AlertCircle size={48} className="text-danger mb-3" />
          <h4 className="text-white">Auditorium Unavailable</h4>
          <p className="text-secondary small">{error || 'Unable to retrieve show information.'}</p>
          <Link to="/movies" className="btn btn-cinema-secondary btn-sm mt-3">
            Back to Movies
          </Link>
        </div>
      </div>
    );
  }

  // Group seats by Category and then by Row
  const seatsByCategory = {};
  show.seats.forEach((seat) => {
    const cat = seat.category || 'Standard';
    if (!seatsByCategory[cat]) {
      seatsByCategory[cat] = {};
    }
    if (!seatsByCategory[cat][seat.row]) {
      seatsByCategory[cat][seat.row] = [];
    }
    seatsByCategory[cat][seat.row].push(seat);
  });

  // Calculate pricing summary for selected seats
  const categoryPriceMap = new Map();
  (show.pricing || []).forEach((p) => {
    categoryPriceMap.set(p.category, p.price);
  });

  const selectedSeatsDetailed = show.seats.filter((s) => selectedSeatIds.includes(s.seatId));
  const subtotal = selectedSeatsDetailed.reduce((acc, s) => {
    const price = categoryPriceMap.get(s.category) || 200;
    return acc + price;
  }, 0);
  const convenienceFee = Math.round(subtotal * 0.08);
  const tax = Math.round((subtotal + convenienceFee) * 0.18);
  const grandTotal = subtotal + convenienceFee + tax;

  return (
    <div className="container py-4 pb-5">
      {/* Show Overview Bar */}
      <div className="cinema-card p-3 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h4 className="text-white fw-bold mb-0">{show.movie.title}</h4>
            <span className="badge bg-danger">{show.movie.certification || 'UA'}</span>
          </div>
          <div className="text-secondary small d-flex flex-wrap align-items-center gap-2">
            <span>{show.theatre.name}</span>
            <span>•</span>
            <span className="text-white fw-semibold">{show.screenName}</span>
            <span>•</span>
            <span>{new Date(show.startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            <span>•</span>
            <span className="text-danger fw-bold">{new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <Link to={`/movies/${show.movie._id}`} className="btn btn-cinema-secondary btn-sm align-self-start align-self-md-center">
          Change Show
        </Link>
      </div>

      {/* Screen Curved Banner */}
      <div className="text-center my-4">
        <div
          className="mx-auto rounded-pill mb-2"
          style={{
            height: 6,
            maxWidth: 620,
            background: 'linear-gradient(90deg, transparent 0%, #e50914 30%, #ffffff 50%, #e50914 70%, transparent 100%)',
            boxShadow: '0 0 25px rgba(229, 9, 20, 0.6)',
          }}
        />
        <span className="text-secondary tracking-widest small fw-semibold" style={{ letterSpacing: '0.25em' }}>
          AUDITORIUM SCREEN THIS WAY
        </span>
      </div>

      {/* Seat Grid Map */}
      <div className="cinema-card p-3 p-md-5 mb-4 overflow-auto">
        <div style={{ minWidth: 640 }} className="d-flex flex-column align-items-center gap-4">
          {Object.entries(seatsByCategory).map(([category, rowsMap]) => {
            const catPrice = categoryPriceMap.get(category) || 200;

            return (
              <div key={category} className="w-100 text-center">
                {/* Category Header */}
                <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                  <span className="text-white fw-bold small text-uppercase tracking-wider">
                    {category}
                  </span>
                  <span className="text-success small fw-semibold">
                    ${catPrice}
                  </span>
                </div>

                {/* Rows in this Category */}
                <div className="d-flex flex-column gap-2 align-items-center">
                  {Object.entries(rowsMap).map(([rowLetter, rowSeats]) => (
                    <div key={rowLetter} className="d-flex align-items-center gap-2">
                      {/* Row Label Left */}
                      <span className="text-secondary small fw-bold text-center" style={{ width: 24 }}>
                        {rowLetter}
                      </span>

                      {/* Seats in Row */}
                      <div className="d-flex gap-2">
                        {rowSeats.map((seat, index) => {
                          const isSelected = selectedSeatIds.includes(seat.seatId);
                          const isBooked = seat.status === 'booked';
                          const isLocked = seat.status === 'locked';

                          // Aisle gap if applicable
                          const isAisle = screenLayout?.aisles?.includes(seat.number);

                          return (
                            <React.Fragment key={seat.seatId}>
                              <button
                                onClick={() => handleSeatClick(seat)}
                                disabled={isBooked || isLocked}
                                title={`${seat.seatId} (${category} - $${catPrice}) - ${seat.status}`}
                                className={`rounded seat-btn d-flex align-items-center justify-content-center ${
                                  isSelected
                                    ? 'seat-selected'
                                    : isBooked
                                    ? 'seat-booked'
                                    : isLocked
                                    ? 'seat-locked'
                                    : 'seat-available'
                                }`}
                                style={{
                                  width: 32,
                                  height: 30,
                                  fontSize: '0.65rem',
                                  fontWeight: 600,
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                {seat.number}
                              </button>
                              {isAisle && <div style={{ width: 16 }} />}
                            </React.Fragment>
                          );
                        })}
                      </div>

                      {/* Row Label Right */}
                      <span className="text-secondary small fw-bold text-center" style={{ width: 24 }}>
                        {rowLetter}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seat State Legend */}
      <div className="d-flex flex-wrap justify-content-center gap-4 mb-4 small text-secondary">
        <div className="d-flex align-items-center gap-2">
          <span className="rounded seat-available" style={{ width: 18, height: 18 }} />
          <span>Available</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="rounded seat-selected" style={{ width: 18, height: 18 }} />
          <span>Selected</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="rounded seat-locked" style={{ width: 18, height: 18 }} />
          <span>Reserved (Held by user)</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="rounded seat-booked" style={{ width: 18, height: 18 }} />
          <span>Sold Out</span>
        </div>
      </div>

      {/* Sticky Bottom Booking Bar */}
      <div
        className="fixed-bottom border-top border-secondary border-opacity-25 py-3 shadow-lg"
        style={{ backgroundColor: 'rgba(18, 23, 34, 0.98)', backdropFilter: 'blur(16px)' }}
      >
        <div className="container d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div>
              <span className="text-secondary small d-block">Selected Seats ({selectedSeatIds.length})</span>
              <div className="d-flex flex-wrap gap-1 mt-1">
                {selectedSeatIds.length === 0 ? (
                  <span className="text-white-50 small">No seats selected</span>
                ) : (
                  selectedSeatIds.map((id) => (
                    <span key={id} className="badge bg-danger text-white font-monospace">
                      {id}
                    </span>
                  ))
                )}
              </div>
            </div>

            {selectedSeatIds.length > 0 && (
              <div className="border-start border-secondary border-opacity-50 ps-3">
                <span className="text-secondary small d-block">Estimated Total</span>
                <span className="fs-5 fw-bold text-white font-monospace">${grandTotal}</span>
                <span className="text-secondary small ms-1" style={{ fontSize: '0.7rem' }}>
                  (incl. taxes & fees)
                </span>
              </div>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              onClick={handleProceedToCheckout}
              disabled={selectedSeatIds.length === 0 || locking}
              className="btn btn-cinema-primary btn-lg px-4 d-flex align-items-center gap-2"
            >
              <span>{locking ? 'Holding Seats...' : 'Proceed to Demo Checkout'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
