const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const reviewController = require('../controllers/ReviewCtrl')

router.post('/',authMiddleware, reviewController.addReview);
router.get('/:product_id', reviewController.getReviewsByProduct);

module.exports = router;