const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/checkout', verifyToken, orderController.createOrder);

module.exports = router;