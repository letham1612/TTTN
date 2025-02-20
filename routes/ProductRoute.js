// routes/products.route.js
const express = require('express');
const router = express.Router();
const ProductsController = require('../controllers/ProductCtrl');
// const authMiddleware = require('../middlewares/authMiddleware')

// Định nghĩa tuyến đường để lấy sản phẩm theo subCategoryId
router.get('/subcategory/:subCategoryId', ProductsController.getProductsBySubCategory) // lấy danh sách sản phẩm theo danh mục con
router.post('/', ProductsController.createProduct);
router.get('/', ProductsController.getAllProducts);
router.put('/:id', ProductsController.updateProduct);
router.delete('/:id', ProductsController.deleteProduct);
router.get('/types/:id',  ProductsController.getProductById);
router.get('/bytypes/:typeId', ProductsController.getProductsByType);  // lấy danh sách sản phẩm theo danh mục cha
router.get('/brands/:brandId', ProductsController.getProductsByBrand); //lấy danh sách sp theo brand
router.get('/featured', ProductsController.getFeaturedProducts); // API lấy sản phẩm nổi bật


module.exports = router;