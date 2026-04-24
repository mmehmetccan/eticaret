// src/api/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Kayıt ve Giriş (Public)
router.post('/register', userController.register);
router.post('/login', userController.login);


router.post('/verify-email', userController.verifyEmail);
router.post('/resend-verification', userController.resendVerificationCode);
router.get('/verification-status/:email', userController.checkVerificationStatus);

// Şifre Sıfırlama (Public)
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Profil ve Siparişler (Private - Token Gerekli)
router.get('/profile', verifyToken, userController.getProfile);
router.put('/update-profile', verifyToken, userController.updateProfile);
router.get('/my-orders', verifyToken, userController.getMyOrders);

// Favoriler
router.post('/favorites/toggle', verifyToken, userController.toggleFavorite);
router.get('/favorites', verifyToken, userController.getFavorites);
router.get('/favorites/check/:productId', verifyToken, userController.checkFavorite);

module.exports = router;