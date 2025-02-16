const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const SecurityGuard = require("../models/SecurityGuard");
const Employee = require("../models/Employee");
require("dotenv").config();

const router = express.Router();

router.get("/register", (req, res) => {
    res.render("register");
});

router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/register", async (req, res) => {
    const { email, password, role, visitorLimit } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        let userModel;
        if (role === "admin") userModel = Admin;
        else if (role === "security") userModel = SecurityGuard;
        else if (role === "employee") userModel = Employee;
        else return res.status(400).json({ message: "Invalid role!" });

        const existingUser = await userModel.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists!" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            email,
            password: hashedPassword,
            ...(role === "employee" && { visitorLimit: visitorLimit || 5 }) 
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/login", async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        let userModel;
        if (role === "admin") userModel = Admin;
        else if (role === "security") userModel = SecurityGuard;
        else if (role === "employee") userModel = Employee;
        else return res.status(400).json({ message: "Invalid role!" });

        const user = await userModel.findOne({ email });
        if (!user) return res.status(401).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const userRole = role; 

        const token = jwt.sign(
            { id: user._id, role: userRole, email: user.email }, 
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });

        let redirectUrl = "/";
        if (userRole === "admin") redirectUrl = "/admin";
        else if (userRole === "security") redirectUrl = "/security";
        else if (userRole === "employee") redirectUrl = "/employee";

        res.json({ message: "Login successful", role: userRole, redirectUrl });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});


router.post("/logout", (req, res) => {
    res.cookie("token", "", { expires: new Date(0) });
    res.json({ message: "Logged out successfully" });
});

module.exports = router;
