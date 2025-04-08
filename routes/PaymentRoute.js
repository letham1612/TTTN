const express = require("express");
const { createPayment, handleMomoIPN } = require("../controllers/PaymentCtrl");
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

// Route for initiating a payment
router.post("/",authenticateToken, createPayment);
router.post("/momo-ipn", handleMomoIPN);

module.exports = router;