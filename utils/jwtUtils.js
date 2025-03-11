const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, isadmin: user.isadmin },
    process.env.JWT_SECRET || "default_secret_key",
    { expiresIn: "1h" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, username: user.username, isadmin: user.isadmin },
    process.env.JWT_REFRESH_SECRET || "default_refresh_secret_key",
    { expiresIn: "7d" }
  );
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
};

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };
