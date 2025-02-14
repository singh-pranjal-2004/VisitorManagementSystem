const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/authMiddleware"); // ✅ Ensure correct import

// Security Dashboard
router.get("/", protect, authorize(["security"]), (req, res) => {
    res.render("security");
});

// Visitor Check-in Form
router.get("/visitor-form", protect, authorize(["security"]), (req, res) => {
    res.render("visitor_form");
});

// Process Visitor Entry
router.post("/visitor-entry", protect, authorize(["security"]), (req, res) => {
    // Logic to store visitor details
    res.redirect("/security");
});

module.exports = router;
