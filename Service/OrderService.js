const Order = require("../models/OrderModel");
const Cart = require("../models/CartModel");
const Product = require("../models/ProductModel");
const Voucher = require("../models/CouponModel");

const createOrder = async (
  userId,
  cartId,
  shippingAddress,
  productId,
  name,
  phone,
  email,
  voucherCode
) => {
  try {
    const cart = await Cart.findById(cartId).populate("products.productId");
    if (!cart) {
      throw { status: 404, message: "Không tìm thấy giỏ hàng" };
    }

    const selectedProduct = cart.products.filter((item) =>
      productId.includes(String(item.productId?._id)) // Kiểm tra nếu productId tồn tại
    );

    if (!selectedProduct || selectedProduct.length === 0) {
      throw { status: 400, message: "Không tìm thấy sản phẩm nào trong giỏ hàng" };
    }

    const products = await Promise.all(
      selectedProduct.map(async (item) => {
        if (!item.productId) {
          throw {
            status: 404,
            message: `Không tìm thấy sản phẩm hợp lệ trong giỏ hàng`
          };
        }

        const product = await Product.findById(item.productId);
        if (!product) {
          throw {
            status: 404,
            message: `Không tìm thấy sản phẩm với ID ${item.productId}`
          };
        }
        return {
          productId: product._id,
          quantity: item.quantity,
          price: product.promotionPrice
        };
      })
    );

    const totalPrice = products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );

    const VAT = totalPrice * 0.1;
    // Đặt ngưỡng miễn phí vận chuyển
  const freeShippingThreshold = 500000;

  // Đặt phí vận chuyển cơ bản
  const baseShippingFee = 30000;

  // Tính phí vận chuyển dựa trên tổng giá trị đơn hàng
  const shippingFee = totalPrice >= freeShippingThreshold ? 0 : baseShippingFee;

    let discount = 0;
    if (voucherCode) {
      const voucher = await Voucher.findOne({ name: voucherCode });
      if (!voucher) {
        throw { status: 404, message: "Mã giảm giá không hợp lệ" };
      }
      if (voucher.discount >= 1 && voucher.discount <= 100) {
        discount = (totalPrice + shippingFee + VAT) * (voucher.discount / 100);
      }
    }

    const discountedPrice = totalPrice + shippingFee + VAT - discount;
    const orderTotal = parseFloat(Math.max(discountedPrice, 0).toFixed(2));

    const newOrder = new Order({
      name,
      phone,
      email,
      userId,
      cartId,
      products,
      shippingAddress,
      totalPrice,
      discount,
      VAT,
      shippingFee,
      orderTotal,
      status: "Pending"
    });

    await newOrder.save();

    cart.products = cart.products.filter(
      (item) => !productId.includes(String(item.productId?._id))
    );
    await cart.save();

    return {
      status: "OK",
      data: {
        ...newOrder.toObject(),
        discount,
        totalPrice
      }
    };
  } catch (error) {
    console.error("Lỗi trong createOrder service:", error);
    throw error;
  }
};

//Lấy cho user
const getAllOrdersByUser = async (userId) => {
  try {
    const orders = await Order.find({ userId }).populate("products.productId");
    return orders;
  } catch (error) {
    console.error("Lỗi trong getAllOrdersByUser service:", error);
    throw error;
  }
};

//lấy cho Admin
const getAllOrders = async () => {
  try {
    const orders = await Order.find().populate("products.productId");
    return orders;
  } catch (error) {
    console.error("Lỗi trong getAllOrders service:", error);
    throw error;
  }
};

const getOrderById = (orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const order = await Order.findById(orderId).populate(
        "products.productId"
      );
      if (!order) {
        return reject({
          status: "ERR",
          message: "Order not found"
        });
      }
      resolve(order);
    } catch (error) {
      reject({
        status: "ERR",
        message: "Error while retrieving order: " + error.message
      });
    }
  });
};
const cancelOrder = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw { status: 404, message: "Order not found" };
    }

    // Không thể hủy đơn hàng nếu đã giao, đã hủy hoặc đã được gửi đi
    if (["Delivered", "Cancelled", "Shipped"].includes(order.status)) {
      throw { status: 400, message: "Cannot cancel an order that is already shipped, delivered, or cancelled" };
    }

    // Nếu đơn hàng đã được xác nhận và thanh toán, có thể yêu cầu hỗ trợ thay vì hủy trực tiếp
    if (order.status === "Confirm" && order.isPaid) {
      throw { status: 400, message: "Order is already paid and confirmed. Please contact support for cancellation" };
    }


    order.status = "Cancelled";

    await order.save();

    return order;
  } catch (error) {
    console.error("Error in cancelOrder service:", error);
    throw {
      status: error.status || 500,
      message: error.message || "Internal server error"
    };
  }
};

//Admin xác nhận đơn hàng đang peding
const confirmOrder = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate("products.productId");
    if (!order) {
      throw { status: 404, message: "Order not found" };
    }

    if (order.status !== "Pending") {
      throw { status: 400, message: "Only pending orders can be confirmed" };
    }

    // Duyệt qua danh sách sản phẩm trong đơn hàng
    for (const item of order.products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw { status: 404, message: `Product ${item.productId} not found` };
      }
      if (!product.typeId) throw { status: 400, message: `Product ${product.name} is missing typeId` };

      if (product.quantityInStock < item.quantity) {
        throw { status: 400, message: `Not enough stock for ${product.name}` };
      }
      // Kiểm tra tồn kho
      if (product.quantityInStock < item.quantity) {
        throw { status: 400, message: `Not enough stock for ${product.name}` };
      }

      // Cập nhật tồn kho và số lượng đã bán
      product.quantityInStock -= item.quantity;
      product.sold += item.quantity;
      await product.save();
    }

    // Cập nhật trạng thái đơn hàng
    order.status = "Confirmed";
    order.updatedAt = new Date();
    await order.save();

    return { status: "OK", message: "Order confirmed successfully", order };
  } catch (error) {
    console.error("Error in confirmOrder service:", error);
    throw { status: error.status || 500, message: error.message || "Internal server error" };
  }
};



//Admin xác nhận từ confirmed sang bên vận chuyển 
const shipOrder = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw { status: 404, message: "Order not found" };
    }

   // Chỉ cho phép chuyển sang "Shipped" nếu đơn hàng đã được xác nhận
   if (order.status !== "Confirmed") {
    throw { status: 400, message: "Order must be confirmed before shipping" };
  }

    order.status = "Shipped";

    await order.save();

    return order;
  } catch (error) {
    console.error("Error in shipOrder service:", error);
    throw {
      status: error.status || 500,
      message: error.message || "Internal server error"
    };
  }
};

//User xác nhận đã nhận được hàng
const deliverOrder = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw { status: 404, message: "Order not found" };
    }

    // Chỉ cho phép xác nhận khi đơn hàng đang ở trạng thái "Shipped"
    if (order.status !== "Shipped") {
      throw { status: 400, message: "Order must be in Shipped status before delivery confirmation" };
    }

    // Kiểm tra paymentResult (thay vì isPaid)
    if (order.paymentResult !== "success") {
      throw { status: 400, message: "Order must be paid successfully before delivery confirmation" };
    }

    // Cập nhật trạng thái giao hàng
    order.status = "Delivered";
    await order.save();

    return order;
  } catch (error) {
    console.error("Error in deliverOrder service:", error);
    throw {
      status: error.status || 500,
      message: error.message || "Internal server error"
    };
  }
};

//Tự động chuyển sang Delivered nếu sau 3 ngày giao hàng thành công
const autoConfirmDelivery = async () => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Tìm tất cả đơn hàng có status "Shipped" và đã qua 3 ngày
    const ordersToUpdate = await Order.find({
      status: "Shipped",
      shippedAt: { $lte: threeDaysAgo }
    });

    if (ordersToUpdate.length === 0) {
      console.log("Không có đơn hàng nào cần cập nhật.");
      return { message: "Không có đơn hàng nào cần cập nhật." };
    }

    // Cập nhật tất cả đơn hàng quá hạn thành "Delivered"
    await Order.updateMany(
      { _id: { $in: ordersToUpdate.map(order => order._id) } },
      { $set: { status: "Delivered" } }
    );

    console.log(` Đã tự động xác nhận ${ordersToUpdate.length} đơn hàng đã giao thành công.`);
    return { message: `Đã xác nhận ${ordersToUpdate.length} đơn hàng đã giao.` };
  } catch (error) {
    console.error(" Lỗi khi tự động xác nhận đơn hàng:", error);
    throw error;
  }
};


const updatePaymentStatus = async (orderId, isSuccess) => {
  console.log(isSuccess);

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return { success: false, message: "Không tìm thấy đơn hàng" };
    }

    if (isSuccess && !order.isPaid) {
      order.isPaid = true;
    }
    await order.save();

    return {
      success: true,
      message: "Cập nhật trạng thái thanh toán thành công",
      returnUrl: "http://localhost:3000/ket-qua-thanh-toan"
    };
  } catch (e) {
    console.error("Lỗi khi cập nhật trạng thái thanh toán:", e.message);
    return {
      success: false,
      message: "Cập nhật trạng thái thanh toán thất bại",
      error: e.message
    };
  }
};

const handleVNPayCallback = async (req, res) => {
  try {
    const { vnp_ResponseCode, vnp_TxnRef } = req.query;

    if (!vnp_ResponseCode || !vnp_TxnRef) {
      return res.status(400).json({
        status: "ERR",
        message: "Thiếu thông tin từ VNPay callback"
      });
    }

    if (vnp_ResponseCode === "00") {
      const updateResult = await OrderService.updatePaymentStatus(
        vnp_TxnRef,
        true
      );

      if (updateResult.success) {
        return res.redirect(updateResult.returnUrl);
      }

      return res.status(400).json({
        status: "ERR",
        message: "Cập nhật trạng thái thanh toán thất bại"
      });
    } else if (vnp_ResponseCode === "24" || vnp_TransactionStatus === "02") {
      const order = await Order.findOne({ vnp_TxnRef });

      if (!order) {
        return res.status(404).json({
          status: "ERR",
          message: "Không tìm thấy đơn hàng"
        });
      }

      return res.status(200).json({
        status: "ERR",
        message: "Thanh toán bị hủy",
        order: order
      });
    } else {
      return res.status(400).json({
        status: "ERR",
        message: "Lỗi thanh toán từ VNPay",
        errorCode: vnp_ResponseCode
      });
    }
  } catch (e) {
    console.error("Lỗi khi xử lý callback từ VNPay:", e.message);
    return res.status(500).json({
      status: "ERR",
      message: "Lỗi hệ thống",
      error: e.message
    });
  }
};
//lấy đơn hàng theo trạng thái: theo ngày, theo tuần, theo tháng
const { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } = require("date-fns");

const getOrdersWithinPeriod = async (status, timePeriod, date) => {
  try {
    const selectedDate = new Date(date);
    let startUtcDate, endUtcDate;

    if (timePeriod === "day") {
      startUtcDate = startOfDay(selectedDate);
      endUtcDate = endOfDay(selectedDate);
    } else if (timePeriod === "week") {
      startUtcDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Tuần bắt đầu từ Thứ Hai
      endUtcDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
    } else if (timePeriod === "month") {
      startUtcDate = startOfMonth(selectedDate);
      endUtcDate = endOfMonth(selectedDate);
    } else {
      throw new Error("Invalid time period. Use 'day', 'week', or 'month'.");
    }

    const orders = await Order.find({
      status,
      createdAt: { $gte: startUtcDate, $lte: endUtcDate }
    }).populate("products.productId");

    return {
      orders,
      totalOrders: orders.length,
      startDate: startUtcDate,
      endDate: endUtcDate
    };
  } catch (error) {
    console.error("Error in getOrdersByTimePeriod:", error);
    throw error;
  }
};

const getRevenue = async () => {
  try {
    const deliveredOrders = await Order.find({ status: "Delivered" });

    const totalRevenue = deliveredOrders.reduce(
      (sum, order) => sum + order.orderTotal,
      0
    );

    return {
      status: "OK",
      totalRevenue
    };
  } catch (error) {
    console.error("Error in getTotalRevenue:", error);
    throw {
      status: "ERR",
      message: "Không thể tính tổng doanh thu",
      error: error.message
    };
  }
};
module.exports = {
  createOrder,
  getAllOrdersByUser,
  getAllOrders,
  getOrderById,
  cancelOrder,
  confirmOrder,
  shipOrder,
  deliverOrder,
  autoConfirmDelivery,
  handleVNPayCallback,
  updatePaymentStatus,
  getOrdersWithinPeriod,
  getRevenue
};