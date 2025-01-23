
const Product = require('../models/ProductModel');
const Type = require('../models/TypeModel');

// Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const { typeId, name, quantityInStock, description, brandId, price, discount, image } = req.body;

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
    const existingType = await Type.findById(typeId);
    if (!existingType) {
      console.log('ID_Type không tồn tại:', typeId);
      return res.status(400).json({ message: 'Loại sản phẩm không tồn tại, không thể thêm sản phẩm' });
    }

    // Tạo sản phẩm mới
    const newProduct = new Product({
      typeId,
      name,
      quantityInStock, 
      description, 
      brandId,
      price: price || 0,
      discount: discount || 0,
      promotionPrice,
      image,
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
    const product = await Product.findOneAndDelete(req.params.id); // Sử dụng ID_Product để tìm kiếm
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
// controllers/ProductsController.js
exports.getProductsByType = async (req, res) => {
  try {
    const typeId = req.params.type; // Sử dụng ID_Type từ params
    const products = await Product.find({ typeId });

    if (products.length === 0) {
      console.log(`No products found for ID_Type: ${ID_Type}`);
      return res.status(404).json({ message: 'No products found for this type' });
    }

    console.log(`Retrieved products for ID_Type: ${ID_Type}`, products);
    res.status(200).json(products);
  } catch (error) {
    console.error('Error retrieving products by type:', error.message);
    res.status(500).json({ message: error.message });
  }
};

