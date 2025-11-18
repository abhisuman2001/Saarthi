const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const {
  getDoctorById,
  updateDoctorInfo,
  uploadDoctorAvatar,
} = require("../controllers/doctorController");

router.get("/:id", getDoctorById);
router.patch("/:id", updateDoctorInfo);
router.post("/:id/avatar", upload.single("file"), uploadDoctorAvatar);

module.exports = router;
