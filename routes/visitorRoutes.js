const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

// Visitor Registration Page
router.get("/register", (req, res) => {
    res.render("visitor_form");
});

// Handle Visitor Registration
router.post("/register", (req, res) => {
    // Logic to register a visitor
    res.redirect("/");
});

module.exports = router;
