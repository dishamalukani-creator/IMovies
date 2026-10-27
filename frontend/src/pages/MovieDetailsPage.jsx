import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Clock, 
  Calendar, 
  Heart, 
  Film, 
  MapPin, 
  MessageSquare, 
  Share2, 
  AlertCircle,
  CheckCircle2,
  Ticket
} from 'lucide-react';
import movieService from '../services/movie.service';
import { useAuth } from '../context/AuthContext';

export const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isFavorite, toggleFavorite, user } = useAuth();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState(0); // 0: today, 1: tomorrow, 2: day after
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review form state
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(null);

  useEffect(() => {
    loadMovieDetails();
  }, [id]);

  const loadMovieDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await movieService.getMovie(id);
      setMovie(res.movie);
      setShows(res.shows || []);
    } catch (err) {
      setError(err.message || 'Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to add movies to your favorites');
      return;
    }
    try {
      await toggleFavorite(movie._id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to submit a review');
      return;
    }
    if (!commentInput.trim()) return;

    setReviewSubmitting(true);
    try {
      const updatedMovie = await movieService.addReview(movie._id, {
        rating: ratingInput,
        comment: commentInput.trim(),
      });
      setMovie(updatedMovie);
      setCommentInput('');
      setReviewSuccess('Your review has been published!');
      setTimeout(() => setReviewSuccess(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-danger" role="status" />
        <div className="text-secondary small mt-2">Loading movie details and showtimes...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '60vh' }}>
        <div className="cinema-card p-5 mx-auto" style={{ maxWidth: 500 }}>
          <AlertCircle size={48} className="text-danger mb-3" />
          <h4 className="text-white">Movie Not Found</h4>
          <p className="text-secondary small">{error || 'This movie listing could not be retrieved.'}</p>
          <Link to="/movies" className="btn btn-cinema-secondary btn-sm mt-3">
            Browse All Movies
          </Link>
        </div>
      </div>
    );
  }

  // Date filters (Today, Tomorrow, Day+2)
  const now = new Date();
  const availableDates = [0, 1, 2].map((offset) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    return {
      offset,
      dateString: d.toISOString().split('T')[0],
      dayName: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      formatted: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  const activeDateTarget = availableDates[selectedDate].dateString;

  // Filter shows by selected date
  const filteredShows = shows.filter((s) => {
    const showDate = new Date(s.startTime).toISOString().split('T')[0];
    return showDate === activeDateTarget;
  });

  // Group shows by Theatre
  const showsByTheatre = {};
  filteredShows.forEach((s) => {
    const theatreId = s.theatre._id;
    if (!showsByTheatre[theatreId]) {
      showsByTheatre[theatreId] = {
        theatre: s.theatre,
        shows: [],
      };
    }
    showsByTheatre[theatreId].shows.push(s);
  });

  const favorited = isFavorite(movie._id);

  return (
    <div>
      {/* Movie Hero Header with Backdrop */}
      <section className="position-relative overflow-hidden" style={{ minHeight: '480px' }}>
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundImage: `url(${movie.bannerUrl || movie.posterUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 25%',
            filter: 'brightness(0.25) saturate(1.2)',
          }}
        />
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background: 'linear-gradient(to top, #0a0d14 0%, rgba(10,13,20,0.8) 60%, rgba(10,13,20,0.4) 100%)',
          }}
        />

        <div className="container position-relative py-5">
          <div className="row g-4 align-items-end">
            {/* Poster */}
            <div className="col-md-4 col-lg-3 text-center text-md-start">
              <div className="cinema-card overflow-hidden shadow-lg mx-auto" style={{ maxWidth: 260, aspectRatio: '2/3' }}>
                <img
                  src={movie.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80'}
                  alt={movie.title}
                  className="w-100 h-100 object-fit-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="col-md-8 col-lg-9">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                <span className="badge bg-danger text-white">{movie.certification || 'UA'}</span>
                <span className="badge bg-dark border border-secondary text-secondary">
                  {movie.languages?.join(', ')}
                </span>
                <span className="text-secondary small d-flex align-items-center gap-1">
                  <Clock size={14} /> {movie.durationMinutes} mins
                </span>
                <span className="text-secondary small d-flex align-items-center gap-1">
                  <Calendar size={14} /> {new Date(movie.releaseDate).toLocaleDateString()}
                </span>
              </div>

              <h1 className="display-5 fw-bold text-white mb-2">{movie.title}</h1>

              {/* Rating & Actions */}
              <div className="d-flex flex-wrap align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center gap-1 text-warning fw-bold fs-5">
                  <Star size={20} className="fill-warning" fill="#facc15" />
                  <span>{movie.userRating?.average > 0 ? movie.userRating.average : '4.6'}</span>
                  <span className="text-secondary small fw-normal">
                    ({movie.userRating?.count || 48} reviews)
                  </span>
                </div>

                <button
                  onClick={handleFavoriteToggle}
                  className="btn btn-cinema-secondary btn-sm d-flex align-items-center gap-2"
                >
                  <Heart size={16} className={favorited ? 'text-danger fill-danger' : 'text-white'} fill={favorited ? '#e50914' : 'none'} />
                  <span>{favorited ? 'In Favorites' : 'Add to Favorites'}</span>
                </button>
              </div>

              {/* Genres */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                {movie.genres?.map((g) => (
                  <span key={g} className="badge bg-secondary bg-opacity-25 text-white-50 border border-secondary border-opacity-25 px-3 py-1">
                    {g}
                  </span>
                ))}
              </div>

              <p className="text-secondary mb-0" style={{ maxWidth: '800px', lineHeight: 1.6 }}>
                {movie.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <div className="container py-5">
        <div className="row g-5">
          {/* Left Column: Showtimes Selector */}
          <div className="col-lg-8">
            <div className="d-flex align-items-center justify-content-between mb-4 border-bottom border-secondary border-opacity-25 pb-3">
              <h3 className="text-white fw-bold d-flex align-items-center gap-2 mb-0">
                <Ticket size={24} className="text-danger" />
                <span>Select Date & Showtimes</span>
              </h3>
            </div>

            {/* Date Tabs */}
            <div className="d-flex gap-2 overflow-auto pb-3 mb-4">
              {availableDates.map((item) => (
                <button
                  key={item.offset}
                  onClick={() => setSelectedDate(item.offset)}
                  className={`btn p-3 text-start rounded border text-nowrap ${
                    selectedDate === item.offset
                      ? 'btn-danger border-danger text-white'
                      : 'btn-dark bg-opacity-50 border-secondary border-opacity-25 text-secondary'
                  }`}
                  style={{ minWidth: 120 }}
                >
                  <div className="small fw-semibold">{item.dayName}</div>
                  <div className="fs-5 fw-bold text-white">{item.formatted}</div>
                </button>
              ))}
            </div>

            {/* Theatres & Shows */}
            {Object.keys(showsByTheatre).length === 0 ? (
              <div className="cinema-card p-4 text-center my-4">
                <Clock size={36} className="text-secondary mb-2 opacity-50" />
                <h5 className="text-white">No Showtimes Scheduled for this Date</h5>
                <p className="text-secondary small mb-0">
                  Please select another date tab or check back soon for updated auditorium schedules.
                </p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-4">
                {Object.values(showsByTheatre).map(({ theatre, shows: tShows }) => (
                  <div key={theatre._id} className="cinema-card p-4">
                    <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3 border-bottom border-secondary border-opacity-25 pb-3">
                      <div>
                        <h5 className="text-white fw-bold mb-1">{theatre.name}</h5>
                        <div className="text-secondary small d-flex align-items-center gap-1">
                          <MapPin size={14} className="text-danger" />
                          <span>{theatre.location.address}, {theatre.location.city}</span>
                        </div>
                      </div>

                      {theatre.amenities && theatre.amenities.length > 0 && (
                        <div className="d-flex flex-wrap gap-1">
                          {theatre.amenities.slice(0, 2).map((a) => (
                            <span key={a} className="badge bg-dark text-secondary border border-secondary border-opacity-25" style={{ fontSize: '0.65rem' }}>
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Showtimes Pills */}
                    <div className="d-flex flex-wrap gap-3">
                      {tShows.map((s) => {
                        const timeStr = new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const minPrice = s.pricing && s.pricing.length > 0
                          ? Math.min(...s.pricing.map((p) => p.price))
                          : 200;

                        return (
                          <Link
                            key={s._id}
                            to={`/shows/${s._id}/seats`}
                            className="btn btn-cinema-secondary text-start p-2 px-3 text-decoration-none group-slot"
                            style={{ minWidth: 130 }}
                          >
                            <div className="fs-6 fw-bold text-white text-danger-hover">
                              {timeStr}
                            </div>
                            <div className="text-secondary small d-flex justify-content-between gap-2">
                              <span>{s.screenName}</span>
                              <span className="text-success font-monospace">${minPrice}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Cast & Reviews */}
          <div className="col-lg-4">
            {/* Cast & Crew Card */}
            <div className="cinema-card p-4 mb-4">
              <h5 className="text-white fw-bold mb-3 border-bottom border-secondary border-opacity-25 pb-2">
                Movie Details
              </h5>
              <div className="mb-3">
                <span className="text-secondary small d-block">Director</span>
                <span className="text-white fw-medium">{movie.director || 'Christopher Nolan'}</span>
              </div>
              <div className="mb-3">
                <span className="text-secondary small d-block">Starring Cast</span>
                <div className="d-flex flex-wrap gap-1 mt-1">
                  {movie.cast?.map((actor) => (
                    <span key={actor} className="badge bg-dark text-secondary border border-secondary border-opacity-25">
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews Card */}
            <div className="cinema-card p-4">
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center justify-content-between border-bottom border-secondary border-opacity-25 pb-2">
                <span>Reviews & Ratings</span>
                <span className="badge bg-danger bg-opacity-25 text-danger small">
                  {movie.reviews?.length || 0}
                </span>
              </h5>

              {/* Submit Review Form */}
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="mb-4">
                  {reviewSuccess && (
                    <div className="alert alert-success bg-success bg-opacity-10 text-success small py-2 mb-2 d-flex align-items-center gap-1">
                      <CheckCircle2 size={16} /> {reviewSuccess}
                    </div>
                  )}
                  <div className="mb-2">
                    <label className="text-secondary small fw-semibold">Your Rating</label>
                    <div className="d-flex gap-2 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingInput(star)}
                          className="btn btn-sm p-1 border-0"
                        >
                          <Star
                            size={20}
                            className={star <= ratingInput ? 'text-warning fill-warning' : 'text-secondary'}
                            fill={star <= ratingInput ? '#facc15' : 'none'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-2">
                    <textarea
                      rows={2}
                      required
                      placeholder="Write your review thoughts..."
                      className="form-control bg-dark text-white border-secondary border-opacity-25 small"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={reviewSubmitting || !commentInput.trim()}
                    className="btn btn-cinema-primary btn-sm w-100"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              ) : (
                <div className="p-3 rounded bg-dark border border-secondary border-opacity-25 text-center small text-secondary mb-4">
                  <Link to="/login" className="text-danger text-decoration-none fw-semibold">
                    Sign in
                  </Link>{' '}
                  to write a review.
                </div>
              )}

              {/* Reviews List */}
              <div className="d-flex flex-column gap-3 overflow-auto" style={{ maxHeight: 360 }}>
                {(!movie.reviews || movie.reviews.length === 0) ? (
                  <p className="text-secondary small text-center my-3">
                    No reviews submitted yet. Be the first to review!
                  </p>
                ) : (
                  movie.reviews.map((r, idx) => (
                    <div key={idx} className="p-2 border-bottom border-secondary border-opacity-25">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="text-white fw-semibold small">{r.username}</span>
                        <div className="d-flex text-warning">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star key={i} size={12} className="fill-warning" fill="#facc15" />
                          ))}
                        </div>
                      </div>
                      <p className="text-secondary small mb-1">{r.comment}</p>
                      <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;
