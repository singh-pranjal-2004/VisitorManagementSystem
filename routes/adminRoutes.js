const express = require("express");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");
const SecurityGuard = require("../models/SecurityGuard");
const Employee = require("../models/Employee");
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

module.exports = router;
