const express = require("express");
const router = express.Router();
const multer = require("multer");
const patientController = require("../controllers/patientController");

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Routes referring to controller methods
router.get("/getPatientAdherence/:patid", patientController.getPatientAdherence);
router.post("/addAdherenceEntry/:patid", patientController.addAdherenceEntry);
router.get("/getPatientDetails/:patid", patientController.getPatientDetails);
router.post("/uploadPatientFile/:patid", upload.single("file"), patientController.uploadPatientFile);
router.patch("/updateInfo/:patid", patientController.updatePatientInfo);
router.get("/getPatientsByDoctor/:docid", patientController.getPatientsByDoctor);
router.post("/addPatient", patientController.addPatient);
module.exports = router;
