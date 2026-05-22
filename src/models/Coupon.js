const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please provide a coupon code'],
      unique: true,
      uppercase: true,
      trim: true
    },
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true
    },
    minPurchase: {
      type: Number,
      default: 0
    },
    expiryDate: {
      type: Date,
      required: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
