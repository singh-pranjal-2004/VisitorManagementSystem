const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SecurityGuardSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Method to compare hashed passwords
SecurityGuardSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const SecurityGuard = mongoose.model("SecurityGuard", SecurityGuardSchema);
module.exports = SecurityGuard;
