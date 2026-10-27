import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating must be at least 1 star'],
    max: [5, 'Rating cannot exceed 5 stars'],
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
      trim: true,
    },
    genres: {
      type: [String],
      required: [true, 'At least one genre is required'],
      index: true,
    },
    languages: {
      type: [String],
      required: [true, 'At least one language is required'],
      default: ['English'],
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required'],
    },
    certification: {
      type: String,
      enum: ['G', 'PG', 'PG-13', 'R', 'NC-17', 'U', 'UA', 'A'],
      default: 'UA',
    },
    posterUrl: {
      type: String,
      default: '',
    },
    bannerUrl: {
      type: String,
      default: '',
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    director: {
      type: String,
      trim: true,
      default: '',
    },
    cast: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['now_showing', 'upcoming', 'archived'],
      default: 'now_showing',
      index: true,
    },
    userRating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    reviews: [reviewSchema],
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Slug generator pre-save hook
movieSchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }
  next();
});

// Method to calculate and update average rating
movieSchema.methods.updateRatingSummary = function () {
  if (!this.reviews || this.reviews.length === 0) {
    this.userRating.average = 0;
    this.userRating.count = 0;
  } else {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.userRating.count = this.reviews.length;
    this.userRating.average = Math.round((sum / this.reviews.length) * 10) / 10;
  }
};

export const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
