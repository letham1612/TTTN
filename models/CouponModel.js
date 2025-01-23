const mongoose = require("mongoose"); 

var couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  description: { type: String },
  expiry: {
    type: Date,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  stock: {
      type: Number,
      required: true,
      min: 0, // Số lượng không thể âm
    },
  image: { type: String },
});

//Export the model
module.exports = mongoose.model("Coupon", couponSchema);