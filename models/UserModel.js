const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true  },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, unique: true },
    password: { type: String, required: true },
    address: { type: String },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], //Danh sách sản phẩm yêu thích
    isadmin: {type: Boolean, default: false, require: true},
    isVerified: { type: Boolean, default: false },// Đánh dấu tài khoản đã xác thực hay chưa
    refreshToken: { type: String }
    }, 
{ timestamps: true });


module.exports = mongoose.model('User',UserSchema);