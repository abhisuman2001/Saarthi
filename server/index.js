const path = require('path');
// Force Node to look for .env in the CURRENT folder (server/), not root
require("dotenv").config({ path: path.resolve(__dirname, './.env') });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const PatientinfoRoutes = require("./routes/Patientinfo");
const UserRoutes = require("./routes/User");
const DoctorRoutes = require("./routes/Doctor");

// Start WhatsApp reminder cron
try {
  require("./reminderCron");
} catch (err) {
  console.log("Reminder Cron not loaded (Optional)");
}

const app = express();
app.use(express.json());

// --- DEBUGGING: Check if .env is loaded ---
console.log("------------------------------------------------");
console.log("DEBUG: Reading .env file...");
if (!process.env.MONGO_URI) {
  console.error("❌ CRITICAL ERROR: MONGO_URI is missing in .env file!");
} else {
  console.log("✅ MONGO_URI found (starts with):", process.env.MONGO_URI.substring(0, 15) + "...");
}
console.log("------------------------------------------------");

// MongoDB connect
const Patient = require("./models/Patient");
const Doctor = require("./models/Doctor");
const User = require("./models/User");

// Connect without deprecated options (Mongoose 7/8 default)
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected successfully");

    // Ensure collections are created
    const models = [Patient, Doctor, User];
    for (const model of models) {
      try {
        await model.createCollection();
        console.log(`Ensured collection for ${model.modelName}`);
      } catch (err) {
        // Ignore error if collection already exists
        // console.error(`Note: ${model.modelName} collection check:`, err.message);
      }
    }
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:", err.message);
  });

// CORS Configuration
app.use((req, res, next) => {
  console.log('Request received from:', req.headers.origin);
  next();
});

app.use(cors({
  origin: true, // Allow all origins dynamically
  credentials: true
}));

// Routes
app.use("/api/patientinfo", PatientinfoRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/doctor", DoctorRoutes);
app.get("/", (req, res) => res.send("Server running ✅"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));