const User = require('../models/UserModel'); // Đảm bảo đường dẫn đúng tới file model
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const sendMail = require("../config/mailConfig"); 


const register = async (req, res) => {
  const { username, email, phoneNumber, password, resPassword } = req.body;

  if (password !== resPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
      const userExists = await User.findOne({ $or: [{ email }, { username }] });
      if (userExists) {
          return res.status(400).json({ message: 'Username or Email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
          username,
          email,
          phoneNumber,
          password: hashedPassword
      });

      const savedUser = await newUser.save();
       
    //  Gửi email xác nhận đăng ký
    await sendMail(email, "Đăng ký thành công!", 
        `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2c3e50;">Chào mừng, ${username}! 👋</h2>
        <p style="font-size: 16px;">Chúc mừng bạn đã đăng ký tài khoản thành công! 🎉</p>
        <p style="font-size: 16px;">Hãy khám phá ứng dụng của chúng tôi và tận hưởng những trải nghiệm tuyệt vời.</p>
        <br>
        <p style="font-size: 14px; color: #888;">Nếu bạn có bất kỳ thắc mắc nào, hãy liên hệ với chúng tôi.</p>
        <p style="font-size: 14px; color: #888;">Trân trọng,</p>
        <p style="font-size: 14px; font-weight: bold; color: #2c3e50;">Đội ngũ hỗ trợ YourApp</p>
    </div>`);
  
        // Trả về kết quả đăng ký thành công
        res.status(201).json({
          message: "User registered successfully. Check your email!",
          user: savedUser,
        });
  
  } catch (err) {
      res.status(500).json({ message: 'Error registering user', error: err.message });
  }
};



const login = async (req, res) => {
    const { email, phoneNumber, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
  
        const secretKey = process.env.JWT_SECRET || 'default_secret_key';
        const refreshSecretKey = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_key';
  
        const token = jwt.sign({ id: user._id, username: user.username, isadmin: user.isadmin }, secretKey, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user._id, username: user.username, isadmin: user.isadmin }, refreshSecretKey, { expiresIn: '7d' });
  
        await user.save();
        const responseStatus = user.isadmin ? 200 : 202;
        res.status(responseStatus).json({
            message: 'Login successful',
            token,
            refreshToken,
        });
    } catch (err) {
        res.status(500).json({ message: 'Error logging in', error: err.message });
    }
  };
  const googleAuth = async (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`http://localhost:3000?token=${token}`);
};

const facebookAuth = async (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`http://localhost:3000?token=${token}`);
};

  const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;
    const refreshSecretKey = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_key';

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token is required' });
    }

    try {
        // Giải mã refreshToken và lấy user ID từ đó
        const decoded = jwt.verify(refreshToken, refreshSecretKey);
        
        // Tạo một accessToken mới
        const secretKey = process.env.JWT_SECRET || 'default_secret_key';
        const newToken = jwt.sign({ id: decoded.id, username: decoded.username,  isadmin: decoded.isadmin }, secretKey, { expiresIn: '1h' });

        res.json({ token: newToken });
    } catch (err) {
        res.status(403).json({ message: 'Invalid or expired refresh token', error: err.message });
    }
};

  
const changePassword = async (req, res) => {
  const { email, oldPassword, newPassword, resNewPassword } = req.body;
  if (newPassword !== resNewPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
  }

  if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
  }

  try {
      const user = await User.findOne({ email });

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      if (!oldPassword || typeof oldPassword !== 'string' || oldPassword.trim().length === 0) {
          return res.status(400).json({ message: 'Current password is required and must be a non-empty string' });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
          return res.status(400).json({ message: 'Invalid current password' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      await user.save();

      res.json({ message: 'Password updated successfully' });
  } catch (err) {
      console.error('Error updating password:', err);
      res.status(500).json({ message: 'Error updating password', error: err.message });
  }
};

const getUser = async (req, res) => {
  try {
      const user = await User.find();
      res.status(200).json(user);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

// Cập nhật thông tin người dùng
const updateUser = async (req, res) => {
    try {
        // Lấy token từ header
        const token = req.headers.authorization?.split(' ')[1]; // Token dạng "Bearer <token>"
        // Kiểm tra token
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        let decoded; // Khai báo biến decoded
        // Giải mã token
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    
        const userId = decoded.id;
    
        const allowedFields = ['username', 'phoneNumber', 'email', 'address'];
        const updatedData = {}; // Khởi tạo đối tượng lưu trữ dữ liệu sẽ được cập nhật
        // Chỉ thêm các trường được phép cập nhật vào updatedData
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updatedData[field] = req.body[field];
            }
        }
        // Tìm người dùng và cập nhật thông tin
        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
            new: true, // Trả về tài liệu đã cập nhật
            runValidators: true, // Chạy xác thực cho các trường
        });
        // Kiểm tra xem người dùng có tồn tại không
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        // Ghi log lỗi nếu cần thiết
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
const deleteUser = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            console.log("Không tìm thấy token");
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
        console.log('Decoded Token:', decoded);

        const userIdFromToken = decoded.id;
        const isAdmin = decoded.isadmin;

        console.log(' User ID from token:', userIdFromToken);
        console.log(' Is Admin:', isAdmin);

        let { id } = req.params;
        console.log(" User ID từ request:", id);

        // Nếu id = "me", gán id = userIdFromToken
        if (id === "me") {
            id = userIdFromToken;
        }

        // Cho phép user xóa chính tài khoản của mình
        if (id === userIdFromToken) {
            console.log("Cho phép xóa tài khoản chính mình");

            if (!mongoose.Types.ObjectId.isValid(id)) {
                console.log("ID không hợp lệ:", id);
                return res.status(400).json({ message: 'Invalid user ID' });
            }

            const deletedUser = await User.findByIdAndDelete(id);
            if (!deletedUser) {
                console.log("Không tìm thấy user để xóa");
                return res.status(404).json({ message: 'User not found' });
            }

            console.log("User đã bị xóa:", deletedUser);
            return res.status(200).json({
                message: 'User account deleted successfully',
                user: deletedUser,
            });
        }

        // Nếu là admin, có quyền xóa bất kỳ user nào
        if (isAdmin) {
            console.log("Admin xóa user khác");

            if (!mongoose.Types.ObjectId.isValid(id)) {
                console.log("ID không hợp lệ:", id);
                return res.status(400).json({ message: 'Invalid user ID' });
            }

            const deletedUser = await User.findByIdAndDelete(id);
            if (!deletedUser) {
                console.log("Không tìm thấy user để xóa");
                return res.status(404).json({ message: 'User not found' });
            }

            console.log("Admin đã xóa user:", deletedUser);
            return res.status(200).json({
                message: 'Admin deleted user successfully',
                user: deletedUser,
            });
        }

        // Nếu không phải admin & không phải chủ tài khoản => Cấm xóa
        console.log("Permission denied");
        return res.status(403).json({ message: 'Permission denied' });

    } catch (error) {
        console.log("Lỗi server:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Đăng xuất
const logout = async (req, res) => {
    const { refreshToken } = req.body;
    // Nếu không có refreshToken, trả về lỗi
    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }
    try {
        // Tìm người dùng dựa trên refreshToken
        const user = await User.findOne({ refreshToken });
        if (!user) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
        // Xóa refreshToken khỏi cơ sở dữ liệu
        user.refreshToken = null;
        await user.save();
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error during logout', error: error.message });
    }
};
 // Lấy số lượng người dùng và tỷ lệ tăng trưởng
const getUserGrowth = async (req, res) => {
    try {
      const now = new Date();
  
      // Tính ngày đầu tiên của tuần hiện tại
      const startOfCurrentWeek = new Date(now);
      startOfCurrentWeek.setDate(now.getDate() - now.getDay());
      startOfCurrentWeek.setHours(0, 0, 0, 0);
  
      // Tính ngày đầu tiên của tuần trước
      const startOfLastWeek = new Date(startOfCurrentWeek);
      startOfLastWeek.setDate(startOfCurrentWeek.getDate() - 7);
  
      // Tính ngày cuối cùng của tuần trước
      const endOfLastWeek = new Date(startOfCurrentWeek);
  
      // Đếm số lượng người dùng trong tuần hiện tại
      const currentCount = await User.countDocuments({
        createdAt: { $gte: startOfCurrentWeek }
      });
  
      // Đếm số lượng người dùng trong tuần trước
      const previousWeekCount = await User.countDocuments({
        createdAt: { $gte: startOfLastWeek, $lt: endOfLastWeek }
      });
  
      // Tính tỷ lệ tăng trưởng
      const growthPercentage = previousWeekCount === 0
        ? 100 // Nếu tuần trước không có người dùng
        : ((currentCount - previousWeekCount) / previousWeekCount) * 100;
  
      res.status(200).json({
        success: true,
        data: {
          currentCount,
          previousWeekCount,
          growthPercentage: growthPercentage.toFixed(2) // Làm tròn 2 chữ số
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  const getUserById = async (req, res) => {
    try {
        // Lấy token từ header
        const token = req.headers.authorization?.split(' ')[1]; // Token dạng "Bearer <token>"
        
        // Kiểm tra token
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        // Giải mã token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
        } catch (error) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        // Lấy user ID từ token
        const userId = decoded.id;

        // Tìm người dùng trong cơ sở dữ liệu
        const user = await User.findById(userId).select('-password -refreshToken'); // Loại bỏ password và refreshToken

        // Nếu không tìm thấy người dùng
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Trả về thông tin người dùng
        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data', error: error.message });
    }
};

// Thêm sản phẩm vào danh sách yêu thích
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.id;
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid userId or productId' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.wishlist.includes(productId)) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        user.wishlist.push(productId);
        await user.save();

        res.status(200).json({ message: 'Product added to wishlist', wishlist: user.wishlist });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Lấy danh sách sản phẩm yêu thích
exports.getWishlist = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid userId' });
        }

        const user = await User.findById(userId).populate('wishlist');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ wishlist: user.wishlist });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// Lấy danh sách sản phẩm yêu thích
const getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;  // Lấy userId từ token

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid userId" });
        }

        const user = await User.findById(userId)
            .populate("wishlist")  // Lấy toàn bộ thông tin sản phẩm
            .exec();  // Đảm bảo truy vấn được thực hiện đúng

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({ wishlist: user.wishlist });
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// Xóa sản phẩm khỏi danh sách yêu thích
const removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy userId từ token
        const { productId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid productId' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Kiểm tra xem sản phẩm có trong wishlist không
        if (!user.wishlist.includes(productId)) {
            return res.status(400).json({ message: 'Product not found in wishlist' });
        }

        // Xóa sản phẩm khỏi wishlist
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        res.status(200).json({ message: 'Product removed from wishlist', wishlist: user.wishlist });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


module.exports = {
  register,
  login,
  googleAuth,
  facebookAuth,
  changePassword,
  getUser,
  refreshAccessToken,
  updateUser,
  deleteUser,
  logout,
  getUserGrowth,
  getUserById,
  addToWishlist,
  getWishlist,
  removeFromWishlist
};