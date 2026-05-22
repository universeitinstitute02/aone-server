const express = require('express');
const router = express.Router();
const {
  addReview,
  deleteReview,
  getProductReviews
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/product/:productId', getProductReviews);

// Protected reviewer interactions
router.post('/:productId', protect, addReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
