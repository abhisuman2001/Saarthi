const mongoose = require("mongoose");

const adherenceHistorySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  adherence: { type: Boolean, required: true },
  notes: { type: String, default: "" },
  useful: { type: Boolean, default: null },
  duration: { type: String, default: null },
  applianceType: { type: String, default: null },
  photoUrl: { type: String, default: null },
  score: { type: Number, default: null },
  // store exact breakdown used to compute `score` for transparency and audit
  breakdown: { type: mongoose.Schema.Types.Mixed, default: null },
  reason: { type: String, default: null }
});

//add started treatment date and next appointment date

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: null },
    age: { type: Number, default: null },
    dob: { type: Date, default: null },
    doctorId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Doctor",
      default: null 
    },
    gender: { type: String, default: null },
    address: { type: String, default: null },
    contactNumber: { type: String, default: null, unique: true },

    chiefComplaint: { type: String, default: null },
    pastMedicalHistory: { type: String, default: null },
    pastDentalHistory: { type: String, default: null },

    provisionalDiagnosis: { type: String, default: null },
    startDate: { type: Date, default: null },
    nextAppointment: { type: Date, default: null },

    // Investigation uploads (default placeholder image if not uploaded)
    studyModelUrl: { type: String, default: "https://placehold.co/600x400?text=Not+Found" },
    photographsUrl: { type: String, default: "https://placehold.co/600x400?text=Not+Found" },
    opgUrl: { type: String, default: "https://placehold.co/600x400?text=Not+Found" },
    lateralCephalogramUrl: { type: String, default: "https://placehold.co/600x400?text=Not+Found" },
    paCephalogramUrl: { type: String, default: "https://placehold.co/600x400?text=Not+Found" },
    cbctUrl: { type: String, default: "https://placehold.co/600x400?text=Not+Found" },
    iopaUrl: { type: String, default: "https://placehold.co/600x400?text=Not+Found" },
    anyOtherRecordUrl: { type: String, default: "https://placehold.co/600x400?text=Not+Found" },

    finalDiagnosis: { type: String, default: null },

    treatmentPlan: { type: String, default: null },
    growthModulationOrCamouflage: { type: String, default: null },
    extractionOrNonExtraction: { type: String, default: null },
    phase: { type: String, default: null }, // one phase / multi phase

    typeOfAppliance: { type: String, default: null },
    prescription: { type: String, default: null },

    startDate: { type: Date, default: null },
    nextAppointment: { type: Date, default: null },

    adherenceHistory: [adherenceHistorySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);