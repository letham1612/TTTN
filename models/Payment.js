const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
    partnerCode: { type: String, required: true },
    requestId: { type: String, required: true },
    amount: { type: String, required: true },
    orderId: { type: String, required: true },
    orderInfo: { type: String, required: true },
    status: { type: String, default: "pending" }, 
    createdAt: { type: Date, default: Date.now },
    signature: { type: String }
});

module.exports = mongoose.model("Payment", PaymentSchema);