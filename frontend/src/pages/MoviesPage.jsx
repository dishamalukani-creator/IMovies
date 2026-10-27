import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Film, Search, Filter } from 'lucide-react';
import movieService from '../services/movie.service';
import MovieCard from '../components/MovieCard';

const GENRES = ['All', 'Action', 'Sci-Fi', 'Drama', 'Adventure', 'Thriller', 'Fantasy', 'Music'];

export const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'now_showing';

  const [movies, setMovies] = useState([]);
  const [status, setStatus] = useState(initialStatus);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    loadMovies();
  }, [status, selectedGenre]);

  const loadMovies = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await movieService.getMovies({
        status,
        genre: selectedGenre !== 'All' ? selectedGenre : undefined,
      });
      setMovies(res.movies || []);
    } catch (err) {
      console.warn('Failed to load movies:', err.message);
      setLoadError(err.message || 'Unable to load movies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setSearchParams({ status: newStatus });
  };

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.director?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-5">
      {/* Title & Tabs */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 pb-2 border-bottom border-secondary border-opacity-25">
        <div>
          <h2 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
            <Film size={26} className="text-danger" />
            <span>Movie Catalogue</span>
          </h2>
          <p className="text-secondary small mb-0">Browse active cinema screenings and upcoming blockbusters</p>
        </div>

        {/* Status Toggle */}
        <div className="btn-group p-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <button
            onClick={() => handleStatusChange('now_showing')}
            className={`btn btn-sm ${status === 'now_showing' ? 'btn-danger' : 'btn-dark text-secondary'} px-3`}
          >
            Now Showing
          </button>
          <button
            onClick={() => handleStatusChange('upcoming')}
            className={`btn btn-sm ${status === 'upcoming' ? 'btn-danger' : 'btn-dark text-secondary'} px-3`}
          >
            Coming Soon
          </button>
        </div>
      </div>

      {/* Search & Genre Filter Bar */}
      <div className="row g-3 align-items-center mb-4">
        <div className="col-md-5">
          <div className="input-group">
            <span className="input-group-text bg-dark border-secondary border-opacity-25 text-secondary">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control bg-dark text-white border-secondary border-opacity-25"
              placeholder="Search by title, director, or cast..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-7 d-flex flex-wrap gap-2 justify-content-md-end">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`btn btn-sm ${selectedGenre === g ? 'btn-cinema-primary' : 'btn-cinema-secondary'} py-1 px-3`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Movies Listing */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status" />
          <div className="text-secondary small mt-2">Fetching movies...</div>
        </div>
      ) : loadError ? (
        <div className="cinema-card p-5 text-center my-4" role="alert">
          <Film size={48} className="text-danger mb-3 opacity-75" />
          <h5 className="text-white">Unable to Load Movies</h5>
          <p className="text-secondary small">{loadError}</p>
          <button type="button" className="btn btn-cinema-primary btn-sm mt-3" onClick={loadMovies}>
            Try Again
          </button>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="cinema-card p-5 text-center my-4">
          <Film size={48} className="text-secondary mb-3 opacity-50" />
          <h5 className="text-white">No Movies Found</h5>
          <p className="text-secondary small">
            {searchQuery
              ? `No movies match "${searchQuery}".`
              : 'No movies are currently listed in this category.'}
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
