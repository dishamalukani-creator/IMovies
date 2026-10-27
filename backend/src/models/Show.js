import mongoose from 'mongoose';

const seatStatusSchema = new mongoose.Schema(
  {
    seatId: {
      type: String,
      required: true,
    },
    row: {
      type: String,
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: 'Standard',
    },
    status: {
      type: String,
      enum: ['available', 'locked', 'booked'],
      default: 'available',
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  { _id: false }
);

const showPricingSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
  },
  { _id: false }
);

const showSchema = new mongoose.Schema(
  {
    seedKey: {
      type: String,
      unique: true,
      sparse: true,
      select: false,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Theatre reference is required'],
      index: true,
    },
    screenNumber: {
      type: Number,
      required: [true, 'Screen number is required'],
    },
    screenName: {
      type: String,
      default: 'Screen 1',
    },
    startTime: {
      type: Date,
      required: [true, 'Show start time is required'],
      index: true,
    },
    endTime: {
      type: Date,
      required: [true, 'Show end time is required'],
    },
    pricing: [showPricingSchema],
    seats: [seatStatusSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding shows by movie and date
showSchema.index({ movie: 1, startTime: 1 });
showSchema.index({ theatre: 1, startTime: 1 });
showSchema.index({ 'seats.seatId': 1 });

/**
 * Returns clean seat layout availability summary
 */
showSchema.methods.getAvailabilitySummary = function () {
  const now = new Date();
  let available = 0;
  let locked = 0;
  let booked = 0;

  this.seats.forEach((seat) => {
    // Treat expired locks as available
    if (seat.status === 'locked' && seat.lockedUntil && seat.lockedUntil < now) {
      available++;
    } else if (seat.status === 'locked') {
      locked++;
    } else if (seat.status === 'booked') {
      booked++;
    } else {
      available++;
    }
  });

  return {
    totalSeats: this.seats.length,
    available,
    locked,
    booked,
  };
};

export const Show = mongoose.model('Show', showSchema);
export default Show;
