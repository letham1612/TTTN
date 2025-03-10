const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserCtrl");
const {
  authMiddleWare,
  authUserMiddleWare
} = require("../middlewares/authMiddleware");
const authenticateToken = require('../middlewares/authMiddleware');

router.post('/register', UserController.register);
router.post("/verify-otp", UserController.verifyOtp); // Xác thực OTP
router.post('/login', UserController.login);
router.post('/changePassword', UserController.changePassword);
router.post('/logout',UserController.logout);
router.get('/all', UserController.getUser);
router.post('/refresh-token',UserController.refreshAccessToken);
router.get('/usergrowth', UserController.getUserGrowth);
router.get('/', UserController.getUserById);
// Cập nhật thông tin người dùng
router.put('/', UserController.updateUser);
// Admin xóa bất kỳ user nào (không cần token)
router.delete('/:id', UserController.deleteUser);

// Xóa tài khoản người dùng cho user
router.delete('/me',authenticateToken, UserController.deleteUser);
// sản phẩm yêu thích của người dùng
router.post('/wishlist/add', authenticateToken, UserController.addToWishlist);
router.get('/wishlist', authenticateToken, UserController.getWishlist);
router.delete('/wishlist/remove', authenticateToken, UserController.removeFromWishlist);

module.exports = router;