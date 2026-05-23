const Review = require('../models/Review');
const Product = require('../models/Product');

// Helper to recalculate ratings for Mongoose DB
const recalculateMongooseProductRatings = async (productId) => {
  const reviews = await Review.find({ product: productId });
  
  const count = reviews.length;
  let average = 0;
  
  if (count > 0) {
    const sum = reviews.reduce((acc, rev) => acc + rev.rating, 0);
    average = Math.round((sum / count) * 10) / 10;
  }

  await Product.findByIdAndUpdate(productId, {
    ratingsAverage: average,
    ratingsCount: count
  });
};

// @desc    Add review
// @route   POST /api/reviews/:productId
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id || req.user._id;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide a rating and comment' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const reviewExists = await Review.findOne({ product: productId, user: userId });
    if (reviewExists) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      user: userId,
      product: productId,
      rating: parseInt(rating),
      comment
    });

    await recalculateMongooseProductRatings(productId);

    return res.status(201).json({ success: true, message: 'Review added successfully', review });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const productId = review.product.toString();
    await Review.findByIdAndDelete(id);

    await recalculateMongooseProductRatings(productId);

    return res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId }).populate('user', 'name avatar').sort('-createdAt');
    return res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    next(err);
  }
};
