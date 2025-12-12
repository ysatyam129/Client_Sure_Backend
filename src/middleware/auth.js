import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

// JWT Authentication Middleware
export const authenticateToken = async (req, res, next) => {
  try {
    // Check for token in Authorization header (Bearer TOKEN) or cookies
    // kaushik ne commet kiya hai 2lines
    // const authHeader = req.headers['authorization'];
    // const headerToken = authHeader && authHeader.split(' ')[1];
    const cookieToken = req.cookies?.userToken;

    // kaushik work here
    const headerToken = req.headers.authorization?.replace("Bearer ", "");
    //      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    // kauhik work above
    const token = headerToken || cookieToken;

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate decoded token structure
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: "Invalid token structure" });
    }

    // Find user and check if still exists
    const user = await User.findById(decoded.userId).populate(
      "subscription.planId"
    );
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Check if subscription is still active
    const now = new Date();
    const endDate = new Date(user.subscription.endDate);
    if (user.subscription.endDate && endDate < now) {
      return res.status(401).json({ error: "Subscription expired" });
    }

    // Add user to request object
    req.user = {
      userId: user._id,
      id: user._id,
      email: user.email,
      name: user.name,
      tokens: user.tokens,
      subscription: user.subscription,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }

    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Optional: Admin role check middleware
export const requireAdmin = (req, res, next) => {
  // Add admin check logic here if needed
  // For now, just pass through
  next();
};
