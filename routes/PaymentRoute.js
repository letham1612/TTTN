const express = require("express");
const { createPayment } = require("../controllers/PaymentCtrl");
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

// Route for initiating a payment
router.post("/",authenticateToken, createPayment);

module.exports = router;