const Review = require('../models/ReviewModel');
const Product = require('../models/ProductModel');
const mongoose = require("mongoose");
const Order = require('../models/OrderModel');

// Thêm đánh giá
exports.addReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user.id; // Lấy userId từ token (hoặc session)

    if (!productId || !orderId || !userId || !rating) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc!' });
    }

    console.log(" Debug order lookup:");
console.log("orderId:", orderId);
console.log("userId:", userId);
console.log("productId:", productId);

    // Kiểm tra đơn hàng có tồn tại và đã được giao chưa
    const order = await Order.findOne({ 
      _id: orderId, 
      userId, 
      status: "Delivered", 
      
    })
    const orderCheck = await Order.findById(orderId);
console.log("Order tìm thấy theo _id:", orderCheck);
    console.log("Kết quả truy vấn:", order);
    console.log("Trạng thái đơn hàng:", orderCheck.status);
    if (!order) {
      return res.status(400).json({ message: 'Bạn chỉ có thể đánh giá sau khi đơn hàng đã được giao thành công!' });
    }

    // Kiểm tra nếu user đã review sản phẩm này rồi (trong cùng order)
    const existingReview = await Review.findOne({ productId, userId, orderId });
    if (existingReview) {
      return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi!' });
    }

    // Tạo review mới
    const newReview = new Review({ productId, orderId, userId, rating, comment });
    await newReview.save();

    res.status(201).json({ message: 'Đánh giá thành công!', review: newReview });
  } catch (error) {
    console.error("Lỗi trong addReview:", error); // Thêm log chi tiết
    res.status(500).json({ message: 'Lỗi server', error });
  }
};
// Thêm API để lấy đánh giá theo sản phẩm
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Lấy danh sách đánh giá của sản phẩm, kèm theo thông tin user (nếu cần)
    const reviews = await Review.find({ productId })
      .populate('userId', 'username email') // Lấy thông tin user (name, email)
      .populate('orderId', 'status') // Lấy thông tin đơn hàng (chỉ lấy status)
      .sort({ createdAt: -1 }); // Sắp xếp theo thời gian mới nhất

    if (reviews.length === 0) {
      return res.status(404).json({ message: 'Chưa có đánh giá nào cho sản phẩm này!' });
    }

    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

// Phản hồi đánh giá
exports.respondToReview = async (req, res) => {
  try {
    const { responseText } = req.body;
    const review = await Review.respondToReview(req.params.reviewId, responseText);
    if (!review) return res.status(404).json({ error: 'Review không tồn tại' });
    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy đánh giá trung bình
exports.getAverageRating = async (req, res) => {
  try {
    const avgRating = await Review.getAverageRating(req.params.productId);
    res.json({ averageRating: avgRating });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lấy tổng số lượng đánh giá
exports.getTotalReviews = async (req, res) => {
  try {
    const totalReviews = await Review.getTotalReviews(req.params.productId);
    res.json({ totalReviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};