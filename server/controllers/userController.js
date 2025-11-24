exports.resetPassword = async (req, res) => {
  const { contactNumber, otp, newPassword } = req.body;
  if (!contactNumber || !otp || !newPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  const code = verificationCodes[contactNumber];
  if (!code) {
    return res.status(400).json({ error: 'No OTP sent to this number' });
  }
  if (code !== otp) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }
  const user = await User.findOne({ contactNumber });
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }
  user.password = newPassword;
  await user.save();
  // Optionally clear the OTP after successful reset
  delete verificationCodes[contactNumber];
  return res.json({ success: true, message: 'Password reset successfully' });
};
exports.verifyOtp = async (req, res) => {
  const { contactNumber, otp } = req.body;
  if (!contactNumber || !otp) {
    return res.status(400).json({ error: 'Contact number and OTP required' });
  }
  const code = verificationCodes[contactNumber];
  if (!code) {
    return res.status(400).json({ error: 'No OTP sent to this number' });
  }
  if (code !== otp) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }
  return res.json({ success: true, message: 'OTP verified' });
};
const twilio = require('twilio');
const accountSid = 'AC039469d4acdaafd46847e69ab7831332'; // Replace with your actual SID
const authToken = 'c120f67483b5161f1e32e85513639e3c'; // Replace with your actual token
const client = twilio(accountSid, authToken);

// In-memory store for codes (use DB for production)
const verificationCodes = {};

exports.forgotPassword = async (req, res) => {
  const { contactNumber } = req.body;
  if (!contactNumber) {
    return res.status(400).json({ error: 'Contact number required' });
  }
  // Check if user exists
  const user = await User.findOne({ contactNumber });
  if (!user) {
    return res.status(400).json({ error: 'Contact number not registered' });
  }
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[contactNumber] = code;
  try {
    await client.messages.create({
      from: 'whatsapp:+14155238886',
      to: `whatsapp:+91${contactNumber}`,
      body: `Your OrthoSaarthi password reset code is: ${code}`
    });
    return res.json({ success: true, message: 'Code sent via WhatsApp' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send WhatsApp message' });
  }
};
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


// exports.registerUser = async (req, res) => {
//   try {
//     const { contactNumber, password } = req.body;

//     if (!contactNumber || !password) {
//       return res.status(400).json({ error: "Contact number and password are required" });
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({ contactNumber });
//     if (existingUser) {
//       return res.status(400).json({ error: "User with this contact already exists" });
//     }

//     // Create User with role 'doctor'
//     const user = await User.create({
//       contactNumber,
//       password, // plain password, no encryption
//       role: "doctor",
//     });

//     // Create Doctor document linked to this user
//     const doctor = await Doctor.create({
      
//     });

//     // Update User with doctorId
//     user.doctorId = doctor._id;
//     await user.save();

//     res.status(201).json({ docid: doctor._id });
//   } catch (err) {
//     console.error("Register user error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };



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
