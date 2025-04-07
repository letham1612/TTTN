const mongoose = require('mongoose');
const { Schema } = mongoose;


const ProductSchema = new mongoose.Schema({
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true }, // Liên kết danh mục nhỏ
    name: { type: String, required: true },
    quantityInStock: { type: Number, default: 0, min: 0 },
    description: { type: String, required: true },
    price: { type: Number, default: 0, min: 0 }, // Giá gốc
    discount: { type: Number, default: 0, min: 0, max: 100 }, // % Giảm giá (0-100)
    promotionPrice: { type: Number, default: 0, min: 0}, // Giá sau khi giảm
    image: { type: String, required: true },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    averageRating: { type: Number, default: 0 },
    typeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Type', required: true }, 
    sold: { type: Number, default: 0, min: 0 }, //  Số lượng đã bán
    isFeatured: { type: Boolean, default: false }, //  Sản phẩm nổi bật
    reviewCount: { type: Number, default: 0 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review'}],
    // Thêm trường mới
    ingredients: [{ type: String }], // Danh sách thành phần
    usageInstructions: { type: String }, // Hướng dẫn sử dụng
    startTime: { type: Date },  // Thêm trường startTime
  endTime: { type: Date },    // Thêm trường endTime
}, 
{ timestamps: true });


const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

module.exports = Product;