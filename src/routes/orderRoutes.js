const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All order routes require authentication

router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrder);

// Privilege Dispatch and Logistics Updates
router.get('/', authorize('admin', 'employee'), getOrders);
router.put('/:id/status', authorize('admin', 'employee'), updateOrderStatus);

module.exports = router;
