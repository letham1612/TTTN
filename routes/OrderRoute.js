const express = require("express");
const router = express.Router();
const orderController = require("../controllers/OrderCtrl");
const authenticateToken = require('../middlewares/authMiddleware');

router.get("/getAll", orderController.getAllOrders);
router.post("/", authenticateToken, orderController.createOrder);

router.get("/:orderId", authenticateToken, orderController.getOrderById);

router.get("/", authenticateToken, orderController.getAllOrdersByUser);

router.put("/cancel", authenticateToken, orderController.cancelOrder);

// Route để admin xác nhận đơn hàng (chuyển từ Pending sang Confirm)
router.post("/confirm", orderController.confirmOrder);

// Route để admin xác nhận đơn hàng (chuyển từ Confirm sang Shipped)
router.put("/shipOrder", orderController.shipOrder);

// Route để người dùng xác nhận đã nhận hàng (chuyển từ Shipped sang Delivered)
router.put("/deliver", authenticateToken, orderController.deliverOrder);

// Route API để chạy xác nhận đơn hàng tự động
router.post("/auto-confirm-delivery", orderController.confirmPendingDeliveries);

//Định nghĩa route để lấy đơn hàng theo trạng thái và thời gian
router.post("/orders-by-time", orderController.listOrdersByTime);

router.get("/total-revenue", orderController.getRevenue);
module.exports = router;