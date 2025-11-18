const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const mongoose = require("mongoose");
const User = require("../models/User"); 
const { sendSMS } = require("../sms"); // <--- 1. Import the SMS function



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
    
    // Create patient details entry
    const patient = await Patient.create({
      name,
      contactNumber, // optional duplicate for easier querying
      doctorId, //Abhishek add this line
    });
    
    // Create user with role 'patient'
    const user = await User.create({
      contactNumber,
      password,
      role: "patient",
      patientId: patient._id,
      doctorId
    });
    

    // Update user with patientId
    user.patientId = patient._id;
    await user.save();

    // Link patient to doctor
    await Doctor.findByIdAndUpdate(doctorId, { $push: { patients: patient._id } });
    console.log("Linked patient to doctor");
    console.log({ user, patient });
    
    // 2. SEND SMS LOGIC HERE
    try {
      // Twilio requires the country code (e.g., +91 for India).
      // If your input is just '9876543210', you must add the prefix.
      const formattedNumber = contactNumber.startsWith('+') 
        ? contactNumber 
        : `+91${contactNumber}`; // Change +91 to your local code if different

      await sendSMS(formattedNumber, "Welcome to OrthoSaarthi");
      console.log(`SMS sent to ${formattedNumber}`);
    } catch (smsError) {
      // We catch the error so the patient creation doesn't fail if SMS fails
      console.error("Failed to send SMS:", smsError.message);
    }
  
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
    const { adherence, notes, useful, duration, applianceType, photoUrl, score, reason, date } = req.body;

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


    // Add new adherence entry (store optional fields if provided)
    const entry = {
      adherence,
      notes: notes || "",
      useful: useful !== undefined ? useful : null,
      duration: duration || undefined,
      applianceType: applianceType || undefined,
      photoUrl: photoUrl || undefined,
      score: typeof score === 'number' ? score : undefined,
      reason: reason || undefined,
      date: date ? new Date(date) : new Date(),
    };
    patient.adherenceHistory.push(entry);

    // Mark today's submission flag consistently
    patient.answeredToday = true;

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