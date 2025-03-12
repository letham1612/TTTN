const express = require("express");
const router = express.Router();
const passport = require("passport");
const UserController = require("../controllers/UserCtrl");
const {
  authMiddleWare,
  authUserMiddleWare
} = require("../middlewares/authMiddleware");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} = require("../utils/jwtUtils");
const authenticateToken = require('../middlewares/authMiddleware');

router.post('/register', UserController.register);
router.post("/verify-otp", UserController.verifyOtp); // Xác thực OTP
router.post('/login', UserController.login);
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("User after Google Auth:", req.user);

    if (!req.user) {
      return res.status(401).json({ message: "Google authentication failed" });
    }

    const token = generateAccessToken(req.user);
    const refreshToken = generateRefreshToken(req.user);

    console.log("Generated Access Token:", token);
    console.log("Generated Refresh Token:", refreshToken);

    res.json({
      message: "Đăng nhập Google thành công",
      token,
      refreshToken,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
      },
    });
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