const express = require("express");
const { createPayment } = require("../controllers/PaymentCtrl");

const router = express.Router();

// Route for initiating a payment
router.post("/", createPayment);

module.exports = router;