// src/pages/DoctorDashboard.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { getPatientsByDoctor } from "../api/Patientinfo"; // API to fetch patients by doctor

type Patient = {
  _id: string;
  name: string | null;
  contactNumber: string | null;
};

export default function DoctorDashboard() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const docid = searchParams.get("docid") || "";

  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docid) return;

    const fetchPatients = async () => {
      try {
        setLoading(true);
        const result = await getPatientsByDoctor(docid);
        setPatients(result);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch patients");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [docid]);

  // Optimized search
  const filteredPatients = useMemo(() => {
    const query = search.toLowerCase();
    return patients.filter((p) => {
      const name = p.name?.toLowerCase() || "";
      const contact = p.contactNumber || "";
      return name.includes(query) || contact.includes(query);
    });
  }, [patients, search]);

  return (
    <div>
    <div className="py-25 min-h-screen bg-gradient-to-r from-[#8EC5FC] to-[#E0C3FC] flex justify-center items-start py-12 px-6">
      <div className="w-full max-w-5xl bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8">
        
        {/* Search + Add Patient */}
        <div className="text-black flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Search by name or contact"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-1/2 border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg shadow-md hover:scale-105 transition-transform"
            onClick={() => navigate(`/patient/add?docid=${docid}`)}
          >
            ➕ Add Patient
          </button>
        </div>

        {/* Loading / Error */}
        {loading && (
          <p className="text-center text-gray-600">Loading patients...</p>
        )}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Patients Table */}
        <div className="overflow-hidden rounded-xl shadow-md border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gradient-to-r from-blue-200 to-purple-200 text-gray-800 font-semibold">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Contact No.</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-black">
              {filteredPatients.map((p) => (
                <tr
                  key={p._id}
                  className="cursor-pointer hover:bg-blue-50 transition"
                  onClick={() =>
                    navigate(`/doctor/profile?patid=${p._id}&docid=${docid}`)
                  }
                >
                  <td className="px-4 py-3">{p.name || "N/A"}</td>
                  <td className="px-4 py-3">{p.contactNumber || "N/A"}</td>
                </tr>
              ))}
              {filteredPatients.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={2}
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No patients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
     <footer className="bg-gray-900 text-gray-300 py-6 text-center text-sm">
        <p className="font-semibold text-white">ORTHO SAARTHI</p>
        <p className="opacity-75">
          Smart Assistant for Appliance Reminders and Treatment History Interface
        </p>
      </footer>
      </div>
  );
}
