import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PatientInfo, updatePatientInfo, uploadFile } from "../api/Patientinfo";

type AdherenceEntry = {
  _id: string;
  adherence: boolean;
  date: string;
  notes: string;
  useful: boolean;
};

export interface PatientDetails {
  name: string | null;
  age: number | null;
  gender: string | null;
  contactNumber: string | null;
  address: string | null;
  chiefComplaint: string | null;
  pastMedicalHistory: string | null;
  pastDentalHistory: string | null;
  provisionalDiagnosis: string | null;
  finalDiagnosis: string | null;
  treatmentPlan: string | null;
  phase: string | null;
  typeOfAppliance: string | null;
  prescription: string | null;
  nextAppointment: string | null;
  startDate: string | null;
  studyModelUrl?: string | null;
  photographsUrl?: string | null;
  opgUrl?: string | null;
  lateralCephalogramUrl?: string | null;
  paCephalogramUrl?: string | null;
  cbctUrl?: string | null;
  iopaUrl?: string | null;
  anyOtherRecordUrl?: string | null;
  adherenceHistory?: AdherenceEntry[];
}

export interface PatientData {
  details: PatientDetails;
  adherencePercent?: number;
}

export default function PatientProfile() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const patid = searchParams.get("patid") || "";
  const docid = searchParams.get("docid") || "";

  const [data, setData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ [key: string]: boolean }>({});
  const [formValues, setFormValues] = useState<Partial<PatientDetails>>({});
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: string }>({});

  const imageFields: { label: string; key: keyof PatientDetails }[] = [
    { label: "Study Model", key: "studyModelUrl" },
    { label: "Photographs", key: "photographsUrl" },
    { label: "OPG", key: "opgUrl" },
    { label: "Lateral Cephalogram", key: "lateralCephalogramUrl" },
    { label: "PA Cephalogram", key: "paCephalogramUrl" },
    { label: "CBCT", key: "cbctUrl" },
    { label: "IOPA", key: "iopaUrl" },
    { label: "Other Records", key: "anyOtherRecordUrl" },
  ];

  const editableFields: { label: string; key: keyof PatientDetails; type?: string }[] = [
    { label: "Name", key: "name" },
    { label: "Age", key: "age" },
    { label: "Gender", key: "gender" },
    { label: "Contact", key: "contactNumber" },
    { label: "Address", key: "address" },
    { label: "Chief Complaint", key: "chiefComplaint" },
    { label: "Past Medical History", key: "pastMedicalHistory" },
    { label: "Past Dental History", key: "pastDentalHistory" },
    { label: "Provisional Diagnosis", key: "provisionalDiagnosis" },
    { label: "Final Diagnosis", key: "finalDiagnosis" },
    { label: "Treatment Plan", key: "treatmentPlan" },
    { label: "Phase", key: "phase" },
    { label: "Type of Appliance", key: "typeOfAppliance" },
    { label: "Prescription", key: "prescription" },
    { label: "Date of start of treatment", key: "startDate", type: "date" },
    { label: "Next Appointment", key: "nextAppointment", type: "date" },
  ];

  useEffect(() => {
    if (!patid || !docid) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await PatientInfo(patid);
        if (result) {
          // ✅ Ensure runtime type match
          const normalized: PatientData = {
            details: {
              ...result.details,
              nextAppointment: result.details.nextAppointment ?? null,
              startDate: result.details.startDate ?? null,
            },
            adherencePercent: result.adherencePercent ?? 0,
          };
          setData(normalized);
          setFormValues(normalized.details);
        }
      } catch (err) {
        console.error("Failed to fetch patient:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patid, docid]);

  const formatValue = (val: string | number | null | undefined) => val ?? "";

  const handleEditToggle = (key: keyof PatientDetails) =>
    setEditing((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleInputChange = (key: keyof PatientDetails, value: string) =>
    setFormValues((prev) => ({ ...prev, [key]: value }));

  const handleSave = async (key: keyof PatientDetails) => {
    if (!patid) return;
    try {
      const success = await updatePatientInfo(patid, { [key]: formValues[key] });
      if (success) {
        setEditing((prev) => ({ ...prev, [key]: false }));
        setData((prev) =>
          prev
            ? { ...prev, details: { ...prev.details, [key]: formValues[key] ?? null } }
            : prev
        );
      } else alert("Failed to update");
    } catch (err) {
      console.error("save error:", err);
      alert("Failed to update");
    }
  };

  const handleFileUpload = async (key: keyof PatientDetails, file: File) => {
    if (!patid) return;
    setUploadStatus((prev) => ({ ...prev, [key]: "Uploading..." }));
    try {
      const uploadData = await uploadFile(file, patid, key as string);
      if (!uploadData.url) {
        setUploadStatus((prev) => ({ ...prev, [key]: "Upload failed ❌" }));
        return;
      }
      const success = await updatePatientInfo(patid, { [key]: uploadData.url });
      if (success) {
        setFormValues((prev) => ({ ...prev, [key]: uploadData.url }));
        setUploadStatus((prev) => ({ ...prev, [key]: "Upload successful ✅" }));
      } else {
        setUploadStatus((prev) => ({ ...prev, [key]: "Update failed ❌" }));
      }
    } catch (err) {
      console.error("upload error:", err);
      setUploadStatus((prev) => ({ ...prev, [key]: "Error uploading ❌" }));
    } finally {
      setTimeout(() => {
        setUploadStatus((prev) => ({ ...prev, [key]: "" }));
      }, 3000);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-700">Loading...</p>;
  if (!data) return <p className="text-center mt-10 text-gray-700">No data</p>;

  const adherencePercent = data.adherencePercent ?? 0;

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-r from-[#8EC5FC] to-[#E0C3FC] py-25 px-4 sm:px-6 flex justify-center">
        <div className="w-full max-w-3xl bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          {/* Editable Fields */}
          <div className="space-y-4">
            {editableFields.map(({ label, key, type }) => {
              const isEditing = editing[key];
              const value = formatValue(formValues[key] as string | number | null | undefined);

              return (
                <div
                  key={key}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-gray-50 p-3 rounded shadow-sm"
                >
                  <span className="font-semibold text-gray-700">{label}:</span>

                  {isEditing ? (
                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                      <input
                        type={type || "text"}
                        value={
                          type === "date"
                            ? value
                              ? new Date(value).toISOString().substring(0, 10)
                              : ""
                            : value
                        }
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        className="border rounded px-2 py-1 w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                      />
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        <button
                          onClick={() => handleSave(key)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:scale-105 transition-transform"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => handleEditToggle(key)}
                          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                      <span className="text-gray-800 text-sm sm:text-base">
                        {type === "date"
                          ? value
                            ? new Date(value).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "Not provided"
                          : value || "Not provided"}
                      </span>
                      <button
                        onClick={() => handleEditToggle(key)}
                        className="text-blue-600 hover:scale-105 transition-transform"
                        aria-label={`Edit ${label}`}
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Adherence Circle */}
          <div className="flex-col items-center sm:flex-row sm:items-start gap-6 mt-6">
            <div className="flex flex-col items-center">
              <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800">Treatment Adherence</h2>
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    strokeWidth="4"
                    stroke="lightgray"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    stroke={
                      adherencePercent === 100
                        ? "#22c55e"
                        : adherencePercent >= 75
                        ? "#84cc16"
                        : adherencePercent >= 50
                        ? "#facc15"
                        : "#ef4444"
                    }
                    strokeWidth="4"
                    strokeDasharray={`${adherencePercent}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-800">
                  {adherencePercent}%
                </div>
              </div>
              <p className="mt-2 text-gray-600 text-sm text-center">
                Higher percentage indicates better adherence to treatment plan
              </p>
            </div>
          </div>

          {/* Adherence History Notes */}
          {data.details.adherenceHistory?.some((entry) => entry.notes?.trim()) && (
            <div className="mt-6 w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Last Adherence Notes</h3>
              <div className="max-h-64 overflow-y-auto border rounded p-3 bg-gray-50">
                {data.details.adherenceHistory
                  .filter((entry) => entry.notes?.trim())
                  .slice(-10)
                  .reverse()
                  .map((entry) => (
                    <div key={entry._id} className="mb-2 border-b last:border-b-0 pb-1">
                      <p className="text-sm text-gray-700">{entry.notes}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.date).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Image Uploads */}
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Investigations</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {imageFields.map(({ label, key }) => {
                const url = formValues[key] ? String(formValues[key]) : "";
                return (
                  <div key={key} className="flex flex-col items-center gap-2">
                    <div className="w-full max-w-[180px] h-[140px] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center shadow-sm">
                      <a href={url || "#"} target="_blank" rel="noopener noreferrer">
                        <img
                          src={url || "https://via.placeholder.com/160?text=No+Image"}
                          alt={label}
                          className="object-cover w-full h-full cursor-pointer transition-transform hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/160?text=No+Image";
                          }}
                        />
                      </a>
                    </div>

                    <div className="flex flex-col items-center gap-1 w-full">
                      <label className="inline-block bg-blue-500 text-white px-3 py-1 rounded cursor-pointer text-sm w-full text-center">
                        Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileUpload(key, f);
                          }}
                        />
                      </label>
                      {uploadStatus[key] && (
                        <span
                          className={`text-xs font-medium ${
                            uploadStatus[key]?.includes("successful")
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {uploadStatus[key]}
                        </span>
                      )}
                      <p className="text-sm font-medium text-gray-700">{label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-300 py-6 text-center text-sm w-full">
        <p className="font-semibold text-white">ORTHO SAARTHI</p>
        <p className="opacity-75">
          Smart Assistant for Appliance Reminders and Treatment History Interface
        </p>
      </footer>
    </div>
  );
}
