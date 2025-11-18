  require("dotenv").config();
  const express = require("express");
  const mongoose = require("mongoose");
  const cors = require("cors");

  const PatientinfoRoutes = require("./routes/Patientinfo");
  const UserRoutes = require("./routes/User");
  const DoctorRoutes = require("./routes/Doctor");
  const app = express();
  app.use(express.json());

  // // MongoDB connect
  // mongoose.connect(process.env.MONGODB_URI, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true
  // })
  // // .then(() => console.log("MongoDB connected"))
  // // .catch(err => console.error("MongoDB error:", err));


  // MongoDB connect
  const Patient = require("./models/Patient");
  const Doctor = require("./models/Doctor");
  const User = require("./models/User");  
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("MongoDB connected");

    // Ensure collections are created
    const models = [Patient, Doctor, User];
    for (const model of models) {
      try {
        await model.createCollection();  // idempotent: only creates if not exists
        console.log(`Ensured collection for ${model.modelName}`);
      } catch (err) {
        console.error(`Error creating collection for ${model.modelName}:`, err);
      }
    }
  })
  .catch(err => console.error("MongoDB error:", err));


  // CORS (allow all for now)
  app.use(cors({ origin: "http://localhost:5173",
  credentials: true
   }));
  // app.use(cors());

  // Routes
  app.use("/api/patientinfo", PatientinfoRoutes);
  app.use("/api/user", UserRoutes);
  app.use("/api/doctor", DoctorRoutes);
  app.get("/", (req, res) => res.send("Server running ✅"));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
