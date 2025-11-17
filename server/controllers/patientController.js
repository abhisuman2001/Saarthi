const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const mongoose = require("mongoose");
const User = require("../models/User"); 



exports.addPatient = async (req, res) => {
  try {
    const { name, contactNumber, password, doctorId } = req.body;

    if (!name || !contactNumber || !password || !doctorId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user with same contact already exists
    const existingUser = await User.findOne({ contactNumber });
    if (existingUser) {
      return res.status(400).json({ error: "Patient with this contact already exists" });
    }

    // Create user with role 'patient'
    const user = await User.create({
      contactNumber,
      password,
      role: "patient",
    });

    // Create patient details entry
    const patient = await Patient.create({
      name,
      contactNumber, // optional duplicate for easier querying
    });

    // Update user with patientId
    user.patientId = patient._id;
    await user.save();

    // Link patient to doctor
    await Doctor.findByIdAndUpdate(doctorId, { $push: { patients: patient._id } });
    console.log("Linked patient to doctor");
    console.log({ user, patient });
    // Return new patient ID
    res.status(201).json(patient);
  } catch (err) {
    console.error("Add patient error:", err);
    res.status(500).json({ error: "Server error" });
  }
};



exports.getPatientAdherence = async (req, res) => {
  try {
    const { patid } = req.params; // match the route
    if (!patid || !mongoose.Types.ObjectId.isValid(patid)) {
      return res.status(400).json({ error: "Invalid patient ID" });
    }

    const patient = await Patient.findById(patid).lean();
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const adherenceHistory = patient.adherenceHistory || [];
    const last30days = new Date();
    last30days.setDate(last30days.getDate() - 30);

    let total = 0;
    let yes = 0;
    let answeredToday = false;
    const today = new Date();

    adherenceHistory.forEach((entry) => {
      if (entry.date >= last30days) total++;
      if (entry.adherence === true && entry.date >= last30days) yes++;

      const entryDate = new Date(entry.date);
      if (
        entryDate.getFullYear() === today.getFullYear() &&
        entryDate.getMonth() === today.getMonth() &&
        entryDate.getDate() === today.getDate()
      ) answeredToday = true;
    });
    console.log({ total, yes, answeredToday });
    return res.json({
      name: patient.name,
      adherence: { last30days: total, yes },
      answeredToday,
    });
  } catch (err) {
    console.error("Error fetching patient info:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.addAdherenceEntry = async (req, res) => {
  try {
    const { patid } = req.params;
    const { adherence, notes, useful } = req.body;

    if (!patid) {
      return res.status(400).json({ error: "Patient ID is required" });
    }

    if (typeof adherence !== "boolean") {
      return res.status(400).json({ error: "Adherence must be a boolean" });
    }

    if (useful !== undefined && typeof useful !== "boolean") {
      return res.status(400).json({ error: "Useful must be a boolean" });
    }

    // Find patient
    const patient = await Patient.findById(patid);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Update adherence aggregate
    if (!patient.adherence) {
      patient.adherence = { last30days: 0, yes: 0 };
    }
    patient.adherence.last30days += 1;
    if (adherence) {
      patient.adherence.yes += 1;
    }

    // Add new adherence entry
    patient.adherenceHistory.push({
      adherence,
      notes: notes || "",
      useful: useful !== undefined ? useful : null,
      date: new Date()
    });

    // Mark today's submission
    patient.answerdToday = true;

    await patient.save();

    res.json({ message: "Adherence entry added", patient });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getPatientDetails = async (req, res) => {
  try {
    const { patid,  } = req.params;

    // validate ObjectId
    if (!patid || !patid.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid patient ID" });
    }

    // fetch patient
    const patient = await Patient.findById(patid);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Calculate adherence percentage in last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const last30DaysHistory = patient.adherenceHistory.filter(entry => 
      entry.date >= thirtyDaysAgo && entry.date <= now
    );

    let adherencePercent = 100;
    if (last30DaysHistory.length > 0) {
      const yesCount = last30DaysHistory.filter(e => e.adherence === true).length;
      adherencePercent = Math.round((yesCount / last30DaysHistory.length) * 100);
    }

    res.json({
      name: patient.name,
      details: patient,
      adherencePercent
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadPatientFile = async (req, res) => {
  const patid = req.params.patid;
  const { field } = req.body;

  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  if (!patid || !field) return res.status(400).json({ error: "Missing patid or field" });

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "patients" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const patient = await Patient.findByIdAndUpdate(
      patid,
      { [field]: result.secure_url },
      { new: true }
    );

    if (!patient) return res.status(404).json({ error: "Patient not found" });

    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
};


exports.updatePatientInfo = async (req, res) => {
  const { patid } = req.params;
  const updates = req.body;

  if (!patid) return res.status(400).json({ error: "Patient ID is required" });
  //log request body to console
  console.log("Request Body:", req.body);
  try {
    const patient = await Patient.findByIdAndUpdate(patid, updates, { new: true });
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    res.json({ success: true, patient });
  } catch (err) {
    console.error("Error updating patient:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getPatientsByDoctor = async (req, res) => {
  const { docid } = req.params;

  if (!docid) return res.status(400).json({ error: "Doctor ID is required" });

  try {
    // Find doctor and populate patients
    const doctor = await Doctor.findById(docid).populate({
      path: "patients",
      select: "name contactNumber", // only fetch name and contactNumber
    });

    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    res.json(doctor.patients); // return array of patients
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};