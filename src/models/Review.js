const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Please provide a comment']
    }
  },
  { timestamps: true }
);

// Prevent user from submitting more than one review per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
