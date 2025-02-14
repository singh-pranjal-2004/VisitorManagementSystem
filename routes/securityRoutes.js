const express = require("express");
const router = express.Router();
const { protect, authorize, securityOnly } = require("../middlewares/authMiddleware");
const securityController = require("../controllers/securityController");

// Security Dashboard Route
router.get("/", protect, authorize(["security"]), securityController.getSecurityDashboard);

// Visitor Form Route
router.get("/visitor-form", protect, authorize(["security"]), securityController.getVisitorForm);

// Process Visitor Entry
router.post("/visitor-entry", protect, authorize(["security"]), securityController.processVisitorEntry);

router.get("/qr-codes", protect, securityOnly, async (req, res) => {
    try {
        const approvedVisitors = await Visitor.find({ status: "Approved" }, "fullName qrCode");

        res.render("qrCodes", { visitors: approvedVisitors });
    } catch (error) {
        console.error("❌ Error fetching QR codes:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
