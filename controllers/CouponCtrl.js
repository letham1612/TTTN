const Coupon = require("../models/CouponModel");

// Tạo mới mã giảm giá
const createCoupon = async (req, res) => {
  try {
    const { name, description, expiry, discount, stock, image } = req.body;

    // Tạo mã giảm giá mới
    const newCoupon = new Coupon({
      name,
      description,
      expiry,
      discount,
      stock,
      image,
    });

    // Lưu mã giảm giá vào cơ sở dữ liệu
    const savedCoupon = await newCoupon.save();

    res.status(201).json({
      status: "OK",
      message: "Tạo mã giảm giá thành công",
      data: savedCoupon,
    });
  } catch (error) {
    console.error("Lỗi khi tạo mã giảm giá:", error);
    res.status(500).json({
      status: "ERR",
      message: error.message || "Lỗi khi tạo mã giảm giá",
    });
  }
};

const checkCouponValidity = async (couponCode) => {
  const coupon = await Coupon.findOne({ name: couponCode });

  if (!coupon) {
    throw new Error("Mã giảm giá không hợp lệ");
  }

  if (new Date(coupon.expiry) < new Date()) {
    throw new Error("Mã giảm giá đã hết hạn");
  }

  if (coupon.stock <= 0) {
    throw new Error("Mã giảm giá đã hết số lượng");
  }

  return coupon;
};

// Lấy danh sách mã giảm giá
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json({
      status: "OK",
      data: coupons,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách mã giảm giá:", error);
    res.status(500).json({
      status: "ERR",
      message: "Không thể lấy danh sách mã giảm giá",
    });
  }
};

// Lấy chi tiết một mã giảm giá theo ID
const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        status: "ERR",
        message: "Không tìm thấy mã giảm giá",
      });
    }

    res.status(200).json({
      status: "OK",
      data: coupon,
    });
  } catch (error) {
    console.error("Lỗi khi lấy mã giảm giá:", error);
    res.status(500).json({
      status: "ERR",
      message: "Không thể lấy mã giảm giá",
    });
  }
};

// Cập nhật mã giảm giá
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updates, {
      new: true, // Trả về tài liệu đã cập nhật
      runValidators: true, // Kiểm tra điều kiện trong schema
    });

    if (!updatedCoupon) {
      return res.status(404).json({
        status: "ERR",
        message: "Không tìm thấy mã giảm giá",
      });
    }

    res.status(200).json({
      status: "OK",
      message: "Cập nhật mã giảm giá thành công",
      data: updatedCoupon,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật mã giảm giá:", error);
    res.status(500).json({
      status: "ERR",
      message: "Không thể cập nhật mã giảm giá",
    });
  }
};

// Xóa mã giảm giá
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCoupon = await Coupon.findByIdAndDelete(id);

    if (!deletedCoupon) {
      return res.status(404).json({
        status: "ERR",
        message: "Không tìm thấy mã giảm giá",
      });
    }

    res.status(200).json({
      status: "OK",
      message: "Xóa mã giảm giá thành công",
      data: deletedCoupon,
    });
  } catch (error) {
    console.error("Lỗi khi xóa mã giảm giá:", error);
    res.status(500).json({
      status: "ERR",
      message: "Không thể xóa mã giảm giá",
    });
  }
};

// Xuất các phương thức
module.exports = {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  checkCouponValidity
};
