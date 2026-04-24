const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { optionalAuth } = require('../middlewares/authMiddleware');


router.get('/', optionalAuth, productController.getAllProducts);
router.get('/:id', productController.getProductById);

module.exports = router;