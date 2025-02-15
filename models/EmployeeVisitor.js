const mongoose = require("mongoose");

const employeeVisitorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  contactInfo: { type: String, required: true },
  purpose: { type: String, required: true },
  hostName: { type: String, required: true }, // Employee's name
  hostEmail: { type: String, required: true },  // ✅ Use this to filter visitors
  hostDepartment: { type: String, required: true },
  company: { type: String, default: "Individual" },
  checkInTime: { type: String, required: true },
  checkOutTime: { type: String, required: true },
  photoUrl: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  qrCode: { type: String }, // Store QR Code URL
}, { timestamps: true });

module.exports = mongoose.model("EmployeeVisitor", employeeVisitorSchema);
