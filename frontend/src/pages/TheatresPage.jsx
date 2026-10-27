import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Film, Sparkles, Clock, Search } from 'lucide-react';
import theatreService from '../services/theatre.service';

export const TheatresPage = () => {
  const [theatres, setTheatres] = useState([]);
  const [selectedCity, setSelectedCity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheatres();
  }, [selectedCity]);

  const loadTheatres = async () => {
    setLoading(true);
    try {
      const data = await theatreService.getTheatres({
        city: selectedCity !== 'All' ? selectedCity : undefined,
      });
      setTheatres(data || []);
    } catch (err) {
      console.warn('Failed to load theatres:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const cities = ['All', ...new Set(theatres.map((t) => t.location?.city).filter(Boolean))];

  const filteredTheatres = theatres.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.location?.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.location?.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 pb-2 border-bottom border-secondary border-opacity-25">
        <div>
          <h2 className="text-white fw-bold mb-1 d-flex align-items-center gap-2">
            <Film size={26} className="text-danger" />
            <span>Cinemas & Theatres</span>
          </h2>
          <p className="text-secondary small mb-0">Experience world-class IMAX and Dolby Atmos auditoriums</p>
        </div>

        {/* City Filter Pills */}
        <div className="d-flex flex-wrap gap-2">
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`btn btn-sm ${selectedCity === city ? 'btn-cinema-primary' : 'btn-cinema-secondary'} py-1 px-3`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-dark border-secondary border-opacity-25 text-secondary">
              <Search size={16} />
            </span>
            <input
              type="text"
              className="form-control bg-dark text-white border-secondary border-opacity-25"
              placeholder="Search by cinema name, location, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Theatres Listing */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status" />
          <div className="text-secondary small mt-2">Loading theatres...</div>
        </div>
      ) : filteredTheatres.length === 0 ? (
        <div className="cinema-card p-5 text-center my-4">
          <MapPin size={48} className="text-secondary mb-3 opacity-50" />
          <h5 className="text-white">No Theatres Found</h5>
          <p className="text-secondary small">
            {searchQuery
              ? `No cinemas match "${searchQuery}".`
              : 'No cinemas are currently listed in this city.'}
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredTheatres.map((theatre) => (
            <div key={theatre._id} className="col-lg-6">
              <div className="cinema-card p-4 h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h4 className="text-white fw-bold mb-1">{theatre.name}</h4>
                  <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25 font-monospace">
                    {theatre.identifier}
                  </span>
                </div>

                <div className="text-secondary small d-flex align-items-center gap-1 mb-3">
                  <MapPin size={14} className="text-danger" />
                  <span>
                    {theatre.location?.address}, {theatre.location?.city}, {theatre.location?.state}
                  </span>
                </div>

                {/* Screens */}
                <div className="mb-3">
                  <span className="text-secondary small d-block mb-1 fw-semibold">Auditoriums & Screens:</span>
                  <div className="d-flex flex-wrap gap-2">
                    {theatre.screens?.map((screen) => (
                      <span key={screen.screenNumber} className="badge bg-dark border border-secondary text-white py-2 px-3">
                        {screen.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                {theatre.amenities && theatre.amenities.length > 0 && (
                  <div className="mb-4">
                    <span className="text-secondary small d-block mb-1 fw-semibold">Featured Amenities:</span>
                    <div className="d-flex flex-wrap gap-1">
                      {theatre.amenities.map((amenity) => (
                        <span key={amenity} className="badge bg-secondary bg-opacity-25 text-white-50 border border-secondary border-opacity-25">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                  <span className="text-secondary small">Active Digital Ticketing</span>
                  <Link to="/movies" className="btn btn-cinema-primary btn-sm">
                    View Showtimes →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TheatresPage;
