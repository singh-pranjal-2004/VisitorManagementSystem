const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const Visitor = require("../models/Visitor"); // Import your Visitor model


// Visitor Registration Page
router.get("/register", (req, res) => {
    res.render("visitor_form");
});

// Handle Visitor Registration
router.post("/register", (req, res) => {
    // Logic to register a visitor
    res.redirect("/");
});

router.get("/qr-codes", async (req, res) => {
    try {
        // Fetch both Approved and Rejected visitors
        const visitors = await Visitor.find({
            status: { $in: ["Approved", "Rejected"] }, // Get only Approved & Rejected visitors
        });

        res.render("qrCodes", { visitors }); // Pass all visitors to the EJS template
    } catch (error) {
        console.error("❌ Error fetching QR codes:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});




module.exports = router;
