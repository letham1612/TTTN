const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');

const reviewController = require('../controllers/ReviewCtrl')

router.post('/',authenticateToken, reviewController.addReview);

//lấy danh sách đánh giá theo sản phẩm
router.get('/:productId', reviewController.getReviewsByProduct);

//phản hồi đánh giá theo reviewId
router.patch('/:reviewId/respond', reviewController.respondToReview);

//lấy đánh giá trung bình theo sản phẩm
router.get('/average-rating/:productId', reviewController.getAverageRating);

//lấy tổng số lượng đánh giá
router.get('/total-reviews/:productId', reviewController.getTotalReviews);


module.exports = router;