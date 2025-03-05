const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');

const reviewController = require('../controllers/ReviewCtrl')

router.post('/',authenticateToken, reviewController.addReview);
router.get('/:productId', reviewController.getReviewsByProduct);

module.exports = router;