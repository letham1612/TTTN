const CartService = require("../Service/CartService");
const Product = require("../models/ProductModel");
const Cart = require("../models/CartModel");

const AddProductInCart = async (req, res) => {
  try {
     if (!req.user) {
            return res.status(401).json({ status: "ERR", message: "Unauthorized: Missing user info" });
        }
    const {productId, quantity } = req.body;
    const userId = req.user.id; 
    if (!userId || !productId || !quantity) {
      return res.status(400).json({
        status: "ERR",
        message: "userId, productId, and quantity are required"
      });
    }

    const response = await CartService.AddProductInCart(
      userId,
      productId,
      quantity
    );
    res.status(200).json({
      status: "OK",
      message: "Cart updated successfully",
      data: response
    });
  } catch (error) {
    console.error("Error in AddProductInCart Controller:", error);
    res.status(error.status || 500).json({
      status: "ERR",
      message: error.message || "Internal server error"
    });
  }
};

const UpdateProductInCart = async (req, res) => {
  try {
    const {productId } = req.body;
    const userId = req.user.id;
    if (!userId || !productId) {
      return res.status(400).json({
        status: "ERR",
        message: "userId and productId are required"
      });
    }

    const cartData = await CartService.UpdateProductInCart(userId, productId);

    res.status(200).json({
      status: "OK",
      message: "Cập nhật giỏ hàng thành công",
      data: cartData
    });
  } catch (error) {
    console.error("Error in DecreaseProductQuantityController:", error);
    res.status(error.status || 500).json({
      status: "ERR",
      message: error.message || "Internal server error"
    });
  }
};

const getCartByUserId = async (req, res) => {
  try {
     const userId = req.user.id; 

    if (!userId) {
      return res.status(400).json({
        status: "ERR",
        message: "Yêu cầu userId"
      });
    }

    const response = await CartService.getCartByUserId(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Đã xảy ra lỗi"
    });
  }
};

const removeProductFromCart = async (req, res) => {
  const { productId } = req.params;
   const userId = req.user.id; 
  try {
    const response = await CartService.removeProductFromCart(userId, productId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Đã xảy ra lỗi"
    });
  }
};

const deleteCart = async (req, res) => {
  const userId = req.user.id; 
  try {
    const response = await CartService.deleteCart(userId);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(500).json({
      message: e.message || "Đã xảy ra lỗi"
    });
  }
};

module.exports = {
  AddProductInCart,
  UpdateProductInCart,
  getCartByUserId,
  removeProductFromCart,
  deleteCart
};