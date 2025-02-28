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

const checkCouponValidity = async (req, res) => {
  const { name, orderTotal } = req.body;

  if (!name || !orderTotal) {
    return res.status(400).json({ message: "Thiếu mã giảm giá hoặc giá trị đơn hàng" });
  }

  try {
    const coupon = await Coupon.findOne({ name });

    if (!coupon) {
      return res.status(404).json({ message: "Mã giảm giá không hợp lệ" });
    }

    const currentDate = new Date();
    const expiryDate = new Date(coupon.expiry);

    if (expiryDate < currentDate) {
      return res.status(400).json({ message: "Mã giảm giá đã hết hạn" });
    }

    if (coupon.stock <= 0) {
      return res.status(400).json({ message: "Mã giảm giá đã hết số lượng" });
    }

    // Tách mức giảm giá (%) và số tiền tối thiểu từ description
    // **Tìm số tiền tối thiểu từ `description`**
    const match = coupon.description.match(/(\d{1,3}(?:[.,]?\d{3})*)\s*[kK]?\s*VND?/i);
    const minOrderTotal = match ? parseInt(match[1].replace(/[,.]/g, "")) : 0; // Chuyển về số nguyên

    if (orderTotal < minOrderTotal) {
      return res.status(400).json({
        message: `Mã giảm giá chỉ áp dụng cho đơn hàng từ ${minOrderTotal.toLocaleString()} VND`,
      });
    }

    return res.json({
      discount: coupon.discount,
      expiry: coupon.expiry,
      stock: coupon.stock,
      status: coupon.stock > 0 ? "Còn mã giảm giá" : "Hết mã giảm giá",
      message: `Giảm ${coupon.discount}% cho đơn hàng từ ${minOrderTotal.toLocaleString()} VND`,
    });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
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
