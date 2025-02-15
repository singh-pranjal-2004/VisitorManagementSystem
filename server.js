const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const app = express();

// ✅ Middleware Setup
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // For form data
app.use(express.json({ limit: "10mb" })); // For JSON payloads
app.use(cookieParser()); // For reading JWT from cookies
app.use(express.static(path.join(__dirname, "public"))); // Serve static assets

// ✅ Set View Engine
app.set("view engine", "ejs");

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1); // Exit process if DB connection fails
    });

// ✅ Route Imports
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const securityRoutes = require("./routes/securityRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const visitorRoutes = require("./routes/visitorRoutes");

// ✅ Use Routes
app.use("/api/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/security", securityRoutes);
app.use("/employee", employeeRoutes);
app.use("/visitor", visitorRoutes);

// ✅ Home Route
app.get("/", (req, res) => {
    res.render("index"); // Render landing page
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err);
    res.status(500).send("Something went wrong! Please try again.");
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
