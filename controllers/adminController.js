const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.addUserForm = (req, res, role) => {
    try {
        if (!role) {
            return res.status(400).send("Role is required");
        }
        res.render("addUser", { role });
    } catch (error) {
        res.status(500).send("Error displaying form.");
    }
};

exports.addUser = async (req, res) => {
    try {
        const { email, password, role, visitorLimit } = req.body;

        if (!email || !password || !role) {
            return res.status(400).send("All fields are required");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            password: hashedPassword,
            role,
            visitorLimit: role === "employee" ? visitorLimit || 5 : undefined
        });

        await newUser.save();
        res.redirect("/admin");
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send("Internal Server Error");
    }
};
