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
    if (!req.user) {
      return res.status(401).json({ message: "Google authentication failed" });
    }

    const token = generateAccessToken(req.user);
    const refreshToken = generateRefreshToken(req.user);

    // Chuyển hướng về frontend với đầy đủ thông tin cần thiết
    res.redirect(`http://localhost:3001/login?token=${token}&refreshToken=${refreshToken}&username=${req.user.username}&email=${req.user.email}`);
  }
);

router.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get("/auth/facebook/callback", passport.authenticate("facebook", { session: false }),  UserController.facebookAuth);
router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password", UserController.resetPassword);
router.post('/changePassword', UserController.changePassword);
router.post('/logout',UserController.logout);
router.get('/all', UserController.getUser);
router.post("/refresh-token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(403).json({ message: "Refresh token is required" });
  }

  try {
    const user = verifyRefreshToken(refreshToken); // Giải mã refreshToken
    const newAccessToken = generateAccessToken(user);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000, // 15 phút
    });

    res.json({ message: "Token refreshed" });
  } catch (error) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
});
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