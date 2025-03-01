const SubCategory = require('../models/SubCategoryModel');
const Type = require('../models/TypeModel');

// Thêm danh mục nhỏ mới
exports.createSubCategory = async (req, res) => {
    try {
        const { name, typeId } = req.body;

        // Kiểm tra xem danh mục lớn có tồn tại không
        const existingType = await Type.findById(typeId);
        if (!existingType) {
            return res.status(400).json({ message: 'Danh mục lớn không tồn tại' });
        }

        // Kiểm tra trùng lặp danh mục nhỏ
        const existingSubCategory = await SubCategory.findOne({ name, typeId });
        if (existingSubCategory) {
            return res.status(400).json({ message: 'Danh mục nhỏ này đã tồn tại trong danh mục lớn này' });
        }

        const subCategory = new SubCategory({ name, typeId });
        await subCategory.save();

        res.status(201).json({ message: 'Thêm danh mục nhỏ thành công', subCategory });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi thêm danh mục nhỏ', error: error.message });
    }
};

// Lấy danh sách tất cả danh mục nhỏ
exports.getAllSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find().populate('typeId', 'name');
        res.status(200).json(subCategories);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh mục nhỏ', error: error.message });
    }
};

// Lấy danh mục nhỏ theo ID
exports.getSubCategoryById = async (req, res) => {
    try {
        const subCategory = await SubCategory.findById(req.params.id).populate('typeId', 'name');
        if (!subCategory) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục nhỏ' });
        }
        res.status(200).json(subCategory);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh mục nhỏ', error: error.message });
    }
};

// Lấy danh sách danh mục nhỏ theo danh mục lớn
exports.getSubCategoriesByType = async (req, res) => {
    try {
        const { typeId } = req.params;
        const subCategories = await SubCategory.find({ typeId }).populate('typeId', 'Type_name');

        if (subCategories.length === 0) {
            return res.status(404).json({ message: 'Không có danh mục nhỏ nào cho danh mục lớn này' });
        }

        res.status(200).json(subCategories);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh mục nhỏ', error: error.message });
    }
};

// Cập nhật danh mục nhỏ
exports.updateSubCategory = async (req, res) => {
    try {
        const { name, typeId } = req.body;

        // Kiểm tra danh mục lớn có tồn tại không
        const existingType = await Type.findById(typeId);
        if (!existingType) {
            return res.status(400).json({ message: 'Danh mục lớn không tồn tại' });
        }

        const updatedSubCategory = await SubCategory.findByIdAndUpdate(
            req.params.id,
            { name, typeId },
            { new: true }
        );

        if (!updatedSubCategory) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục nhỏ' });
        }

        res.status(200).json({ message: 'Cập nhật danh mục nhỏ thành công', subCategory: updatedSubCategory });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật danh mục nhỏ', error: error.message });
    }
};

// Xóa danh mục nhỏ
exports.deleteSubCategory = async (req, res) => {
    try {
        const deletedSubCategory = await SubCategory.findByIdAndDelete(req.params.id);
        if (!deletedSubCategory) {
            return res.status(404).json({ message: 'Không tìm thấy danh mục nhỏ' });
        }

        res.status(200).json({ message: 'Xóa danh mục nhỏ thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa danh mục nhỏ', error: error.message });
    }
};
