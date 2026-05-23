const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes
const protect = async (req, res, next) => {
  let token;

  // Read JWT from HTTP-only cookie first, then fall back to Bearer token in headers
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized to access this route" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "aonelub_super_secret",
    );

    // Attach user to request
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found with this token" });
    }

    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, token failed" });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : "guest"}' is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
