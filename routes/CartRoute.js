const express = require("express");
const CartController = require("../controllers/CartCtrl");
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

router.post("/",  authenticateToken, CartController.AddProductInCart);
router.post("/update",  authenticateToken, CartController.UpdateProductInCart);

router.get("/",  authenticateToken, CartController.getCartByUserId);

router.delete(
  "/:productId",  authenticateToken,
  CartController.removeProductFromCart
);

router.delete("/",  authenticateToken, CartController.deleteCart);

module.exports = router;