const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const Visitor = require("../models/Visitor");


router.get("/register", (req, res) => {
    res.render("visitor_form");
});

router.post("/register", (req, res) => {
    res.redirect("/");
});

router.get("/qr-codes", async (req, res) => {
    try {
        const visitors = await Visitor.find({
            status: { $in: ["Approved", "Rejected"] },
        });

        res.render("qrCodes", { visitors });
    } catch (error) {
        console.error("❌ Error fetching QR codes:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});




module.exports = router;
