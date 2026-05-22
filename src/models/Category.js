const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a category name'],
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      unique: true
    },
    description: {
      type: String
    },
    image: {
      type: String
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Create category slug from name
CategorySchema.pre('save', function (next) {
  this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  next();
});

module.exports = mongoose.models.Category || mongoose.model('Category', CategorySchema);
