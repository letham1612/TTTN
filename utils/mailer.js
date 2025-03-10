const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  //port: process.env.SMTP_PORT,
  host: process.env.SMTP_HOST,
  port: 465,  // Hoặc thử lại với 587
  secure: true, // Nếu dùng 587, thử đặt false
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendMail = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: `"Your App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log("Email đã gửi thành công!");
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    throw error; // Ném lỗi để kiểm tra dễ dàng hơn
  }
};

module.exports = sendMail; //  Export đúng