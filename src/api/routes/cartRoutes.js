const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController'); // EKLE
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, cartController.getCart);
router.post('/add', verifyToken, cartController.addToCart);
router.delete('/:productId', verifyToken, cartController.removeFromCart);
router.post('/checkout', verifyToken, orderController.createOrder); // DEĞİŞTİR

module.exports = router;