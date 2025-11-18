// src/pages/DoctorDashboard.tsx

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { getPatientsByDoctor } from "../api/Patientinfo";
import { getDoctorById, updateDoctor, uploadDoctorAvatar } from "../api/User";
import { Settings, Plus, Search, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Patient = {
  _id: string;
  name: string | null;
  contactNumber: string | null;
};

type Doctor = {
  _id?: string;
  name?: string;
  patientsCount?: number;
  avatar?: string;
  createdAt?: string;
};

export default function DoctorDashboard() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const docid = searchParams.get("docid") || "";
  const navigate = useNavigate();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [search, setSearch] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingName, setEditingName] = useState<string>("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!docid) return;
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const result = (await getPatientsByDoctor(docid)) as Patient[];
        setPatients(result || []);
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

  useEffect(() => {
    if (!docid) return;
    const fetchDoctor = async () => {
      try {
        const d = await getDoctorById(docid);
        setDoctor(d);
        setEditingName(d?.name || "");
      } catch (err) {
        console.error("Failed to fetch doctor", err);
      }
    };
    fetchDoctor();
  }, [docid]);

  const filteredPatients = useMemo(() => {
    const q = search.toLowerCase();
    return patients.filter((p) => {
      const name = p.name?.toLowerCase() || "";
      const contact = p.contactNumber || "";
      return name.includes(q) || contact.includes(q);
    });
  }, [patients, search]);

  const handleSaveProfile = async () => {
    if (!docid) return;
    try {
      setUploading(true);
      if (editingName && editingName !== doctor?.name) {
        await updateDoctor(docid, { name: editingName });
      }
      if (avatarFile) {
        const res = await uploadDoctorAvatar(docid, avatarFile);
        if (res?.url) {
          setDoctor((prev) => ({ ...(prev || {}), avatar: res.url }));
        }
      }
      const d = await getDoctorById(docid);
      setDoctor(d);
      setEditing(false);
      setShowProfile(false);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* App bar */}
        <header className="mt-6 mb-6 bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-teal-400 to-cyan-500 flex items-center justify-center text-white font-semibold text-lg">
              {doctor?.name ? doctor.name.charAt(0).toUpperCase() : "D"}
            </div>
            <div>
              <div className="text-sm text-gray-500">Welcome back</div>
              <div className="text-lg font-semibold text-gray-900">{doctor?.name || "Doctor"}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/patient/add?docid=${docid}`)} className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md shadow-sm">
              <Plus size={16} />
              <span className="text-sm">Add Patient</span>
            </button>

            <button onClick={() => setShowProfile((s) => !s)} className="p-2 rounded-full hover:bg-gray-100">
              <Settings size={18} />
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="grid gap-6 md:grid-cols-3">
          {/* Left column: Search + stats */}
          <aside className="md:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <label className="flex items-center gap-2 bg-gray-100 rounded-md px-3 py-2">
                <Search size={16} className="text-gray-500" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patients" className="bg-transparent flex-1 text-sm outline-none" />
              </label>

              <div className="mt-4">
                <div className="text-xs text-gray-500">Patients</div>
                <div className="text-2xl font-semibold text-gray-900">{patients.length}</div>
              </div>

              <div className="mt-4 border-t pt-3 text-sm text-gray-600">
                <div className="flex justify-between"><span className="text-gray-500">Active</span><span className="font-medium">{filteredPatients.length}</span></div>
                <div className="flex justify-between mt-2"><span className="text-gray-500">Total</span><span className="font-medium">{patients.length}</span></div>
              </div>
            </div>
          </aside>

          {/* Patients list */}
          <section className="md:col-span-2">
            <div className="bg-transparent p-0 rounded-lg">
              <div className="grid gap-3">
                {loading && <div className="text-center py-6 text-gray-500">Loading patients...</div>}
                {error && <div className="text-center py-6 text-red-500">{error}</div>}

                {filteredPatients.length === 0 && !loading && (
                  <div className="text-center py-6 text-gray-500">No patients found</div>
                )}

                <AnimatePresence>
                  {filteredPatients.map((p) => (
                    <motion.div
                      key={p._id}
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.18 }}
                      onClick={() => navigate(`/doctor/profile?patid=${p._id}&docid=${docid}`)}
                      className="flex items-center justify-between p-4 rounded-lg bg-white border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">{p.name ? p.name.charAt(0).toUpperCase() : "P"}</div>
                        <div>
                          <div className="font-medium text-gray-900">{p.name || "Unnamed"}</div>
                          <div className="text-sm text-gray-500">{p.contactNumber || "-"}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-gray-400">
                        <span className="text-sm">View</span>
                        <ChevronRight />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

              </div>
            </div>
          </section>
        </main>

        {/* Profile dropdown */}
        <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-8 top-24 w-80 bg-white rounded-lg shadow-lg p-4 z-50"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-teal-400 to-cyan-500 flex items-center justify-center text-white font-semibold">{doctor?.name ? doctor.name.charAt(0).toUpperCase() : "D"}</div>
                <div>
                  <div className="font-medium text-gray-900">{doctor?.name || "Doctor"}</div>
                  <div className="text-xs text-gray-500">ID: {doctor?._id || docid}</div>
                </div>
              </div>

              <div className="mt-3 border-t pt-3 text-sm text-gray-600">
                <div>Patients: <span className="font-medium text-gray-800">{doctor?.patientsCount ?? "-"}</span></div>
                <div className="mt-2">Joined: <span className="text-gray-500">{doctor?.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : "-"}</span></div>
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={() => navigate(`/doctor/me?docid=${docid}`)} className="flex-1 bg-white border border-gray-200 py-2 rounded">View Profile</button>
                <button onClick={() => { setEditing(true); setShowProfile(false); }} className="flex-1 bg-cyan-600 text-white py-2 rounded">Edit</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {editing && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div initial={{ y: -8, scale: 0.995 }} animate={{ y: 0, scale: 1 }} exit={{ y: -8, scale: 0.995 }} transition={{ duration: 0.16 }} className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                <h2 className="text-lg font-semibold mb-3">Edit Profile</h2>
                <label className="text-sm text-gray-600">Full name</label>
                <input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="w-full border px-3 py-2 rounded mt-1 mb-3" />

                <label className="text-sm text-gray-600">Avatar</label>
                <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} className="w-full mt-1" />

                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => setEditing(false)} className="px-4 py-2 border rounded">Cancel</button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-cyan-600 text-white rounded"
                  >
                    {uploading ? "Uploading..." : "Save"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
// ...existing code...
