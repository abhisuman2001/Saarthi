const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    contactNumber: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["doctor", "patient"],
      default: "patient",
    },
    patientId: { // link to patient collection (if role is patient)
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },
    doctorId: { // link to doctor collection (if role is doctor)
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
