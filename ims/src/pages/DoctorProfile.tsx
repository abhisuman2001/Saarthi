import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDoctorById, updateDoctor, uploadDoctorAvatar } from "../api/User";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../components/Layout";

export default function DoctorProfile() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const docid = searchParams.get("docid") || "";
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const computeAgeFromDob = (dob?: string | null) => {
    if (!dob) return null;
    const d = new Date(dob);
    if (isNaN(d.getTime())) return null;
    const diff = Date.now() - d.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  useEffect(() => {
    if (!docid) return;
    const load = async () => {
      const d = await getDoctorById(docid);
      setDoctor(d);
      setName(d?.name || "");
    };
    load();
  }, [docid]);

  const handleSave = async () => {
    if (!docid) return;
    try {
      setSaving(true);
      if (name && name !== doctor?.name) {
        await updateDoctor(docid, { name });
      }
      if (avatarFile) {
        await uploadDoctorAvatar(docid, avatarFile);
      }
      const d = await getDoctorById(docid);
      setDoctor(d);
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {doctor?.avatar ? <img loading="lazy" src={doctor.avatar} alt="avatar" className="h-full w-full object-cover" /> : <div className="text-2xl text-gray-600">{doctor?.name ? doctor.name.charAt(0).toUpperCase() : "D"}</div>}
            </div>
            <div>
              <div className="text-sm text-gray-500">Doctor Profile</div>
              <div className="text-2xl font-semibold text-gray-900">{doctor?.name || "Doctor"}{(doctor?.age || doctor?.dob) ? <span className="text-sm text-gray-500 ml-3">{doctor?.age ?? computeAgeFromDob(doctor?.dob)} yrs</span> : null}</div>
              <div className="text-sm text-gray-500 mt-1">Patients: {doctor?.patientsCount ?? 0}</div>
            </div>
            <div className="ml-auto">
              <button onClick={() => navigate(`/doctor/dashboard?docid=${docid}`)} className="px-3 py-2 border rounded">Back</button>
            </div>
          </div>

          <div className="mt-6">
            {!editing ? (
              <div className="text-sm text-gray-700">
                <p className="mb-2">Name: <span className="font-medium">{doctor?.name || "-"}</span></p>
                <p className="mb-2">Joined: <span className="text-gray-500">{doctor?.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : "-"}</span></p>
                <div className="mt-4">
                  <button onClick={() => setEditing(true)} className="px-4 py-2 bg-cyan-600 text-white rounded">Edit Profile</button>
                </div>
              </div>
              ) : (
              <AnimatePresence>
                {editing && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}>
                    <div>
                      <label className="block text-sm text-gray-600">Full name</label>
                      <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full border rounded px-3 py-2 mt-1" />

                      <label className="block text-sm text-gray-600 mt-3">Avatar</label>
                      <input type="file" accept="image/*" onChange={(e)=>setAvatarFile(e.target.files?.[0] ?? null)} className="mt-1" />

                      <div className="mt-4 flex gap-2 justify-end">
                        <button onClick={()=>setEditing(false)} className="px-4 py-2 border rounded">Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-cyan-600 text-white rounded">{saving ? 'Saving...' : 'Save'}</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
