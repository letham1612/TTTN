const axios = require("axios");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Order = require("../models/OrderModel");

// Ngrok URL công khai của bạn (phải online)
const NGROK_URL = "https://49df-113-161-54-89.ngrok-free.app";

// Tạo thanh toán MoMo
const createPayment = async (req, res) => {
    try {
        const { orderId, amount, orderInfo, paymentMethod } = req.body;
        const userId = req.user.id;

        if (!orderId || !userId) {
            return res.status(400).json({ message: "Thiếu orderId hoặc userId" });
        }

        if (!mongoose.isValidObjectId(orderId)) {
            return res.status(400).json({ message: "orderId không hợp lệ" });
        }

        const objectOrderId = new mongoose.Types.ObjectId(orderId);
        const order = await Order.findById(objectOrderId);
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        // Thông tin cấu hình MoMo
        const accessKey = "F8BBA842ECF85";
        const secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
        const partnerCode = "MOMO";
        const requestType = "payWithMethod";
        const momoOrderId = partnerCode + new Date().getTime();
        const requestId = momoOrderId;
        const redirectUrl = `${NGROK_URL}/thank-you`;
        const ipnUrl = `${NGROK_URL}/api/payments/momo-ipn`;
        const extraData = "";
        const autoCapture = true;
        const lang = "vi";

        // Tạo chữ ký
        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${momoOrderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

        // Gửi yêu cầu thanh toán
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

        const paymentResponse = await axios.post(
            "https://test-payment.momo.vn/v2/gateway/api/create",
            requestBody,
            { headers: { "Content-Type": "application/json" } }
        );

        // Lưu giao dịch vào database
        const payment = new Payment({
            userId,
            orderId: objectOrderId,
            momoOrderId,
            partnerCode,
            requestId,
            amount,
            orderInfo,
            paymentMethod: paymentMethod || "MoMo",
            signature,
            paymentResult: "pending",
        });
        await payment.save();

        await Order.findByIdAndUpdate(objectOrderId, {
            momoOrderId,
            paymentResult: "pending",
        });

        res.status(200).json(paymentResponse.data);
    } catch (error) {
        console.error("Payment error:", error.response?.data || error.message);
        res.status(500).json({ message: "Payment processing failed" });
    }
};

// Xử lý IPN từ MoMo
const handleMomoIPN = async (req, res) => {
    try {
        const { orderId, requestId, amount, resultCode, message, transId } = req.body;

        console.log("ĐÃ NHẬN IPN TỪ MOMO:", req.body);

        const paymentStatus = resultCode === 0 ? "success" : "failed";

        const payment = await Payment.findOneAndUpdate(
            { requestId },
            {
                paymentResult: paymentStatus,
                transactionId: transId,
                updatedAt: new Date(),
            },
            { new: true }
        );

        if (!payment) {
            console.warn(" Không tìm thấy giao dịch với requestId:", requestId);
            return res.status(200).json({ resultCode: 1, message: "Payment not found" });
        }

        const order = await Order.findByIdAndUpdate(
            payment.orderId,
            {
                paymentResult: paymentStatus,
                updatedAt: new Date(),
            },
            { new: true }
        );

        if (!order) {
            console.warn(" Không tìm thấy đơn hàng với ID:", payment.orderId);
            return res.status(200).json({ resultCode: 1, message: "Order not found" });
        }

        console.log("Đã cập nhật trạng thái đơn hàng:", order);

        // MoMo yêu cầu luôn trả về HTTP 200
        return res.status(200).json({
            resultCode: 0,
            message: resultCode === 0 ? "Payment success" : "Payment failed",
        });
    } catch (error) {
        console.error("MoMo IPN Handling Error:", error);
        return res.status(200).json({ resultCode: 1, message: "Internal server error" });
    }
};

module.exports = { createPayment, handleMomoIPN };
