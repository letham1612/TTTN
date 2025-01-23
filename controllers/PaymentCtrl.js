const axios = require('axios');
const crypto = require('crypto');
const Payment = require("../models/Payment");

const createPayment = async (req, res) => {
    try {
        const { amount, orderInfo, redirectUrl, ipnUrl } = req.body;
        const accessKey = 'F8BBA842ECF85';
        const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
        const partnerCode = 'MOMO';
        const requestType = "payWithMethod";
        const orderId = partnerCode + new Date().getTime();
        const requestId = orderId;
        const autoCapture = true;
        const lang = 'vi';
        const extraData = '';

        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

        const requestBody = {
            partnerCode,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            lang,
            requestType,
            autoCapture,
            extraData,
            signature
        };

        const paymentResponse = await axios.post("https://test-payment.momo.vn/v2/gateway/api/create", requestBody, {
            headers: { 'Content-Type': 'application/json' }
        });

        // Save payment to database
        const payment = new Payment({
            partnerCode,
            requestId,
            amount,
            orderId,
            orderInfo,
            signature,
            status: "pending" // initially mark as pending
        });
        await payment.save();

        res.status(200).json(paymentResponse.data);
    } catch (error) {
        console.error("Payment error:", error.response?.data || error.message);
        res.status(500).json({ message: "Payment processing failed" });
    }
};

module.exports = { createPayment };