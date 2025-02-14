const Visitor = require("./models/Visitor");
const imagekit = require("./config/imagekit");
const QRCode = require("qrcode");

// Register Visitor
exports.registerVisitor = async (req, res) => {
  try {
    const { fullName, contactInfo, purpose, hostName, hostDepartment, company, photo } = req.body;

    if (!fullName || !contactInfo || !purpose || !hostName || !hostDepartment || !photo) {
      return res.status(400).json({ message: "All fields including photo are required!" });
    }

    // Upload Photo to ImageKit
    const uploadedImage = await imagekit.upload({
      file: photo, // Base64 image from frontend
      fileName: `visitor_${Date.now()}.jpg`,
      folder: "/visitor_photos"
    });

    // Create visitor entry
    const newVisitor = new Visitor({
      fullName,
      contactInfo,
      purpose,
      hostName,
      hostDepartment,
      company: company || "Individual",
      photoUrl: uploadedImage.url,
    });

    await newVisitor.save();
    res.json({ message: "✅ Visitor registered successfully!", visitor: newVisitor });

  } catch (error) {
    console.error("❌ Error registering visitor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Approve Visitor & Generate QR Code
exports.approveVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ message: "Visitor not found" });

    // Generate QR Code with visitor details
    const qrData = JSON.stringify({
      name: visitor.fullName,
      contact: visitor.contactInfo,
      purpose: visitor.purpose,
      host: visitor.hostName,
      status: "Approved",
    });

    const qrCodeUrl = await QRCode.toDataURL(qrData);

    // Update visitor status and QR Code URL
    visitor.status = "Approved";
    visitor.qrCode = qrCodeUrl;
    await visitor.save();

    res.json({ message: "✅ Visitor approved, QR Code generated!", visitor });

  } catch (error) {
    console.error("❌ Error approving visitor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reject Visitor
exports.rejectVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, { status: "Rejected" }, { new: true });
    if (!visitor) return res.status(404).json({ message: "Visitor not found" });

    res.json({ message: "❌ Visitor rejected!", visitor });

  } catch (error) {
    console.error("❌ Error rejecting visitor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
