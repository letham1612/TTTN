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

    // Lưu token vào cookie an toàn
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: true,  // Chỉ gửi qua HTTPS (cần HTTPS trên production)
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000, // 15 phút
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    // Chuyển hướng về frontend mà không gửi token trên URL
    res.redirect(`http://localhost:3001?token=${token}&refreshToken=${refreshToken}`);
  }
);

router.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get("/auth/facebook/callback", passport.authenticate("facebook", { session: false }),  UserController.facebookAuth);
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