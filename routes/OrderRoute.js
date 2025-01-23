const express = require("express");
const router = express.Router();
const orderController = require("../controllers/OrderCtrl");
const authenticateToken = require('../middlewares/authMiddleware');

router.get("/getAll", orderController.getAllOrders);
router.post("/", authenticateToken, orderController.createOrder);

router.get("/:orderId", authenticateToken, orderController.getOrderById);

router.get("/", authenticateToken, orderController.getAllOrdersByUser);

router.put("/cancel", authenticateToken, orderController.cancelOrder);

// Route để admin xác nhận đơn hàng (chuyển từ Pending sang Shipped)
router.put("/ship", orderController.shipOrder);

// Route để người dùng xác nhận đã nhận hàng (chuyển từ Shipped sang Delivered)
router.put("/deliver", orderController.deliverOrder);

router.post("/getstatus", orderController.getOrdersByStatusAndDateController);
router.get("/total-revenue", orderController.getRevenue);
module.exports = router;