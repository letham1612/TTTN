const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const userRoutes = require("./routes/UserRoute");
const productRoutes = require("./routes/ProductRoute");
const typeRoutes = require("./routes/TypeRoute");
const brandRouter = require("./routes/BrandRoute");
const CartRouter = require("./routes/CartRoute");
const couponRoutes = require("./routes/CouponRoute");
const paymentRoutes = require("./routes/PaymentRoute");
const OrderRoutes = require("./routes/OrderRoute");
const blogRoutes = require('./routes/BlogRoute');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const reviewRoutes = require("./routes/ReviewRoute");
const multer = require("multer");
const mongoose = require("mongoose");
const passport = require("./config/passport"); 
const session = require("express-session");
const recommendationRoutes = require('./routes/recommendationRoutes');

require("dotenv").config()

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cấu hình express-session
app.use(
  session({
    secret: "your_secret_key", // Chuỗi bí mật để mã hóa session
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24h
  })
);

// Khởi tạo Passport
app.use(passport.initialize());
app.use(passport.session()); 

// Kết nối MongoDB
const DB_URI = process.env.MONGODB_URI;
mongoose
  .connect(DB_URI)
  .then(() => console.log("Kết nối MongoDB thành công!"))
  .catch((err) => console.error("Lỗi kết nối MongoDB:", err));

// Đường dẫn tĩnh
app.use('/images', express.static(path.join(__dirname, 'assets/images')));
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/types", typeRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use("/api/brands", brandRouter);
app.use("/api/carts", CartRouter);
app.use("/api/coupons", couponRoutes);
app.use("/api/orders", OrderRoutes);
app.use("/api/payments", paymentRoutes);
app.use('/api/blogs', blogRoutes);
app.use("/api/reviews", reviewRoutes);
app.use('/api', recommendationRoutes);


// Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './assets/images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("File không hợp lệ, chỉ chấp nhận ảnh"), false);
    }
    cb(null, true);
  },
});

// Route upload file
app.post('/api/uploads', upload.any(), (req, res) => {
  if (req.files && req.files.length > 0) {
    const uploadedFiles = req.files.map(file => ({
      originalName: file.originalname,
      storedName: file.filename,
      path: file.path,
    }));
    res.json({ message: 'Upload thành công', files: uploadedFiles });
  } else {
    res.status(400).json({ message: 'Không có file nào được gửi lên' });
  }
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});

module.exports = app;

