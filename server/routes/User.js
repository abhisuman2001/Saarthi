const express = require("express"); // not 'router'
const router = express.Router();
const {  loginUser ,registerUser, changePassword, forgotPassword, verifyOtp, resetPassword} = require("../controllers/userController");

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/change-password",changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
