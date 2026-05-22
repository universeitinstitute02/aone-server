const express = require('express');
const router = express.Router();
const { register, login, googleLogin, logout, getMe, forgotPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google-login', googleLogin);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.get('/me', protect, getMe);

module.exports = router;
