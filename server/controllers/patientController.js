const { sendSMS } = require("../sms");
const { sendWhatsAppMessage } = require("../whatsappClient");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const mongoose = require("mongoose");
const User = require("../models/User"); 
// ...existing code...



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

    // 3. SEND WHATSAPP LOGIC HERE
    try {
      await sendWhatsAppMessage(contactNumber, "Welcome to OrthoSaarthi");
      console.log(`WhatsApp sent to ${contactNumber}`);
    } catch (waError) {
      console.error("Failed to send WhatsApp:", waError.message);
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
    // Compute dynamic score when score not provided and produce exact breakdown
    const computeDynamicScoreWithBreakdown = (patientDoc, payload) => {
      const breakdown = {
        base: 0,
        durationPoints: 0,
        usefulPoints: 0,
        photoPoints: 0,
        appliancePoints: 0,
        streakPoints: 0,
        totalBeforeClamp: 0,
        final: 0,
      };

      // If they marked not-adherent, score is 0 and breakdown reflects that
      if (!payload.adherence) {
        breakdown.base = 0;
        breakdown.totalBeforeClamp = 0;
        breakdown.final = 0;
        return { score: 0, breakdown };
      }

      let s = 50; // base for adherence
      breakdown.base = 50;

      // duration mapping from frontend-friendly labels to points
      const mapDurationToPoints = (d) => {
        if (!d) return 0;
        const ds = String(d).trim();
        if (ds === '<6 hrs') return 0;
        if (ds === '6-10 hrs') return 8;
        if (ds === '10-14 hrs') return 15;
        if (ds === '14-18 hrs') return 22;
        if (ds === '>18 hrs') return 30;
        // fallback: if numeric minutes provided
        const n = Number(d);
        if (!isNaN(n)) {
          const dur = Math.max(0, Math.min(120, n));
          return Math.round((dur / 120) * 30);
        }
        return 0;
      };

      if (payload.duration) {
        const durPts = mapDurationToPoints(payload.duration);
        s += durPts;
        breakdown.durationPoints = durPts;
      }

      // 'useful' flag gives a small boost
      if (payload.useful === true) {
        s += 10;
        breakdown.usefulPoints = 10;
      }

      // photo evidence gives a modest boost
      if (payload.photoUrl) {
        s += 10;
        breakdown.photoPoints = 10;
      }

      // appliance type weighting
      if (payload.applianceType) {
        const t = String(payload.applianceType).toLowerCase();
        if (t.includes('aligner')) { s += 6; breakdown.appliancePoints = 6; }
        else if (t.includes('brace') || t.includes('braces')) { s += 4; breakdown.appliancePoints = 4; }
      }

      // streak: count consecutive previous 'yes' entries ending yesterday
      try {
        const history = Array.isArray(patientDoc.adherenceHistory) ? patientDoc.adherenceHistory : [];
        const today = new Date();
        // Normalize to date-only for comparison
        const normalize = d => new Date(new Date(d).getFullYear(), new Date(d).getMonth(), new Date(d).getDate());
        let streak = 0;
        // iterate backwards
        for (let i = history.length - 1; i >= 0; i--) {
          const e = history[i];
          const ed = normalize(e.date || e);
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - (streak + 1));
          const yd = normalize(yesterday);
          if (e.adherence === true && ed.getTime() === yd.getTime()) {
            streak += 1;
          } else {
            break;
          }
        }
        const streakPts = Math.min(streak, 7) * 3;
        s += streakPts;
        breakdown.streakPoints = streakPts;
      } catch (err) {
        console.error('Streak compute error', err && err.message ? err.message : err);
      }

      // clamp and round
      breakdown.totalBeforeClamp = s;
      s = Math.round(Math.max(0, Math.min(100, s)));
      breakdown.final = s;
      return { score: s, breakdown };
    };

    let computed = null;
    if (typeof score !== 'number') {
      computed = computeDynamicScoreWithBreakdown(patient, { adherence, duration, useful, applianceType, photoUrl });
    }

    const entry = {
      adherence,
      notes: notes || "",
      useful: useful !== undefined ? useful : null,
      duration: duration || undefined,
      applianceType: applianceType || undefined,
      photoUrl: photoUrl || undefined,
      score: typeof score === 'number' ? score : (computed ? computed.score : undefined),
      breakdown: typeof score === 'number' ? null : (computed ? computed.breakdown : null),
      reason: reason || undefined,
      date: date ? new Date(date) : new Date(),
    };
    patient.adherenceHistory.push(entry);

    // Mark today's submission flag consistently
    patient.answeredToday = true;

    await patient.save();

    // Return saved patient and the newly added entry (last entry) for the client to read exact score + breakdown
    const savedEntry = patient.adherenceHistory && patient.adherenceHistory.length > 0 ? patient.adherenceHistory[patient.adherenceHistory.length - 1] : null;
    res.json({ message: "Adherence entry added", patient, entry: savedEntry });
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