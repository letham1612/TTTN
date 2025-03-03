const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Liên kết User
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true }, // Liên kết Order
    partnerCode: { type: String, required: true }, // Mã đối tác (MOMO, VNPay)
    requestId: { type: String, required: true }, // ID yêu cầu thanh toán
    amount: { type: Number, required: true }, // Số tiền cần thanh toán
    orderInfo: { type: String, required: true }, // Thông tin đơn hàng
    paymentMethod: { type: String, default: "MoMo" }, // Phương thức thanh toán
    paymentResult: { type: String, enum: ["success", "failure", "pending"], default: "pending" }, // Trạng thái thanh toán
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    signature: { type: String }
});
module.exports = mongoose.model("Payment", PaymentSchema);