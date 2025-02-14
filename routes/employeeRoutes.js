const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middlewares/authMiddleware");

// Employee Dashboard
router.get("/", protect, authorize(["employee"]), (req, res) => {
    res.render("employee");
});

// Add Visitor for Employee (Friends/Family)
router.post("/add-visitor", protect, authorize(["employee"]), (req, res) => {
    // Logic to add an employee's visitor
    res.redirect("/employee");
});

module.exports = router;
