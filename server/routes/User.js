const express = require("express"); // not 'router'
const router = express.Router();
const {  loginUser ,registerUser, changePassword} = require("../controllers/userController");

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/change-password",changePassword);

module.exports = router;
