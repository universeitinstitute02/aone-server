const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true
    },
    slug: {
      type: String,
      unique: true
    },
    sku: {
      type: String,
      required: [true, 'Please add an SKU (Stock Keeping Unit)'],
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    specifications: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true }
      }
    ],
    benefits: [String],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true
    },
    price: {
      type: Number,
      required: [true, 'Please add a price']
    },
    discountPrice: {
      type: Number,
      default: null
    },
    stock: {
      type: Number,
      required: [true, 'Please add stock level'],
      default: 0
    },
    images: {
      type: [String],
      default: []
    },
    ratingsAverage: {
      type: Number,
      default: 0
    },
    ratingsCount: {
      type: Number,
      default: 0
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

ProductSchema.pre('save', function (next) {
  this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  next();
});

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
