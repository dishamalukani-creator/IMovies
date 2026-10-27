import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Film, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';

export const FavoritesPage = () => {
  const { user } = useAuth();
  const favorites = user?.favorites || [];

  return (
    <div className="container py-5">
      <div className="mb-4 pb-2 border-bottom border-secondary border-opacity-25">
        <h2 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
          <Heart size={26} className="text-danger fill-danger" fill="#e50914" />
          <span>My Favorite Movies</span>
        </h2>
        <p className="text-secondary small mb-0">Your personal cinema watchlist</p>
      </div>

      {favorites.length === 0 ? (
        <div className="cinema-card p-5 text-center my-4">
          <Heart size={48} className="text-secondary mb-3 opacity-50" />
          <h5 className="text-white">Your Watchlist is Empty</h5>
          <p className="text-secondary small">
            Click the heart icon on any movie card or detail page to bookmark it here for quick access.
          </p>
          <Link to="/movies" className="btn btn-cinema-primary btn-sm mt-2">
            Discover Movies <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="row g-3">
          {favorites.map((fav) => {
            const movieObj = typeof fav === 'object' ? fav : { _id: fav, title: 'Favorited Movie' };
            return <MovieCard key={movieObj._id} movie={movieObj} />;
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
