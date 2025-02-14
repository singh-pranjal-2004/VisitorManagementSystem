const Visitor = require("../models/Visitor");
const imagekit = require("../config/imagekit"); // ✅ Import ImageKit

// Security Dashboard - View Approved Visitors
exports.getSecurityDashboard = async (req, res) => {
    try {
        const visitors = await Visitor.find({ status: "Approved" });
        res.render("security", { visitors });
    } catch (error) {
        console.error("❌ Error loading security dashboard:", error);
        res.status(500).json({ message: "Internal Server Error" }); // ✅ Ensuring JSON response
    }
};

// Visitor Check-in Form
exports.getVisitorForm = (req, res) => {
    res.render("visitor_form");
};

// Process Visitor Entry
exports.processVisitorEntry = async (req, res) => {
    try {
        const { fullName, contactInfo, purpose, hostName, hostDepartment, company, checkInTime, checkOutTime, photo } = req.body;

        if (!fullName || !contactInfo || !purpose || !hostName || !hostDepartment || !checkInTime || !checkOutTime || !photo) {
            return res.status(400).json({ message: "All fields including photo are required!" });
        }

        // ✅ Validate Base64 Image Format
        if (!photo.startsWith("data:image/jpeg;base64,") && !photo.startsWith("data:image/png;base64,")) {
            return res.status(400).json({ message: "Invalid image format. Please use JPEG or PNG." });
        }

        // ✅ Upload visitor photo to ImageKit
        let uploadedImage;
        try {
            uploadedImage = await imagekit.upload({
                file: photo, // Base64 image
                fileName: `visitor_${Date.now()}.jpg`,
                folder: "/visitor_photos"
            });
        } catch (uploadError) {
            console.error("❌ Image Upload Error:", uploadError);
            return res.status(500).json({ message: "Failed to upload image. Try again." });
        }

        // ✅ Create a new visitor entry
        const newVisitor = new Visitor({
            fullName,
            contactInfo,
            purpose,
            hostName,
            hostDepartment,
            company: company || "Individual",
            checkInTime, // ✅ Store manually entered time
            checkOutTime, // ✅ Store manually entered time
            photoUrl: uploadedImage.url, // ✅ Save ImageKit URL
            status: "Pending", // Needs admin approval
        });

        await newVisitor.save();
        return res.status(201).json({ message: "Visitor registered successfully!" }); // ✅ Return JSON instead of redirecting

    } catch (error) {
        console.error("❌ Error processing visitor entry:", error);
        return res.status(500).json({ message: "Internal server error" }); // ✅ Ensure JSON response
    }
};
