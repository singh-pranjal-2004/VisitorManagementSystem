const mongoose = require("mongoose");

const VisitorSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    contactInfo: { type: String, required: true },
    purpose: { type: String, required: true },
    hostEmployee: { 
        name: { type: String, required: true },
        department: { type: String, required: true }
    },
    company: { type: String },
    checkInTime: { type: Date, default: Date.now }, // Automatically logs entry time
    checkOutTime: { type: Date },
    photoURL: { type: String, required: true }, // ImageKit URL for the visitor's photo
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    qrCode: { type: String }, // Store QR code URL or data
}, { timestamps: true });

module.exports = mongoose.model("Visitor", VisitorSchema);
