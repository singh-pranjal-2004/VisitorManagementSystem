const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware setup
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("MongoDB Connected"))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });

// Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const securityRoutes = require("./routes/securityRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const visitorRoutes = require("./routes/visitorRoutes");

app.use("/api/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/security", securityRoutes);
app.use("/employee", employeeRoutes);
app.use("/visitor", visitorRoutes);

// Homepage
app.get("/", (req, res) => {
    res.render("index");
});

// Error handling
app.use((err, req, res, next) => {
    console.error("Server Error:", err);
    res.status(500).send("Something went wrong!");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
