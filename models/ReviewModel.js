const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId , ref: 'Product', required: true },
   orderId: {  
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: false },
    response: {
    text: { type: String },
    respondedAt: { type: Date }
  }
  }, { timestamps: true });

  // Tính trung bình đánh giá
ReviewSchema.statics.getAverageRating = async function (productId) {
  const result = await this.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: '$productId', averageRating: { $avg: '$rating' } } }
  ]);
  return result.length ? result[0].averageRating.toFixed(1) : 0;
};

// Lấy tổng số lượng đánh giá
ReviewSchema.statics.getTotalReviews = async function (productId) {
  return await this.countDocuments({ productId });
};

// Phản hồi đánh giá
ReviewSchema.statics.respondToReview = async function (reviewId, responseText) {
  return await this.findByIdAndUpdate(
    reviewId,
    { response: { text: responseText, respondedAt: new Date() } },
    { new: true }
  );
};

  module.exports = mongoose.model('Review', ReviewSchema);