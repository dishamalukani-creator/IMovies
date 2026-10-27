import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  DollarSign, 
  Ticket, 
  Film, 
  MapPin, 
  Calendar, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import bookingService from '../services/booking.service';
import movieService from '../services/movie.service';
import theatreService from '../services/theatre.service';
import showService from '../services/show.service';

export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);

  // Search in bookings
  const [bookingSearch, setBookingSearch] = useState('');

  // Modals state
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [showAddTheatreModal, setShowAddTheatreModal] = useState(false);
  const [showAddShowModal, setShowAddShowModal] = useState(false);

  // Form states
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    genres: 'Action, Sci-Fi',
    languages: 'English',
    durationMinutes: 120,
    releaseDate: new Date().toISOString().split('T')[0],
    certification: 'UA',
    director: '',
    posterUrl: '',
    bannerUrl: '',
    status: 'now_showing',
  });

  const [theatreForm, setTheatreForm] = useState({
    name: '',
    identifier: '',
    address: '',
    city: '',
    state: '',
    amenities: 'IMAX, Dolby Atmos',
  });

  const [showForm, setShowForm] = useState({
    movie: '',
    theatre: '',
    screenNumber: 1,
    startTime: '',
  });

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, moviesData, theatresData, showsData, bookingsData] = await Promise.all([
        bookingService.getAdminStats().catch(() => null),
        movieService.getMovies({ limit: 50 }).catch(() => ({ movies: [] })),
        theatreService.getTheatres().catch(() => []),
        showService.getShows().catch(() => []),
        bookingService.getAllBookingsAdmin().catch(() => ({ bookings: [] })),
      ]);

      setStats(statsData);
      setMovies(moviesData.movies || []);
      setTheatres(theatresData || []);
      setShows(showsData || []);
      setBookings(bookingsData.bookings || []);
    } catch (err) {
      console.warn('Error loading admin dashboard datasets:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const notify = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 4000);
  };

  // Movie actions
  const handleCreateMovie = async (e) => {
    e.preventDefault();
    try {
      await movieService.createMovie({
        ...movieForm,
        genres: movieForm.genres.split(',').map((g) => g.trim()),
        languages: movieForm.languages.split(',').map((l) => l.trim()),
        durationMinutes: Number(movieForm.durationMinutes),
        releaseDate: new Date(movieForm.releaseDate),
      });
      setShowAddMovieModal(false);
      notify('Movie created successfully');
      loadAllAdminData();
    } catch (err) {
      alert(err.message || 'Failed to create movie');
    }
  };

  const handleDeleteMovie = async (id) => {
    if (!window.confirm('Are you sure you want to delete this movie listing? Associated upcoming shows will also be removed.')) return;
    try {
      await movieService.deleteMovie(id);
      notify('Movie deleted successfully');
      loadAllAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete movie');
    }
  };

  // Theatre actions
  const handleCreateTheatre = async (e) => {
    e.preventDefault();
    try {
      await theatreService.createTheatre({
        ...theatreForm,
        identifier: theatreForm.identifier.toUpperCase(),
        location: {
          address: theatreForm.address,
          city: theatreForm.city,
          state: theatreForm.state,
        },
        amenities: theatreForm.amenities.split(',').map((a) => a.trim()),
      });
      setShowAddTheatreModal(false);
      notify('Theatre added successfully');
      loadAllAdminData();
    } catch (err) {
      alert(err.message || 'Failed to create theatre');
    }
  };

  const handleDeleteTheatre = async (id) => {
    if (!window.confirm('Delete this theatre? Associated upcoming shows will be removed.')) return;
    try {
      await theatreService.deleteTheatre(id);
      notify('Theatre deleted');
      loadAllAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete theatre');
    }
  };

  // Show actions
  const handleCreateShow = async (e) => {
    e.preventDefault();
    try {
      await showService.createShow({
        movie: showForm.movie,
        theatre: showForm.theatre,
        screenNumber: Number(showForm.screenNumber),
        startTime: new Date(showForm.startTime),
      });
      setShowAddShowModal(false);
      notify('Show scheduled successfully');
      loadAllAdminData();
    } catch (err) {
      alert(err.message || 'Failed to create show schedule');
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Cancel and delete this show?')) return;
    try {
      await showService.deleteShow(id);
      notify('Show deleted');
      loadAllAdminData();
    } catch (err) {
      alert(err.message || 'Failed to delete show');
    }
  };

  const filteredBookings = bookings.filter((b) =>
    b.bookingId?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.movieSnapshot?.title?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
    b.user?.username?.toLowerCase().includes(bookingSearch.toLowerCase())
  );

  return (
    <div className="container py-5">
      {/* Dashboard Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom border-secondary border-opacity-25">
        <div>
          <div className="badge-cinema mb-2">
            <Shield size={14} /> Master Administrator Portal
          </div>
          <h2 className="text-white fw-bold mb-0">IMovies Operations Console</h2>
        </div>

        <button onClick={loadAllAdminData} disabled={loading} className="btn btn-cinema-secondary btn-sm align-self-start">
          <RefreshCw size={14} className={loading ? 'spin-animation' : ''} /> Refresh Data
        </button>
      </div>

      {actionMessage && (
        <div className="alert alert-success bg-success bg-opacity-10 border border-success border-opacity-25 text-success small mb-4 d-flex align-items-center gap-2">
          <CheckCircle2 size={16} /> {actionMessage}
        </div>
      )}

      {/* Metrics Summary Cards */}
      <div className="row g-3 mb-5">
        <div className="col-6 col-md-4 col-lg-2">
          <div className="cinema-card p-3 h-100">
            <span className="text-secondary small d-block">Total Revenue</span>
            <span className="fs-4 fw-bold text-success font-monospace">
              ${stats?.metrics?.totalRevenue || 0}
            </span>
            <span className="text-muted d-block small" style={{ fontSize: '0.65rem' }}>Confirmed sales</span>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <div className="cinema-card p-3 h-100">
            <span className="text-secondary small d-block">Bookings</span>
            <span className="fs-4 fw-bold text-white font-monospace">
              {stats?.metrics?.totalBookings || 0}
            </span>
            <span className="text-muted d-block small" style={{ fontSize: '0.65rem' }}>
              {stats?.metrics?.cancelledBookings || 0} cancelled
            </span>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <div className="cinema-card p-3 h-100">
            <span className="text-secondary small d-block">Movies</span>
            <span className="fs-4 fw-bold text-danger font-monospace">
              {movies.length}
            </span>
            <span className="text-muted d-block small" style={{ fontSize: '0.65rem' }}>In catalogue</span>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <div className="cinema-card p-3 h-100">
            <span className="text-secondary small d-block">Theatres</span>
            <span className="fs-4 fw-bold text-white font-monospace">
              {theatres.length}
            </span>
            <span className="text-muted d-block small" style={{ fontSize: '0.65rem' }}>Active cinemas</span>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <div className="cinema-card p-3 h-100">
            <span className="text-secondary small d-block">Shows Scheduled</span>
            <span className="fs-4 fw-bold text-warning font-monospace">
              {shows.length}
            </span>
            <span className="text-muted d-block small" style={{ fontSize: '0.65rem' }}>Upcoming slots</span>
          </div>
        </div>

        <div className="col-6 col-md-4 col-lg-2">
          <div className="cinema-card p-3 h-100">
            <span className="text-secondary small d-block">Platform Mode</span>
            <span className="fs-6 fw-bold text-info">Simulation</span>
            <span className="text-muted d-block small" style={{ fontSize: '0.65rem' }}>Demo transactions</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-pills gap-2 mb-4 p-2 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('overview')}
            className={`nav-link small py-2 px-3 ${activeTab === 'overview' ? 'active bg-danger text-white' : 'text-secondary'}`}
          >
            Overview & Bookings
          </button>
        </li>
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('movies')}
            className={`nav-link small py-2 px-3 ${activeTab === 'movies' ? 'active bg-danger text-white' : 'text-secondary'}`}
          >
            Manage Movies ({movies.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('theatres')}
            className={`nav-link small py-2 px-3 ${activeTab === 'theatres' ? 'active bg-danger text-white' : 'text-secondary'}`}
          >
            Manage Theatres ({theatres.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            onClick={() => setActiveTab('shows')}
            className={`nav-link small py-2 px-3 ${activeTab === 'shows' ? 'active bg-danger text-white' : 'text-secondary'}`}
          >
            Manage Shows ({shows.length})
          </button>
        </li>
      </ul>

      {/* Tab 1: Overview & Bookings */}
      {activeTab === 'overview' && (
        <div className="cinema-card p-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <h5 className="text-white fw-bold mb-0">Global Customer Bookings</h5>
            <div className="input-group" style={{ maxWidth: 300 }}>
              <span className="input-group-text bg-dark border-secondary border-opacity-25 text-secondary">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search by ID or title..."
                className="form-control form-control-sm bg-dark text-white border-secondary border-opacity-25"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-dark table-hover small">
              <thead>
                <tr className="border-bottom border-secondary border-opacity-25 text-secondary">
                  <th>Booking ID</th>
                  <th>Movie</th>
                  <th>Auditorium</th>
                  <th>Customer</th>
                  <th>Seats</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-secondary">
                      No customer bookings found.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b._id} className="border-bottom border-secondary border-opacity-10">
                      <td className="font-monospace text-danger fw-bold">{b.bookingId}</td>
                      <td className="text-white">{b.movieSnapshot?.title}</td>
                      <td className="text-secondary">{b.theatreSnapshot?.name}</td>
                      <td className="text-secondary">{b.user?.username || 'Guest'}</td>
                      <td className="font-monospace text-white">{b.seats?.map((s) => s.seatId).join(', ')}</td>
                      <td className="font-monospace text-success fw-bold">${b.totalAmount}</td>
                      <td>
                        <span className={`badge ${b.status === 'confirmed' ? 'bg-success' : 'bg-secondary'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="text-muted">{new Date(b.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Movies */}
      {activeTab === 'movies' && (
        <div className="cinema-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="text-white fw-bold mb-0">Movie Catalogue Management</h5>
            <button
              onClick={() => setShowAddMovieModal(true)}
              className="btn btn-cinema-primary btn-sm d-flex align-items-center gap-1"
            >
              <Plus size={16} /> Add New Movie
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-dark table-hover small">
              <thead>
                <tr className="border-bottom border-secondary border-opacity-25 text-secondary">
                  <th>Poster</th>
                  <th>Title</th>
                  <th>Genres</th>
                  <th>Duration</th>
                  <th>Certification</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m._id} className="border-bottom border-secondary border-opacity-10 align-middle">
                    <td>
                      <img
                        src={m.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80'}
                        alt={m.title}
                        className="rounded object-fit-cover"
                        style={{ width: 36, height: 48 }}
                      />
                    </td>
                    <td className="text-white fw-semibold">{m.title}</td>
                    <td className="text-secondary">{m.genres?.join(', ')}</td>
                    <td className="text-secondary">{m.durationMinutes}m</td>
                    <td><span className="badge bg-dark border border-secondary">{m.certification}</span></td>
                    <td>
                      <span className={`badge ${m.status === 'now_showing' ? 'bg-danger' : 'bg-secondary'}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        onClick={() => handleDeleteMovie(m._id)}
                        className="btn btn-outline-danger btn-sm p-1"
                        title="Delete movie"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Manage Theatres */}
      {activeTab === 'theatres' && (
        <div className="cinema-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="text-white fw-bold mb-0">Theatres & Auditoriums</h5>
            <button
              onClick={() => setShowAddTheatreModal(true)}
              className="btn btn-cinema-primary btn-sm d-flex align-items-center gap-1"
            >
              <Plus size={16} /> Add New Theatre
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-dark table-hover small">
              <thead>
                <tr className="border-bottom border-secondary border-opacity-25 text-secondary">
                  <th>Identifier</th>
                  <th>Name</th>
                  <th>City</th>
                  <th>Screens Count</th>
                  <th>Amenities</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {theatres.map((t) => (
                  <tr key={t._id} className="border-bottom border-secondary border-opacity-10 align-middle">
                    <td className="font-monospace text-danger fw-bold">{t.identifier}</td>
                    <td className="text-white fw-semibold">{t.name}</td>
                    <td className="text-secondary">{t.location?.city}</td>
                    <td className="text-white">{t.screens?.length || 1} screens</td>
                    <td className="text-muted small">{t.amenities?.slice(0, 2).join(', ')}</td>
                    <td className="text-end">
                      <button
                        onClick={() => handleDeleteTheatre(t._id)}
                        className="btn btn-outline-danger btn-sm p-1"
                        title="Delete theatre"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Manage Shows */}
      {activeTab === 'shows' && (
        <div className="cinema-card p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="text-white fw-bold mb-0">Auditorium Show Schedules</h5>
            <button
              onClick={() => setShowAddShowModal(true)}
              className="btn btn-cinema-primary btn-sm d-flex align-items-center gap-1"
            >
              <Plus size={16} /> Schedule New Show
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-dark table-hover small">
              <thead>
                <tr className="border-bottom border-secondary border-opacity-25 text-secondary">
                  <th>Movie</th>
                  <th>Cinema</th>
                  <th>Screen</th>
                  <th>Start Time</th>
                  <th>Seats Total</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shows.map((s) => (
                  <tr key={s._id} className="border-bottom border-secondary border-opacity-10 align-middle">
                    <td className="text-white fw-semibold">{s.movie?.title}</td>
                    <td className="text-secondary">{s.theatre?.name}</td>
                    <td className="text-white">{s.screenName}</td>
                    <td className="text-danger fw-bold font-monospace">
                      {new Date(s.startTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="text-secondary font-monospace">{s.seats?.length || 0} seats</td>
                    <td className="text-end">
                      <button
                        onClick={() => handleDeleteShow(s._id)}
                        className="btn btn-outline-danger btn-sm p-1"
                        title="Cancel and delete show"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Movie */}
      {showAddMovieModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content cinema-card text-white">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold">Add New Movie</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddMovieModal(false)} />
              </div>
              <form onSubmit={handleCreateMovie}>
                <div className="modal-body small">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label text-secondary">Movie Title</label>
                      <input
                        type="text"
                        required
                        className="form-control bg-dark text-white border-secondary"
                        value={movieForm.title}
                        onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-secondary">Certification</label>
                      <select
                        className="form-select bg-dark text-white border-secondary"
                        value={movieForm.certification}
                        onChange={(e) => setMovieForm({ ...movieForm, certification: e.target.value })}
                      >
                        <option value="U">U</option>
                        <option value="UA">UA</option>
                        <option value="A">A</option>
                        <option value="PG-13">PG-13</option>
                        <option value="R">R</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label text-secondary">Synopsis</label>
                      <textarea
                        rows={2}
                        required
                        className="form-control bg-dark text-white border-secondary"
                        value={movieForm.description}
                        onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary">Genres (comma separated)</label>
                      <input
                        type="text"
                        required
                        className="form-control bg-dark text-white border-secondary"
                        value={movieForm.genres}
                        onChange={(e) => setMovieForm({ ...movieForm, genres: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary">Languages</label>
                      <input
                        type="text"
                        required
                        className="form-control bg-dark text-white border-secondary"
                        value={movieForm.languages}
                        onChange={(e) => setMovieForm({ ...movieForm, languages: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label text-secondary">Duration (mins)</label>
                      <input
                        type="number"
                        required
                        className="form-control bg-dark text-white border-secondary"
                        value={movieForm.durationMinutes}
                        onChange={(e) => setMovieForm({ ...movieForm, durationMinutes: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label text-secondary">Director</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        value={movieForm.director}
                        onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label text-secondary">Status</label>
                      <select
                        className="form-select bg-dark text-white border-secondary"
                        value={movieForm.status}
                        onChange={(e) => setMovieForm({ ...movieForm, status: e.target.value })}
                      >
                        <option value="now_showing">Now Showing</option>
                        <option value="upcoming">Coming Soon</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary">Poster URL (Optional)</label>
                      <input
                        type="url"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="https://..."
                        value={movieForm.posterUrl}
                        onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-secondary">Banner URL (Optional)</label>
                      <input
                        type="url"
                        className="form-control bg-dark text-white border-secondary"
                        placeholder="https://..."
                        value={movieForm.bannerUrl}
                        onChange={(e) => setMovieForm({ ...movieForm, bannerUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-cinema-secondary btn-sm" onClick={() => setShowAddMovieModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-cinema-primary btn-sm">
                    Save Movie
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Theatre */}
      {showAddTheatreModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content cinema-card text-white">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold">Add Cinema Theatre</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddTheatreModal(false)} />
              </div>
              <form onSubmit={handleCreateTheatre}>
                <div className="modal-body small">
                  <div className="mb-2">
                    <label className="form-label text-secondary">Theatre Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. IMovies Grand Central"
                      className="form-control bg-dark text-white border-secondary"
                      value={theatreForm.name}
                      onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label text-secondary">Unique Identifier</label>
                    <input
                      type="text"
                      required
                      placeholder="THTR-NY-009"
                      className="form-control bg-dark text-white border-secondary"
                      value={theatreForm.identifier}
                      onChange={(e) => setTheatreForm({ ...theatreForm, identifier: e.target.value })}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label text-secondary">Address</label>
                    <input
                      type="text"
                      required
                      className="form-control bg-dark text-white border-secondary"
                      value={theatreForm.address}
                      onChange={(e) => setTheatreForm({ ...theatreForm, address: e.target.value })}
                    />
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-8">
                      <label className="form-label text-secondary">City</label>
                      <input
                        type="text"
                        required
                        className="form-control bg-dark text-white border-secondary"
                        value={theatreForm.city}
                        onChange={(e) => setTheatreForm({ ...theatreForm, city: e.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label text-secondary">State</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary"
                        value={theatreForm.state}
                        onChange={(e) => setTheatreForm({ ...theatreForm, state: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-cinema-secondary btn-sm" onClick={() => setShowAddTheatreModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-cinema-primary btn-sm">
                    Save Theatre
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Show Schedule */}
      {showAddShowModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content cinema-card text-white">
              <div className="modal-header border-secondary border-opacity-25">
                <h5 className="modal-title fw-bold">Schedule Movie Show</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddShowModal(false)} />
              </div>
              <form onSubmit={handleCreateShow}>
                <div className="modal-body small">
                  <div className="mb-3">
                    <label className="form-label text-secondary">Select Movie</label>
                    <select
                      required
                      className="form-select bg-dark text-white border-secondary"
                      value={showForm.movie}
                      onChange={(e) => setShowForm({ ...showForm, movie: e.target.value })}
                    >
                      <option value="">-- Choose Movie --</option>
                      {movies.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.title} ({m.durationMinutes}m)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary">Select Theatre</label>
                    <select
                      required
                      className="form-select bg-dark text-white border-secondary"
                      value={showForm.theatre}
                      onChange={(e) => setShowForm({ ...showForm, theatre: e.target.value })}
                    >
                      <option value="">-- Choose Cinema --</option>
                      {theatres.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name} ({t.location?.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary">Auditorium Screen Number</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="form-control bg-dark text-white border-secondary"
                      value={showForm.screenNumber}
                      onChange={(e) => setShowForm({ ...showForm, screenNumber: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary">Start Screening Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      className="form-control bg-dark text-white border-secondary"
                      value={showForm.startTime}
                      onChange={(e) => setShowForm({ ...showForm, startTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-secondary border-opacity-25">
                  <button type="button" className="btn btn-cinema-secondary btn-sm" onClick={() => setShowAddShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-cinema-primary btn-sm">
                    Schedule Show
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
