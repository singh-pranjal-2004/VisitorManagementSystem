const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const EmployeeSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    visitorLimit: { type: Number, default: 5 } // Only for employees
});

// Method to compare hashed passwords
EmployeeSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const Employee = mongoose.model("Employee", EmployeeSchema);
module.exports = Employee;
