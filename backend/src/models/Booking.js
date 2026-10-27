import mongoose from 'mongoose';

const bookedSeatSchema = new mongoose.Schema(
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
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show reference is required'],
      index: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
    },
    movieSnapshot: {
      title: { type: String, required: true },
      posterUrl: { type: String, default: '' },
      durationMinutes: { type: Number, default: 120 },
      certification: { type: String, default: 'UA' },
    },
    theatreSnapshot: {
      name: { type: String, required: true },
      city: { type: String, required: true },
      screenName: { type: String, default: 'Screen 1' },
    },
    showTime: {
      type: Date,
      required: [true, 'Show time is required'],
    },
    seats: {
      type: [bookedSeatSchema],
      validate: [(val) => val.length > 0, 'Booking must include at least one seat'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative'],
    },
    convenienceFee: {
      type: Number,
      required: true,
      default: 0,
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
    paymentDetails: {
      method: {
        type: String,
        default: 'DEMO_SIMULATION',
      },
      status: {
        type: String,
        enum: ['simulated_paid', 'refunded'],
        default: 'simulated_paid',
      },
      transactionId: {
        type: String,
        required: true,
      },
      paidAt: {
        type: Date,
        default: Date.now,
      },
      disclaimer: {
        type: String,
        default: 'DEMO SIMULATION: Testing transaction. No real credit card was charged.',
      },
    },
    cancellation: {
      cancelledAt: { type: Date, default: null },
      reason: { type: String, default: '' },
      refundAmount: { type: Number, default: 0 },
      refundStatus: {
        type: String,
        enum: ['none', 'simulated_refunded'],
        default: 'none',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user bookings query
bookingSchema.index({ user: 1, createdAt: -1 });

export const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
