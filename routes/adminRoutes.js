const express = require("express");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const SecurityGuard = require("../models/SecurityGuard");
const Employee = require("../models/Employee");
const Visitor = require("../models/Visitor"); // ✅ Import Visitor model
const EmployeeVisitor = require("../models/EmployeeVisitor"); // ✅ Import EmployeeVisitor Model
const imagekit = require("../config/imagekit"); // ✅ ImageKit for photo upload
const QRCode = require("qrcode"); // ✅ QR Code generator
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

// ✅ Admin Dashboard Route
router.get("/", protect, adminOnly, (req, res) => {
    res.render("admin");
});

// ✅ Routes for adding users
router.get("/add-employee", protect, adminOnly, (req, res) => {
    res.render("addUser", { role: "employee" });
});

router.get("/add-security", protect, adminOnly, (req, res) => {
    res.render("addUser", { role: "security" });
});

router.get("/add-admin", protect, adminOnly, (req, res) => {
    res.render("addUser", { role: "admin" });
});

// ✅ Handle User Registration (Stored in Correct Collections)
router.post("/add-user", protect, adminOnly, async (req, res) => {
    try {
        const { email, password, role, visitorLimit } = req.body;

        if (!email || !password || !role) {
            return res.status(400).send("All fields are required");
        }

        // Select the correct model
        let UserModel;
        if (role === "admin") UserModel = Admin;
        else if (role === "security") UserModel = SecurityGuard;
        else if (role === "employee") UserModel = Employee;
        else return res.status(400).send("Invalid role!");

        // Check if user already exists in the respective collection
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).send("User already exists");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new UserModel({
            email,
            password: hashedPassword,
            ...(role === "employee" && { visitorLimit: visitorLimit || 5 }) // Employee-specific field
        });

        await newUser.save();
        res.redirect("/admin"); 
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send("Internal Server Error");
    }
});

// ✅ Fetch and Display All Admins
router.get("/view-admins", protect, adminOnly, async (req, res) => {
    try {
        const admins = await Admin.find({}, "email"); 
        res.render("viewUsers", { title: "Admins", users: admins });
    } catch (error) {
        console.error("Error fetching admins:", error);
        res.status(500).send("Internal Server Error");
    }
});

// ✅ Fetch and Display All Employees
router.get("/view-employees", protect, adminOnly, async (req, res) => {
    try {
        const employees = await Employee.find({}, "email visitorLimit");
        res.render("viewUsers", { title: "Employees", users: employees });
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).send("Internal Server Error");
    }
});

// ✅ Fetch and Display All Security Guards
router.get("/view-security", protect, adminOnly, async (req, res) => {
    try {
        const securityGuards = await SecurityGuard.find({}, "email");
        res.render("viewUsers", { title: "Security Guards", users: securityGuards });
    } catch (error) {
        console.error("Error fetching security guards:", error);
        res.status(500).send("Internal Server Error");
    }
});




// ✅ Route to render pending visitors approval page
router.get("/visitorApproval", protect, adminOnly, async (req, res) => {
    try {
        const visitors = await Visitor.find({ status: "Pending" }); // Get pending visitors
        res.render("visitorApproval", { visitors });
    } catch (error) {
        console.error("Error fetching visitors:", error);
        res.status(500).send("Internal Server Error");
    }
});

// ✅ Approve Visitor & Generate QR Code
router.put("/approve/:id", protect, adminOnly, async (req, res) => {
    try {
        const visitor = await Visitor.findById(req.params.id);
        if (!visitor) return res.status(404).json({ message: "Visitor not found" });

        // ✅ Generate QR Code with ALL visitor details
        const qrData = JSON.stringify({
            fullName: visitor.fullName,
            contactInfo: visitor.contactInfo,
            purpose: visitor.purpose,
            hostName: visitor.hostName,
            hostDepartment: visitor.hostDepartment,
            company: visitor.company || "Individual",
            checkInTime: visitor.checkInTime,
            checkOutTime: visitor.checkOutTime,
            status: "Approved",
        });

        const qrCodeUrl = await QRCode.toDataURL(qrData);

        // ✅ Update visitor status and store the QR Code
        visitor.status = "Approved";
        visitor.qrCode = qrCodeUrl;
        await visitor.save();

        res.json({
            message: "✅ Visitor approved, QR Code generated!",
            visitor
        });

    } catch (error) {
        console.error("❌ Error approving visitor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Reject Visitor
router.put("/reject/:id", protect, adminOnly, async (req, res) => {
    try {
        const visitor = await Visitor.findByIdAndUpdate(req.params.id, { status: "Rejected" }, { new: true });
        if (!visitor) return res.status(404).json({ message: "Visitor not found" });
        res.json({ message: "❌ Visitor rejected!", visitor });
    } catch (error) {
        console.error("❌ Error rejecting visitor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Route to Get All QR Codes for Approved Visitors
router.get("/qr-codes", protect, adminOnly, async (req, res) => {
    try {
        const approvedVisitors = await Visitor.find({ status: "Approved" });
        res.render("qr", { visitors: approvedVisitors });
    } catch (error) {
        console.error("❌ Error fetching QR codes:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.get("/visitor-history", protect, adminOnly, async (req, res) => {
    try {
        const visitors = await Visitor.find({
            status: { $in: ["Approved", "Rejected"] }
        }).sort({ updatedAt: -1 });

        // Group visitors by date (handle undefined updatedAt)
        const history = {};
        visitors.forEach(visitor => {
            const date = visitor.updatedAt ? visitor.updatedAt.toISOString().split("T")[0] : "Unknown Date";

            if (!history[date]) history[date] = [];
            history[date].push(visitor);
        });

        res.render("visitorHistory", { history });
    } catch (error) {
        console.error("❌ Error fetching visitor history:", error);
        res.status(500).send("Internal Server Error");
    }
});


// ✅ Render Employee Visitor Approval Page
router.get("/employee-visitorApproval", protect, adminOnly, async (req, res) => {
    try {
        const employeeVisitors = await EmployeeVisitor.find({ status: "Pending" });
        res.render("employeeVisitorsApproval", { employeeVisitors });
    } catch (error) {
        console.error("❌ Error fetching employee visitors:", error);
        res.status(500).send("Error loading employee visitor approvals");
    }
});


router.put("/update-employee-visitor-status/:id", protect, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;
        const visitor = await EmployeeVisitor.findById(req.params.id);

        if (!visitor) {
            return res.status(404).json({ success: false, message: "Visitor not found" });
        }

        visitor.status = status;

        if (status.trim().toLowerCase() === "approved") {
            const qrData = JSON.stringify({
                fullName: visitor.fullName,
                contactInfo: visitor.contactInfo,
                purpose: visitor.purpose,
                hostName: visitor.hostName,
                checkInTime: visitor.checkInTime,
                checkOutTime: visitor.checkOutTime,
                status: "Approved",
            });

            visitor.qrCode = await QRCode.toDataURL(qrData);
        }

        await visitor.save();
        res.json({ success: true, message: `Visitor ${status} successfully!`, visitor });
    } catch (error) {
        console.error("Error updating visitor status:", error);
        res.status(500).json({ success: false, message: "Error updating visitor status" });
    }
});

// ✅ Route: View Employee Visitor History (Only for Admins)
router.get("/employee-visitor-history", protect, adminOnly, async (req, res) => {
    try {
        const visitors = await EmployeeVisitor.find().sort({ createdAt: -1 }); // Fetch in descending order (latest first)
        res.render("employeeVisitorHistory", { visitors });
    } catch (error) {
        console.error("❌ Error fetching employee visitor history:", error);
        res.status(500).send("Error fetching employee visitor history");
    }
});



module.exports = router;
