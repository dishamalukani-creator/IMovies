import mongoose from 'mongoose';

const seatCategorySchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Platinum', 'Gold', 'Silver', 'Standard', 'VIP'],
    required: true,
  },
  rows: {
    type: [String],
    required: true,
  },
  basePrice: {
    type: Number,
    required: true,
    min: [0, 'Base price cannot be negative'],
  },
});

const screenSchema = new mongoose.Schema({
  screenNumber: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  seatingLayout: {
    rows: {
      type: [String],
      default: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    },
    columnsPerRow: {
      type: Number,
      default: 12,
      min: [4, 'Must have at least 4 seats per row'],
      max: [30, 'Cannot exceed 30 seats per row'],
    },
    aisles: {
      type: [Number],
      default: [4, 8], // Gap after column 4 and column 8
    },
    seatCategories: [seatCategorySchema],
  },
});

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
      index: true,
    },
    identifier: {
      type: String,
      required: [true, 'Theatre identifier is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        index: true,
      },
      state: {
        type: String,
        trim: true,
        default: '',
      },
      zipCode: {
        type: String,
        trim: true,
        default: '',
      },
    },
    screens: [screenSchema],
    amenities: {
      type: [String],
      default: ['Air Conditioning', 'Surround Sound', 'Concessions'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Theatre = mongoose.model('Theatre', theatreSchema);
export default Theatre;
