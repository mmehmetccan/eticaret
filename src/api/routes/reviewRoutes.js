// src/api/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/add', verifyToken, reviewController.addReview);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/my-review/:productId', verifyToken, reviewController.getUserReview);

module.exports = router;