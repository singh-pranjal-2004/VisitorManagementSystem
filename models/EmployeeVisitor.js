const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    department: { type: String, required: true },
    visitorLimit: { type: Number, default: 5 }, // Default visitor limit per employee
    role: { type: String, default: "employee" }
}, { timestamps: true });

module.exports = mongoose.model("Employee", EmployeeSchema);
