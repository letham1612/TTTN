const express = require('express');
const router = express.Router();
const subCategoryController = require('../controllers/subCategoryController');

// Tạo danh mục nhỏ
router.post('/', subCategoryController.createSubCategory);

// Lấy danh sách tất cả danh mục nhỏ
router.get('/', subCategoryController.getAllSubCategories);

// Lấy danh mục nhỏ theo ID
router.get('/:id', subCategoryController.getSubCategoryById);

// Lấy danh mục nhỏ theo danh mục lớn (typeId)
router.get('/by-type/:typeId', subCategoryController.getSubCategoriesByType);

// Cập nhật danh mục nhỏ
router.put('/:id', subCategoryController.updateSubCategory);

// Xóa danh mục nhỏ
router.delete('/:id', subCategoryController.deleteSubCategory);

module.exports = router;
