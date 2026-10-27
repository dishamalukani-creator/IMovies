import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MovieCard = ({ movie }) => {
  const { isFavorite, toggleFavorite, isAuthenticated } = useAuth();
  const favorited = isFavorite(movie._id);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please sign in to save movies to your favorites');
      return;
    }
    try {
      await toggleFavorite(movie._id);
    } catch (err) {
      alert(err.message);
    }
  };

  const poster = movie.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="col-6 col-md-4 col-lg-3 mb-4">
      <div className="cinema-card h-100 d-flex flex-column position-relative overflow-hidden group-card">
        {/* Poster Container */}
        <Link to={`/movies/${movie._id}`} className="position-relative d-block overflow-hidden" style={{ aspectRatio: '2/3' }}>
          <img
            src={poster}
            alt={movie.title}
            className="w-100 h-100 object-fit-cover transition-transform"
            style={{ transition: 'transform 0.4s ease' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80';
            }}
          />
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{
              background: 'linear-gradient(to top, rgba(10, 13, 20, 0.95) 0%, transparent 60%)',
            }}
          />

          {/* Certification Badge */}
          <span className="position-absolute top-2 start-2 badge bg-dark bg-opacity-75 border border-secondary border-opacity-50 text-white" style={{ fontSize: '0.7rem' }}>
            {movie.certification || 'UA'}
          </span>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="position-absolute top-2 end-2 btn btn-sm rounded-circle p-1 d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              width: 32,
              height: 32,
            }}
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={16} className={favorited ? 'text-danger fill-danger' : 'text-white'} fill={favorited ? '#e50914' : 'none'} />
          </button>

          {/* Rating */}
          <div className="position-absolute bottom-2 start-2 d-flex align-items-center gap-1 text-warning small fw-bold">
            <Star size={14} className="fill-warning" fill="#facc15" />
            <span>{movie.userRating?.average > 0 ? movie.userRating.average : '4.5'}</span>
            <span className="text-secondary opacity-75" style={{ fontSize: '0.7rem' }}>
              ({movie.userRating?.count || 42})
            </span>
          </div>
        </Link>

        {/* Card Body */}
        <div className="p-3 d-flex flex-column flex-grow-1">
          <Link to={`/movies/${movie._id}`} className="text-decoration-none">
            <h6 className="text-white fw-bold text-truncate mb-1 hover-red" title={movie.title}>
              {movie.title}
            </h6>
          </Link>

          <div className="d-flex align-items-center gap-2 text-secondary small mb-2">
            <span className="text-truncate">{movie.genres?.slice(0, 2).join(', ')}</span>
            <span>•</span>
            <span className="d-flex align-items-center gap-1">
              <Clock size={12} />
              {movie.durationMinutes}m
            </span>
          </div>

          <div className="mt-auto pt-2">
            <Link
              to={`/movies/${movie._id}`}
              className="btn btn-cinema-primary btn-sm w-100 d-flex align-items-center justify-content-center"
            >
              Book Tickets
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
