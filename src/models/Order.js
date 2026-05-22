const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true }
      }
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    billingAddress: {
      street: String,
      city: String,
      postalCode: String,
      country: String
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'cod', 'bank'],
      default: 'cod'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    subtotal: {
      type: Number,
      required: true
    },
    shippingCost: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    couponCode: {
      type: String,
      default: null
    },
    trackingId: {
      type: String,
      required: true,
      unique: true
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model('Order', OrderSchema);
