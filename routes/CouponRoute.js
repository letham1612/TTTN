const express = require("express");
const router = express.Router();
const couponController = require("../controllers/CouponCtrl");

// Route tạo mã giảm giá mới
router.post("/", couponController.createCoupon);

router.post("/check-coupon", couponController.checkCouponValidity);

// Route lấy danh sách tất cả mã giảm giá
router.get("/", couponController.getCoupons);

// Route lấy chi tiết mã giảm giá theo ID
router.get("/:id", couponController.getCouponById);

// Route cập nhật mã giảm giá theo ID
router.put("/:id", couponController.updateCoupon);

// Route xóa mã giảm giá theo ID
router.delete("/:id", couponController.deleteCoupon);

module.exports = router;
