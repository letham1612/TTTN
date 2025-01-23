const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserCtrl");
const {
  authMiddleWare,
  authUserMiddleWare
} = require("../middlewares/authMiddleware");

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/changePassword', UserController.changePassword);
router.post('/logout',UserController.logout);
router.get('/all', UserController.getUser);
router.post('/refresh-token',UserController.refreshAccessToken);
router.get('/usergrowth', UserController.getUserGrowth);
router.get('/', UserController.getUserById);
// Cập nhật thông tin người dùng
router.put('/', UserController.updateUser);
// Xóa tài khoản người dùng
router.delete('/:id', UserController.deleteUser);

module.exports = router;