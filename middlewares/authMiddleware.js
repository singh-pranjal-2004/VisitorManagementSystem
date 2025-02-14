const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to protect routes (JWT Authentication)
const protect = (req, res, next) => {
    const token = req.cookies?.token; // Ensure token exists

    if (!token) {
        return res.status(401).json({ message: "Unauthorized! No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to request object
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        res.status(401).json({ message: "Invalid or expired token!" });
    }
};

// Middleware for strict admin-only access
const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.redirect("/login"); // Redirect instead of sending JSON
    }
    next();
};

// Middleware for security guard-only access
const securityOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "security") {
        return res.redirect("/login"); // Redirect instead of sending JSON
    }
    next();
};

// Middleware for flexible role-based access
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.redirect("/login"); // Redirect instead of sending JSON
        }
        next();
    };
};

module.exports = { protect, adminOnly, securityOnly, authorize };
