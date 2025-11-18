// src/pages/AddPatient.tsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addPatient } from "../api/Patientinfo";
import Layout from "../components/Layout";

export default function AddPatient() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const docid = searchParams.get("docid") || "";

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !contactNumber || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!docid) {
      setError("Doctor ID is missing");
      return;
    }

    try {
      setLoading(true);
      const newPatient = await addPatient({ name, contactNumber, password, doctorId: docid });

      if (newPatient && newPatient._id) {
        navigate(`/doctor/profile?patid=${newPatient._id}&docid=${docid}`);
      } else {
        setError("Failed to create patient");
      }
    } catch (err) {
      console.error(err);
      setError("Error creating patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex justify-center items-center px-2 py-10">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Add New Patient</h2>

          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 rounded-md focus:ring-2 focus:ring-cyan-400 focus:outline-none text-black"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Contact Number</label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 rounded-md focus:ring-2 focus:ring-cyan-400 focus:outline-none text-black"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 rounded-md focus:ring-2 focus:ring-cyan-400 focus:outline-none text-black"
                required
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2 rounded-md focus:ring-2 focus:ring-cyan-400 focus:outline-none text-black"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-md shadow-sm"
            >
              {loading ? "Adding..." : "Add Patient"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
