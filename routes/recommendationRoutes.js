const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');

// Định nghĩa route cho gợi ý sản phẩm
router.get('/product/:id/recommendations', getRecommendations);

module.exports = router;
