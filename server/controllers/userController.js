const User = require("../models/User");
const Doctor = require("../models/Doctor");

exports.loginUser = async (req, res) => {
  const { contactNumber, password } = req.body;

  if (!contactNumber || !password) {
    return res.status(400).json({ error: "Contact number and password are required" });
  }

  try {
    // Find user by contact number
    const user = await User.findOne({ contactNumber });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Compare plain password (no hashing)
    if (user.password !== password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Respond with role and associated IDs
    return res.status(200).json({
      role: user.role,
      docid: user.role === "doctor" ? user.doctorId || null : null,
      patid: user.role === "patient" ? user.patientId || null : null,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


exports.registerUser = async (req, res) => {
  try {
    const { contactNumber, password } = req.body;

    if (!contactNumber || !password) {
      return res.status(400).json({ error: "Contact number and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ contactNumber });
    if (existingUser) {
      return res.status(400).json({ error: "User with this contact already exists" });
    }

    // Create User with role 'doctor'
    const user = await User.create({
      contactNumber,
      password, // plain password, no encryption
      role: "doctor",
    });

    // Create Doctor document linked to this user
    const doctor = await Doctor.create({
      
    });

    // Update User with doctorId
    user.doctorId = doctor._id;
    await user.save();

    res.status(201).json({ docid: doctor._id });
  } catch (err) {
    console.error("Register user error:", err);
    res.status(500).json({ error: "Server error" });
  }
};



exports.registerUser = async (req, res) => {
  try {
    const { name, contactNumber, password } = req.body;

    if (!name || !contactNumber || !password) {
      return res.status(400).json({ error: "Name, contact number and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ contactNumber });
    if (existingUser) {
      return res.status(400).json({ error: "User with this contact already exists" });
    }

    // Create User with role 'doctor'
    const user = await User.create({
      contactNumber,
      password, // plain password
      role: "doctor",
    });

    // Create Doctor document linked to this user
    const doctor = await Doctor.create({
      name,
    });

    // Update User with doctorId
    user.doctorId = doctor._id;
    await user.save();

    res.status(201).json({ docid: doctor._id });
  } catch (err) {
    console.error("Register user error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// Change password
exports.changePassword = async (req, res) => {
  try {
    const { contactNumber, oldPassword, newPassword } = req.body;

    if (!contactNumber || !oldPassword || !newPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Find user
    const user = await User.findOne({ contactNumber });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Verify old password
    if (user.password !== oldPassword) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully", success: true });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Server error", success: false });
  }
};
