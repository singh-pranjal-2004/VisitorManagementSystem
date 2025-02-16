const express = require("express");
const { protect, authorize } = require("../middlewares/authMiddleware");
const Employee = require("../models/Employee");
const EmployeeVisitor = require("../models/EmployeeVisitor");
const imagekit = require("../config/imagekit");
const cron = require("node-cron");


const router = express.Router();

cron.schedule("0 0 * * *", async () => {
    try {
        const result = await Employee.updateMany({}, { visitorLimit: 5 });
        console.log(`✅ Visitor limits reset for ${result.modifiedCount} employees.`);
    } catch (error) {
        console.error("❌ Error resetting visitor limits:", error);
    }
});

router.get("/", protect, authorize(["employee"]), async (req, res) => {
    try {
        const employee = await Employee.findById(req.user.id).select("email");
        if (!employee) {
            return res.status(404).send("Employee not found");
        }
        res.render("employeeDashboard", { employee });
    } catch (error) {
        console.error("Error fetching employee:", error);
        res.status(500).send("Error loading dashboard");
    }
});

router.get("/add-visitor", protect, authorize(["employee"]), (req, res) => {
    res.render("addVisitor");
});

router.post("/add-visitor", protect, authorize(["employee"]), async (req, res) => {
    try {
        const {
            fullName,
            contactInfo,
            purpose,
            hostName,
            hostDepartment,
            company,
            checkInTime,
            checkOutTime,
            photoBase64 
        } = req.body;

        if (!fullName || !contactInfo || !purpose || !hostName || !hostDepartment || !checkInTime || !checkOutTime || !photoBase64) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const employee = await Employee.findById(req.user.id);
        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        if (employee.visitorLimit <= 0) {
            return res.status(400).json({ message: "Visitor limit exceeded" });
        }

        const uploadedImage = await imagekit.upload({
            file: photoBase64,
            fileName: `${Date.now()}.jpg`,
            folder: "/employeeVisitor-photos"
        });

        const hostEmail = req.user.email; 

        const newVisitor = new EmployeeVisitor({
            fullName,
            contactInfo,
            purpose,
            hostName,
            hostEmail,
            hostDepartment,
            company: company || "Individual",
            checkInTime,
            checkOutTime,
            photoUrl: uploadedImage.url,
            status: "Pending",
        });

        await newVisitor.save();

        employee.visitorLimit -= 1;
        await employee.save();

        res.redirect("/employee/add-visitor");
    } catch (error) {
        console.error("❌ Error adding visitor:", error);
        res.status(500).send("Error adding visitor");
    }
});

router.get("/visitor-limit", protect, authorize(["employee"]), async (req, res) => {
    try {
        const employee = await Employee.findById(req.user.id);

        if (!employee) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json({ visitorLimit: employee.visitorLimit });
    } catch (error) {
        console.error("❌ Error fetching visitor limit:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

router.get("/view-qr", protect, authorize(["employee"]), async (req, res) => {
    try {
        const employeeEmail = req.user.email;

        const visitors = await EmployeeVisitor.find({
            hostEmail: employeeEmail,
        }).select("fullName contactInfo photoUrl qrCode purpose hostName hostDepartment company checkInTime checkOutTime status");

        res.render("employeeQR", { visitors });
    } catch (error) {
        console.error("❌ Error fetching QR codes:", error);
        res.status(500).send("Error loading QR codes");
    }
});

module.exports = router;
