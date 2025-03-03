const axios = require('axios');
const crypto = require('crypto');
const Payment = require("../models/Payment");
const Order = require("../models/OrderModel");
const mongoose = require("mongoose");

const createPayment = async (req, res) => {
    try {
        const { orderId, amount, orderInfo, redirectUrl, ipnUrl, paymentMethod } = req.body;
        const userId = req.user.id;

        if (!orderId || !userId) {
            return res.status(400).json({ message: "Thiếu orderId hoặc userId" });
        }

        console.log("Received orderId:", orderId);

        // Kiểm tra orderId có hợp lệ không
        if (!mongoose.isValidObjectId(orderId)) {
            return res.status(400).json({ message: "orderId không hợp lệ" });
        }
        const objectOrderId = new mongoose.Types.ObjectId(orderId);

        console.log("Converted objectOrderId:", objectOrderId);

        // Kiểm tra xem đơn hàng có tồn tại không
        const order = await Order.findById(objectOrderId);
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        const accessKey = "F8BBA842ECF85";
        const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
        const partnerCode = "MOMO";
        const requestType = "payWithMethod";
        const momoOrderId = partnerCode + new Date().getTime();
        const requestId = momoOrderId;
        const autoCapture = true;
        const lang = "vi";
        const extraData = "";

        // Tạo chữ ký bảo mật
        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${momoOrderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

        // Tạo body gửi tới MoMo
        const requestBody = {
            partnerCode,
            requestId,
            amount,
            orderId: momoOrderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            lang,
            requestType,
            autoCapture,
            extraData,
            signature,
        };

        // Gửi yêu cầu thanh toán đến MoMo
        const paymentResponse = await axios.post("https://test-payment.momo.vn/v2/gateway/api/create", requestBody, {
            headers: { "Content-Type": "application/json" },
        });

        // Lưu thông tin thanh toán vào database
        const payment = new Payment({
            userId,
            orderId: objectOrderId,
            partnerCode,
            requestId,
            amount,
            orderInfo,
            paymentMethod: paymentMethod || "MoMo",
            signature,
            paymentResult: "pending",
        });
        await payment.save();

        // Cập nhật trạng thái thanh toán trong đơn hàng
        await Order.findByIdAndUpdate(objectOrderId, { paymentResult: "pending" });

        res.status(200).json(paymentResponse.data);
    } catch (error) {
        console.error("Payment error:", error.response?.data || error.message);
        res.status(500).json({ message: "Payment processing failed" });
    }
};

module.exports = { createPayment };