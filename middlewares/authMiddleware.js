const jwt = require("jsonwebtoken");
require("dotenv").config();

const protect = (req, res, next) => {
    const token = req.cookies?.token; 

    if (!token) {
        return res.status(401).json({ message: "Unauthorized! No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        res.status(401).json({ message: "Invalid or expired token!" });
    }
};

const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.redirect("/login");
    }
    next();
};

const securityOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "security") {
        return res.redirect("/login"); 
    }
    next();
};

const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.redirect("/login"); 
        }
        next();
    };
};

const employeeOnly = (req, res, next) => {
    if (req.user && req.user.role === "Employee") {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Employees only!" });
    }
};

module.exports = { protect, adminOnly, securityOnly, authorize, employeeOnly };
