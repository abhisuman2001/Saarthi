const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    patients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }],
    avatar: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
