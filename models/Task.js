const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    budget: { type: Number, required: true, min: 1 },
    contactEmail: { type: String, required: true, trim: true, lowercase: true },
    contactPhone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator(v) {
          const digits = v.replace(/\s/g, '');
          return /^\+94\d{9}$/.test(digits);
        },
        message: 'Phone must be Sri Lankan format: +94 followed by 9 digits (e.g. +94771234567)',
      },
    },
    status: {
      type: String,
      enum: ['Available', 'Hired', 'In Progress', 'Completed'],
      default: 'Available',
    },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hiredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    hiredAt: { type: Date, default: null },
    ratings: [ratingSchema],
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

taskSchema.methods.recalculateRating = function recalculateRating() {
  if (!this.ratings.length) {
    this.averageRating = 0;
    this.ratingCount = 0;
    return;
  }
  const total = this.ratings.reduce((sum, r) => sum + r.stars, 0);
  this.ratingCount = this.ratings.length;
  this.averageRating = Math.round((total / this.ratingCount) * 10) / 10;
};

taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
