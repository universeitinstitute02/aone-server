const express = require('express');
const router = express.Router();
const { getStats, getCharts, getUsers, updateUserRole } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All admin routes require a verified JWT cookie

// Employee and Admin dashboard channels
router.get('/stats', authorize('admin', 'employee'), getStats);
router.get('/charts', authorize('admin', 'employee'), getCharts);

// Exclusive Admin-only security edits
router.get('/users', authorize('admin'), getUsers);
router.put('/users/:id/role', authorize('admin'), updateUserRole);

module.exports = router;
