const Doctor = require("../models/Doctor");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.getDoctorById = async (req, res) => {
	try {
		const { id } = req.params;
		if (!id) return res.status(400).json({ error: "Doctor ID is required" });

		const doctor = await Doctor.findById(id).lean();
		if (!doctor) return res.status(404).json({ error: "Doctor not found" });

		return res.status(200).json({
			_id: doctor._id,
			name: doctor.name,
			patientsCount: Array.isArray(doctor.patients) ? doctor.patients.length : 0,
			avatar: doctor.avatar || null,
			createdAt: doctor.createdAt,
		});
	} catch (err) {
		console.error("getDoctorById error:", err);
		return res.status(500).json({ error: "Server error" });
	}
};

exports.updateDoctorInfo = async (req, res) => {
	try {
		const { id } = req.params;
		const updates = req.body;
		if (!id) return res.status(400).json({ error: "Doctor ID is required" });

		const doctor = await Doctor.findByIdAndUpdate(id, updates, { new: true });
		if (!doctor) return res.status(404).json({ error: "Doctor not found" });

		res.json({ success: true, doctor });
	} catch (err) {
		console.error("updateDoctorInfo error:", err);
		res.status(500).json({ error: "Server error" });
	}
};

exports.uploadDoctorAvatar = async (req, res) => {
	const { id } = req.params;
	if (!req.file) return res.status(400).json({ error: "No file uploaded" });
	if (!id) return res.status(400).json({ error: "Doctor ID is required" });

	try {
		const result = await new Promise((resolve, reject) => {
			const stream = cloudinary.uploader.upload_stream({ folder: "doctors" }, (error, result) => {
				if (error) reject(error);
				else resolve(result);
			});
			stream.end(req.file.buffer);
		});

		const doctor = await Doctor.findByIdAndUpdate(id, { avatar: result.secure_url }, { new: true });
		if (!doctor) return res.status(404).json({ error: "Doctor not found" });

		res.json({ url: result.secure_url });
	} catch (err) {
		console.error("uploadDoctorAvatar error:", err);
		res.status(500).json({ error: "Server error", details: err.message });
	}
};

