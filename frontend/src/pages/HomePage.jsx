import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Film, 
  TrendingUp, 
  Activity, 
  RefreshCw, 
  Server, 
  Database, 
  ShieldCheck,
  Calendar,
  Play
} from 'lucide-react';
import movieService from '../services/movie.service';
import { getHealthStatus } from '../services/health.service';
import MovieCard from '../components/MovieCard';

const GENRES = ['All', 'Action', 'Sci-Fi', 'Drama', 'Adventure', 'Thriller', 'Fantasy'];

export const HomePage = ({ onStatusUpdate }) => {
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [movies, setMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Health status monitor
  const [healthData, setHealthData] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const data = await getHealthStatus();
      setHealthData(data);
      if (onStatusUpdate) onStatusUpdate(data);
    } catch (err) {
      if (onStatusUpdate) onStatusUpdate(null);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    loadMovies();
  }, [selectedGenre]);

  const loadMovies = async () => {
    setLoading(true);
    try {
      const [allMoviesRes, featuredRes] = await Promise.all([
        movieService.getMovies({ genre: selectedGenre !== 'All' ? selectedGenre : undefined }),
        movieService.getFeaturedMovies().catch(() => []),
      ]);

      setMovies(allMoviesRes.movies || []);
      setFeaturedMovies(featuredRes || []);
    } catch (err) {
      console.warn('Failed to fetch movies from API, continuing gracefully');
    } finally {
      setLoading(false);
    }
  };

  const heroMovie = featuredMovies[0] || movies[0] || {
    _id: 'default',
    title: 'Interstellar: Beyond Time',
    description: 'When Earth becomes uninhabitable, a team of explorers undertakes the most important mission in human history.',
    bannerUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&auto=format&fit=crop&q=80',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    certification: 'PG-13',
    durationMinutes: 169,
  };

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Cinematic Hero Section */}
      <section className="position-relative overflow-hidden" style={{ minHeight: '65vh', maxHeight: '750px' }}>
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundImage: `url(${heroMovie.bannerUrl || heroMovie.posterUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.4) saturate(1.2)',
          }}
        />
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background: 'linear-gradient(to right, #0a0d14 15%, rgba(10,13,20,0.85) 50%, rgba(10,13,20,0.4) 100%), linear-gradient(to top, #0a0d14 0%, transparent 60%)',
          }}
        />

        <div className="container position-relative py-5 d-flex flex-column justify-content-center" style={{ minHeight: '65vh' }}>
          <div className="col-lg-7 py-4">
            <div className="badge-cinema mb-3">
              <Sparkles size={14} /> Spotlight Premiere
            </div>
            <h1 className="display-4 fw-black text-white lh-1 mb-3">
              {heroMovie.title}
            </h1>
            <div className="d-flex align-items-center gap-3 text-secondary small mb-3">
              <span className="badge bg-danger text-white">{heroMovie.certification || 'UA'}</span>
              <span>{heroMovie.genres?.join(', ')}</span>
              <span>•</span>
              <span>{heroMovie.durationMinutes} Minutes</span>
            </div>
            <p className="lead text-secondary mb-4" style={{ maxWidth: '600px', fontSize: '1.05rem' }}>
              {heroMovie.description}
            </p>
            <div className="d-flex flex-wrap gap-3">
              {heroMovie._id !== 'default' ? (
                <Link to={`/movies/${heroMovie._id}`} className="btn btn-cinema-primary btn-lg">
                  <Film size={20} /> Book Tickets Now
                </Link>
              ) : (
                <Link to="/movies" className="btn btn-cinema-primary btn-lg">
                  <Film size={20} /> Browse All Movies
                </Link>
              )}
              <Link to="/movies" className="btn btn-cinema-secondary btn-lg">
                Explore Shows
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container py-5">
        {/* Search & Genre Filters */}
        <div className="row g-3 align-items-center justify-content-between mb-4">
          <div className="col-md-6 col-lg-5">
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary border-opacity-25 text-secondary">
                <Search size={18} />
              </span>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary border-opacity-25"
                placeholder="Search movies, directors, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-6 col-lg-7 d-flex flex-wrap justify-content-md-end gap-2">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`btn btn-sm ${
                  selectedGenre === genre ? 'btn-cinema-primary' : 'btn-cinema-secondary'
                } py-1 px-3`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Movies Grid */}
        <div className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h3 className="text-white fw-bold d-flex align-items-center gap-2 mb-0">
              <TrendingUp size={24} className="text-danger" />
              <span>Now Showing</span>
            </h3>
            <Link to="/movies" className="text-danger text-decoration-none small fw-semibold">
              View All Movies →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" role="status" />
              <div className="text-secondary small mt-2">Loading cinema listings...</div>
            </div>
          ) : filteredMovies.length === 0 ? (
            <div className="cinema-card p-5 text-center my-4">
              <Film size={48} className="text-secondary mb-3 opacity-50" />
              <h5 className="text-white">No Movies Found</h5>
              <p className="text-secondary small">
                {searchQuery
                  ? `No matches for "${searchQuery}". Try different keywords.`
                  : 'Run "npm run seed" to populate realistic demo movies and scheduled shows.'}
              </p>
              <Link to="/movies" className="btn btn-cinema-secondary btn-sm mt-2">
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="row g-3">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          )}
        </div>

        {/* System Health & Architecture Monitor */}
        <div className="cinema-card p-4 mb-4">
          <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary border-opacity-25 pb-3">
            <div>
              <h5 className="text-white mb-1 d-flex align-items-center gap-2">
                <Server size={18} className="text-danger" />
                <span>IMovies Real-time System Status</span>
              </h5>
              <p className="text-secondary small mb-0">
                Connected to backend API and live Socket.IO synchronizer
              </p>
            </div>
            <button
              onClick={fetchHealth}
              disabled={healthLoading}
              className="btn btn-cinema-secondary btn-sm"
            >
              <RefreshCw size={14} className={healthLoading ? 'spin-animation' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="row g-3">
            <div className="col-md-4">
              <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="text-secondary small">API SERVER</span>
                  {healthData ? (
                    <span className="badge badge-status-online">ONLINE</span>
                  ) : (
                    <span className="badge badge-status-offline">DISCONNECTED</span>
                  )}
                </div>
                <div className="text-white fw-bold">{healthData?.service || 'imovies-backend'}</div>
                <div className="text-secondary small">
                  Uptime: {healthData ? `${healthData.uptimeSeconds}s` : 'N/A'} • {healthData?.environment || 'dev'}
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="text-secondary small">DATABASE (MONGODB)</span>
                  {healthData?.database?.status === 'connected' ? (
                    <span className="badge badge-status-online">CONNECTED</span>
                  ) : (
                    <span className="badge badge-status-degraded">
                      {healthData?.database?.status ? healthData.database.status.toUpperCase() : 'DEGRADED'}
                    </span>
                  )}
                </div>
                <div className="text-white fw-bold d-flex align-items-center gap-2">
                  <Database size={16} className="text-warning" />
                  <span>{healthData?.database?.name || 'imovies'}</span>
                </div>
                <div className="text-secondary small">
                  Host: {healthData?.database?.host || 'localhost:27017'}
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <span className="text-secondary small">REAL-TIME SEATS</span>
                  <span className="badge badge-status-online">SOCKET.IO ACTIVE</span>
                </div>
                <div className="text-white fw-bold d-flex align-items-center gap-2">
                  <ShieldCheck size={16} className="text-success" />
                  <span>Server-Authoritative</span>
                </div>
                <div className="text-secondary small">
                  Dynamic seat locks & concurrent conflict prevention
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
