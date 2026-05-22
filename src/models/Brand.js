const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a brand name'],
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      unique: true
    },
    logo: {
      type: String
    },
    description: {
      type: String
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

BrandSchema.pre('save', function (next) {
  this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  next();
});

module.exports = mongoose.models.Brand || mongoose.model('Brand', BrandSchema);
