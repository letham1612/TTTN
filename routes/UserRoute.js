const express = require("express");
const router = express.Router();
const passport = require("passport");
const UserController = require("../controllers/UserCtrl");
const {
  authMiddleWare,
  authUserMiddleWare
} = require("../middlewares/authMiddleware");
const authenticateToken = require('../middlewares/authMiddleware');

router.post('/register', UserController.register);
router.post("/verify-otp", UserController.verifyOtp); // Xác thực OTP
router.post('/login', UserController.login);
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("User session:", req.user); // Ghi log thông tin user session
    res.json({ message: "Login successful!", user: req.user });
  }
);
router.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get("/auth/facebook/callback", passport.authenticate("facebook", { session: false }),  UserController.facebookAuth);
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