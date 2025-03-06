const OrderService = require("../Service/OrderService");
const Order = require("../models/OrderModel");

const createOrder = async (req, res) => {
  try {
    const {
      cartId,
      shippingAddress,
      productList,
      name,
      phone,
      email,
      voucherCode
    } = req.body;
    const userId = req.user.id; 

    const selectedProductId = Array.isArray(productList)
    ? productList.map(item => item.productId)  // Chỉ lấy productId từ productList
    : [productList.productId]; 
    const newOrder = await OrderService.createOrder(
      userId,
      cartId,
      shippingAddress,
      productList,
      name,
      phone,
      email,
      voucherCode
    );

    res.status(200).json({ status: "OK", data: newOrder });
  } catch (error) {
    console.error("Lỗi trong createOrder controller:", error);
    res.status(error.status || 500).json({
      status: "ERR",
      message: error.message || "Internal server error"
    });
  }
};
const getAllOrdersByUser = async (req, res) => {
  try {
    const userId = req.user.id; 
    const orders = await OrderService.getAllOrdersByUser(userId);

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        status: "ERR",
        message: "Không có đơn hàng nào được tìm thấy cho người dùng này"
      });
    }

    res.status(200).json({
      status: "OK",
      data: orders
    });
  } catch (error) {
    console.error("Lỗi trong getAllOrdersByUser controller:", error);
    res.status(error.status || 500).json({
      status: "ERR",
      message: error.message || "Internal server error"
    });
  }
};
const getAllOrders = async (req, res) => {
  try {
   
    const orders = await OrderService.getAllOrders();
    console.log("Orders fetched:", orders);
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        status: "ERR",
        message: "Không có đơn hàng nào được tìm thấy"
      });
    }

    res.status(200).json({
      status: "OK",
      data: orders
    });
  } catch (error) {
    console.error("Lỗi trong getAllOrdersController:", error);
    res.status(error.status || 500).json({
      status: "ERR",
      message: error.message || "Lỗi máy chủ nội bộ"
    });
  }
};

const getOrderById = async (req, res) => {
  const userId = req.user.id; 
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId).populate("products.productId");

    if (!order) {
      return res.status(404).json({
        status: "ERR",
        message: "Order not found"
      });
    }

    return res.status(200).json({
      status: "OK",
      data: order
    });
  } catch (error) {
    console.error("Error in getOrderById controller:", error);
    return res.status(500).json({
      status: "ERR",
      message: "Internal server error"
    });
  }
};
const cancelOrder = async (req, res) => {
  const userId = req.user.id; 
  const { orderId } = req.body;

  try {
    const canceledOrder = await OrderService.cancelOrder(orderId);
    res.status(200).json({
      status: "OK",
      message: "Order canceled successfully",
      data: canceledOrder
    });
  } catch (error) {
    console.error("Error in cancelOrderController:", error);
    res.status(error.status || 500).json({
      status: "ERR",
      message: error.message || "Internal server error"
    });
  }
};

//Admin xác nhận đơn hàng
const confirmOrder = async (req, res) => {
  const { orderId } = req.body;

  try {
    const confirmedOrder = await OrderService.confirmOrder(orderId);
    res.status(200).json({
      status: "OK",
      message: "Order confirmed successfully",
      data: confirmedOrder
    });
  } catch (error) {
    console.error("Error in confirmOrderController:", error);
    res.status(error.status || 500).json({
      status: "ERR",
      message: error.message || "Internal server error"
    });
  }
};

//Admin xác nhận đơn hàng đã qua đơn vị vận chuyển
const shipOrder = async (req, res) => {
  const { orderId } = req.body;

  try {
    const shippedOrder = await OrderService.shipOrder(orderId);
    res.status(200).json({
      status: "OK",
      message: "Order shipped successfully",
      data: shippedOrder
    });
  } catch (error) {
    console.error("Error in shipOrderController:", error);
    res.status(error.status || 500).json({
      status: "ERR",
      message: error.message || "Internal server error"
    });
  }
};

// Người dùng xác nhận đã nhận hàng
const deliverOrder = async (req, res) => {
  const { orderId } = req.body;

  try {
    const deliveredOrder = await OrderService.deliverOrder(orderId);
    res.status(200).json({
      status: "OK",
      message: "Order delivered successfully",
      data: deliveredOrder
    });
  } catch (error) {
    console.error("Error in deliverOrderController:", error);
    res.status(error.status || 500).json({
      status: "ERR",
      message: error.message || "Internal server error"
    });
  }
};

const confirmPendingDeliveries = async (req, res) => {
  try {
    const result = await OrderService.autoConfirmDelivery();
    res.status(200).json({
      status: "OK",
      message: result.message
    });
  } catch (error) {
    res.status(500).json({
      status: "ERR",
      message: "Lỗi khi tự động xác nhận đơn hàng"
    });
  }
};

const listOrdersByTime = async (req, res) => {
  try {
    const { status, timePeriod, date } = req.body; // Nhận params từ request

    if (!status || !timePeriod || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await OrderService.getOrdersWithinPeriod(status, timePeriod, date);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getOrders:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getRevenue = async (req, res) => {
  try {
    const revenueData = await OrderService.getRevenue();
    return res.status(200).json(revenueData);
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: "Không thể lấy tổng doanh thu",
      error: error.message
    });
  }
};
module.exports = {
  getAllOrdersByUser,
  getAllOrders,
  createOrder,
  getOrderById,
  cancelOrder,
  confirmOrder,
  shipOrder,
  deliverOrder,
  confirmPendingDeliveries,
  getRevenue,
  listOrdersByTime
};