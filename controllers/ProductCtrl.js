const mongoose = require('mongoose');
const Product = require('../models/ProductModel');
const SubCategory = require('../models/SubCategoryModel');

// Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const { subCategoryId, name, quantityInStock, description, brandId, price, discount, image, isFeatured } = req.body;
    
    // Kiểm tra nếu thiếu subCategoryId
    if (!subCategoryId) {
      return res.status(400).json({ message: "subCategoryId không được để trống" });
    }
    // Kiểm tra các giá trị đầu vào
    console.log('Received Data:', req.body);

    // Tính giá sau khi giảm
    const promotionPrice = price - (price * (discount || 0)) / 100;

    console.log('Calculated Promotion Price:', promotionPrice);

    // Kiểm tra xem sản phẩm có tồn tại với name đã cho không
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      console.log('Sản phẩm đã tồn tại:', name);
      return res.status(400).json({ message: 'Sản phẩm đã tồn tại, không thể thêm sản phẩm mới' });
    }

    // Kiểm tra xem loại sản phẩm có tồn tại không
    const existingSubCategory = await SubCategory.findById(subCategoryId);
    if (!existingSubCategory) {
      console.log('ID_Type không tồn tại:', typeId);
      return res.status(400).json({ message: 'Loại sản phẩm không tồn tại, không thể thêm sản phẩm' });
    }

    // Tạo sản phẩm mới
    const newProduct = new Product({
      subCategoryId,
      name,
      quantityInStock, 
      description, 
      brandId,
      price: price || 0,
      discount: discount || 0,
      promotionPrice,
      image,
      isFeatured: isFeatured || false,
    });

    // Kiểm tra dữ liệu trước khi lưu
    console.log('New Product:', newProduct);
    // Lưu sản phẩm vào cơ sở dữ liệu
    await newProduct.save();
    console.log('Sản phẩm được tạo thành công:', newProduct);

    // Trả về phản hồi thành công
    res.status(201).json({
      message: 'Thêm sản phẩm thành công',
      product: newProduct
    });
  } catch (error) {
    console.error('Lỗi khi tạo sản phẩm:', error.message);
    res.status(500).json({ message: 'Lỗi khi tạo sản phẩm', error: error.message });
  }
};


// Lấy tất cả sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    console.log('Retrieved all products:', products);
    res.status(200).json(products);
  } catch (error) {
    console.error('Error retrieving products:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Lấy sản phẩm theo ID_Product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({_id:req.params.id} ).populate('reviews');

    if (!product) {
      console.log('Product not found with ID_Product:', req.params.id);
      return res.status(404).json({ message: 'Product not found' });
    }
    console.log('Retrieved product:', product);
    res.status(200).json(product);
  } catch (error) {
    console.error('Error retrieving product:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật sản phẩm theo ID_Product
exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      {_id: req.params.id}, // 
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      console.log('Product not found for update with ID_Product:', req.params.id);
      return res.status(404).json({ message: 'Product not found' });
    }
    console.log('Product updated:', updatedProduct);
    res.status(200).json({
      message: 'Cập nhật sản phẩm thành công',
      product: updatedProduct 
    });
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(400).json({ message: error.message });
  }
};

// Xóa sản phẩm theo ID_Product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete ({ _id: req.params.id }); // Sử dụng ID_Product để tìm kiếm
    if (!product) {
      console.log('Product not found for deletion with ID_Product:', req.params.id);
      return res.status(404).json({ message: 'Product not found' });
    }
    console.log('Product deleted:', product);
    res.status(200).json({ message: 'Xóa sản phẩm thành công', product }); // Thêm thông báo thành công
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách sản phẩm theo subCategoryId
exports.getProductsBySubCategory = async (req, res) => {
  try {
    const { subCategoryId } = req.params;

    // Kiểm tra tính hợp lệ của subCategoryId
    if (!mongoose.Types.ObjectId.isValid(subCategoryId)) {
      return res.status(400).json({ message: 'subCategoryId không hợp lệ' });
    }

    // Tìm các sản phẩm có subCategoryId tương ứng
    const products = await Product.find({ subCategoryId });

    if (products.length === 0) {
      console.log(`Không tìm thấy sản phẩm nào cho subCategoryId: ${subCategoryId}`);
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm nào cho danh mục nhỏ này' });
    }

    console.log(`Đã lấy sản phẩm cho subCategoryId: ${subCategoryId}`, products);
    res.status(200).json(products);
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm theo subCategoryId:', error.message);
    res.status(500).json({ message: 'Lỗi khi lấy sản phẩm', error: error.message });
  }
};

// Lọc sản phẩm bán chạy
exports.getBestSellingProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10; // Giới hạn số sản phẩm trả về
        const products = await Product.find()
            .sort({ sold: -1 }) // Sắp xếp theo số lượng bán giảm dần
            .limit(limit); // Giới hạn số lượng trả về

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error });
    }
};

// Lọc sản phẩm nổi bật
 exports.getFeaturedProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10; // Giới hạn số sản phẩm trả về
        const products = await Product.find({ isFeatured: true }) //  Lọc sản phẩm nổi bật
            .limit(limit); // Giới hạn số lượng trả về

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server', error });
    }
};

