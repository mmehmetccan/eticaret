const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const statsController = require('../controllers/statsController');

router.get('/orders', verifyToken, isAdmin, adminController.getAdminOrders);
router.get('/orders/:id', verifyToken, isAdmin, adminController.getOrderDetail);
router.put('/update-status', verifyToken, isAdmin, adminController.updateOrderStatus);
router.post('/add-product', verifyToken, isAdmin, upload.single('image'), productController.addProduct);
router.put('/update-product/:id', verifyToken, isAdmin, upload.single('image'), productController.updateProduct);
router.delete('/delete-product/:id', verifyToken, isAdmin, productController.deleteProduct);
router.post('/add-product-image/:productId', verifyToken, isAdmin, upload.single('image'), productController.addProductImage);
router.delete('/delete-product-image/:imageId', verifyToken, isAdmin, productController.deleteProductImage);
router.get('/dashboard-stats', verifyToken, isAdmin, statsController.getDashboardStats);

router.post('/upload-image', verifyToken, isAdmin, upload.single('image'), productController.uploadImage);


module.exports = router;