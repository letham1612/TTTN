const Brand = require("../models/BrandModel");
const asyncHandler = require("express-async-handler");
//const validateMongoDbId = require("../utils/ValidateMongDbId");

const createBrand = async (req, res) => {
    try {
      const { title, description, image } = req.body;
  
      // Kiểm tra xem thương hiệu đã tồn tại chưa
      const existingBrand = await Brand.findOne({ title });
      if (existingBrand) {
        return res.status(400).json({ message: 'Thương hiệu đã tồn tại' });
      }
  
      // Tạo mới thương hiệu
      const newBrand = new Brand({
        title,
        description,
        image,
      });
  
      // Lưu vào cơ sở dữ liệu
      await newBrand.save();
  
      res.status(201).json({
        message: 'Thêm thương hiệu thành công',
        brand: newBrand,
      });
    } catch (error) {
      console.error('Lỗi khi tạo thương hiệu:', error.message);
      res.status(500).json({ message: 'Lỗi khi tạo thương hiệu', error: error.message });
    }
  };
const updateBrand = async (req, res) => {
    try {
      const brandId = req.params.id;
      const { title, description, image } = req.body;
  
      // Kiểm tra xem thương hiệu có tồn tại không
      const existingBrand = await Brand.findById(brandId);
      if (!existingBrand) {
        return res.status(404).json({ message: 'Thương hiệu không tồn tại' });
      }
  
      // Cập nhật thông tin thương hiệu
      existingBrand.title = title || existingBrand.title;
      existingBrand.description = description || existingBrand.description;
      existingBrand.image = image || existingBrand.image;
  
      // Lưu thay đổi
      await existingBrand.save();
  
      res.status(200).json({
        message: 'Cập nhật thương hiệu thành công',
        brand: existingBrand,
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật thương hiệu:', error.message);
      res.status(500).json({ message: 'Lỗi khi cập nhật thương hiệu', error: error.message });
    }
  };
const deleteBrand = async (req, res) => {
    try {
      const brandId = req.params.id;
  
      // Kiểm tra xem thương hiệu có tồn tại không
      const brandToDelete = await Brand.findById(brandId);
      if (!brandToDelete) {
        return res.status(404).json({ message: 'Thương hiệu không tồn tại' });
      }
  
      // Xóa thương hiệu
      await brandToDelete.remove();
  
      res.status(200).json({
        message: 'Xóa thương hiệu thành công',
      });
    } catch (error) {
      console.error('Lỗi khi xóa thương hiệu:', error.message);
      res.status(500).json({ message: 'Lỗi khi xóa thương hiệu', error: error.message });
    }
  };
const getBrand = async (req, res) => {
    try {
      const brandId = req.params.id;
  
      // Tìm thương hiệu theo ID
      const brand = await Brand.findById(brandId);
      if (!brand) {
        return res.status(404).json({ message: 'Thương hiệu không tồn tại' });
      }
  
      res.status(200).json({
        brand,
      });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin thương hiệu:', error.message);
      res.status(500).json({ message: 'Lỗi khi lấy thông tin thương hiệu', error: error.message });
    }
  };
const getallBrand = async (req, res) => {
    try {
      // Lấy tất cả thương hiệu
      const brands = await Brand.find();
  
      res.status(200).json({
        brands,
      });
    } catch (error) {
      console.error('Lỗi khi lấy tất cả thương hiệu:', error.message);
      res.status(500).json({ message: 'Lỗi khi lấy tất cả thương hiệu', error: error.message });
    }
  };
module.exports = {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getallBrand,
};