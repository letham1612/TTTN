// routes/products.route.js
const express = require('express');
const router = express.Router();
const ProductsController = require('../controllers/ProductCtrl');
// const authMiddleware = require('../middlewares/authMiddleware')

router.get('/type/:type', ProductsController.getProductsByType);
router.post('/', ProductsController.createProduct);
router.get('/', ProductsController.getAllProducts);
router.get('/types/:id',  ProductsController.getProductById);
router.put('/:id', ProductsController.updateProduct);
router.delete('/:id', ProductsController.deleteProduct);
router.get('/featured', ProductsController.getFeaturedProducts); // API lấy sản phẩm nổi bật


module.exports = router;