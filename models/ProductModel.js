const mongoose = require('mongoose');
const { Schema } = mongoose;


const ProductSchema = new mongoose.Schema({
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', required: true }, // Liên kết danh mục nhỏ
    name: { type: String, required: true },
    quantityInStock: { type: Number, default: 0 },
    description: { type: String },
    price: { type: Number, default: 0 }, // Giá gốc
    discount: { type: Number, default: 0 }, // % Giảm giá (0-100)
    promotionPrice: { type: Number, default: 0 }, // Giá sau khi giảm
    image: { type: String },
    brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    averageRating: { type: Number, default: 0 },
    //sold: { type: Number, default: 0 }, //  Số lượng đã bán
    isFeatured: { type: Boolean, default: false }, //  Sản phẩm nổi bật
    reviewCount: { type: Number, default: 0 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review'}],
}, 
{ timestamps: true });


const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

module.exports = Product;