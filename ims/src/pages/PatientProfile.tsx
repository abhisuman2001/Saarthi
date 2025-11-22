import { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { PatientInfo, updatePatientInfo, uploadFile } from "../api/Patientinfo";
import Layout from "../components/Layout";

type AdherenceEntry = {
  _id: string;
  adherence: boolean;
  date: string;
  notes?: string;
  useful?: boolean;
  duration?: string;
  applianceType?: string;
  photoUrl?: string;
  score?: number;
  reason?: string;
};

export interface PatientDetails {
  name: string | null;
  dob: string | null;
  gender: string | null;
  contactNumber: string | null;
  address: string | null;
  chiefComplaint: string | null;
  pastMedicalHistory: string | null;
  pastDentalHistory: string | null;
  Diagnosis: string | null;
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
  // backward-compatible array variants to support multiple images per investigation
  studyModelUrls?: string[] | null;
  photographsUrls?: string[] | null;
  opgUrls?: string[] | null;
  lateralCephalogramUrls?: string[] | null;
  paCephalogramUrls?: string[] | null;
  cbctUrls?: string[] | null;
  iopaUrls?: string[] | null;
  anyOtherRecordUrls?: string[] | null;
  adherenceHistory?: AdherenceEntry[];
}

export interface PatientData {
  details: PatientDetails;
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
  const [previewOpen, setPreviewOpen] = useState(false);
  // which field is being previewed and which image index
  const [previewField, setPreviewField] = useState<keyof PatientDetails | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [otherAppliance, setOtherAppliance] = useState<string>("");

  const applianceOptions: string[] = useMemo(
    () => [
      "Upper Plate",
      "Lower Plate",
      "Functional Appliance (Activator,Bionator,Twinblock)",
      "Elastics",
      "Headgear",
      "Facemask",
      "Retainer",
      "Aligner",
      "Fixed Appliance",
      "Others",
    ],
    []
  );

  useEffect(() => {
    const val = formValues.typeOfAppliance as string | undefined;
    if (val && !applianceOptions.includes(val)) {
      setOtherAppliance(val);
    } else {
      setOtherAppliance("");
    }
  }, [formValues.typeOfAppliance, applianceOptions]);

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

  // helper: get array of urls for a given key (supports singular or plural fields)
  const getUrlsForKey = (key: keyof PatientDetails): string[] => {
    const val = formValues[key];
    if (!val) {
      // try pluralized field names (e.g. studyModelUrls)
      const k = String(key).endsWith("Url") ? (String(key).replace(/Url$/, "Urls") as keyof PatientDetails) : (String(key) + "s") as keyof PatientDetails;
      const plural = formValues[k];
      if (Array.isArray(plural)) return plural.filter(Boolean) as string[];
      return [];
    }
    if (Array.isArray(val)) return val.filter(Boolean) as string[];
    return [String(val)];
  };

  // preview urls derived from previewField/index
  const previewUrls = previewField ? getUrlsForKey(previewField) : [];
  const currentPreviewUrl = previewUrls[previewIndex] ?? "";

  const editableFields: { label: string; key: keyof PatientDetails; type?: string }[] = [
    { label: "Name", key: "name" },
    { label: "DOB", key: "dob", type: "date" },
    { label: "Gender", key: "gender" },
    { label: "Contact", key: "contactNumber" },
    { label: "Address", key: "address" },
    { label: "Chief Complaint", key: "chiefComplaint" },
    { label: "Past Medical History", key: "pastMedicalHistory" },
    { label: "Past Dental History", key: "pastDentalHistory" },
    { label: "Final Diagnosis", key: "Diagnosis" },
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
          const normalized = {
            details: {
              ...result.details,
              nextAppointment: result.details.nextAppointment ?? null,
              startDate: result.details.startDate ?? null,
              dob: result.details.dob ?? null,
            },
          };
          setData(normalized as unknown as PatientData);
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
            ? { ...prev, details: { ...prev.details, [key]: key === 'dob' ? (formValues[key] ?? null) : formValues[key] } }
            : prev
        );
      } else alert("Failed to update");
    } catch (err) {
      console.error("save error:", err);
      alert("Failed to update");
    }
  };

  // support multiple files: `files` may be a FileList or array
  const handleFileUpload = async (key: keyof PatientDetails, files: FileList | File[]) => {
    if (!patid) return;
    const fileArray = Array.from(files as FileList);
    if (fileArray.length === 0) return;

    setUploadStatus((prev) => ({ ...prev, [key]: `Uploading 0/${fileArray.length}...` }));

    // current urls (append to these)
    const existing = getUrlsForKey(key);
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const f = fileArray[i];
        setUploadStatus((prev) => ({ ...prev, [key]: `Uploading ${i + 1}/${fileArray.length}...` }));
        const uploadData = await uploadFile(f, patid, key as string);
        if (uploadData.url) {
          newUrls.push(uploadData.url);
        } else {
          console.error("upload failed for file", f.name);
        }
      }

      const merged = [...existing, ...newUrls];
      // prefer updating the plural field if available, otherwise fallback to singular
      const pluralKey = (String(key).endsWith("Url") ? String(key).replace(/Url$/, "Urls") : String(key) + "s") as keyof PatientDetails;

      const success = await updatePatientInfo(patid, { [pluralKey]: merged });
      if (success) {
        setFormValues((prev) => ({ ...prev, [pluralKey]: merged }));
        setUploadStatus((prev) => ({ ...prev, [key]: `Upload successful ✅ (${newUrls.length})` }));
      } else {
        // try updating singular if plural fails
        await updatePatientInfo(patid, { [key]: merged[merged.length - 1] ?? null });
        setFormValues((prev) => ({ ...prev, [key]: merged[merged.length - 1] ?? null }));
        setUploadStatus((prev) => ({ ...prev, [key]: `Upload partial ✅` }));
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


  const handleSaveAll = async () => {
    if (!patid) return;
    try {
      const success = await updatePatientInfo(patid, formValues);
      if (success) {
        const refreshed = await PatientInfo(patid);
        if (refreshed) {
          // assign refreshed details to state; assert via unknown to satisfy TypeScript
          setData(() => ({ details: { ...refreshed.details, dob: refreshed.details.dob ?? null } } as unknown as PatientData));
          setFormValues({ ...refreshed.details, dob: refreshed.details.dob ?? null });
          alert("Saved");
        }
      } else {
        alert("Save failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving");
    }
  };

  return (
    <Layout>
      <div className="w-full bg-white rounded-lg shadow-sm p-6 sm:p-8 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          {/* Left: Details (full width) */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Patient Details</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => { setFormValues(data.details); alert('Reverted'); }} className="px-3 py-1 border rounded">Revert</button>
                <button onClick={handleSaveAll} className="px-3 py-1 bg-cyan-600 text-white rounded">Save All</button>
              </div>
            </div>

            <div className="space-y-3">
              {editableFields.map(({ label, key, type }) => {
                const isEditing = editing[key];
                const value = formatValue(formValues[key] as string | number | null | undefined);

                return (
                  <div key={key} className="bg-gray-50 p-3 rounded-md shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-700">{label}</div>
                        {isEditing ? (
                          <div className="mt-2 flex items-center gap-2">
                            {key === 'typeOfAppliance' ? (
                              <div className="w-full sm:w-72">
                                <select
                                  value={applianceOptions.includes(String(formValues.typeOfAppliance ?? "")) ? String(formValues.typeOfAppliance ?? "") : (formValues.typeOfAppliance ? 'Others' : '')}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    if (v === 'Others') {
                                      setFormValues((prev) => ({ ...prev, typeOfAppliance: otherAppliance || '' }));
                                    } else {
                                      setFormValues((prev) => ({ ...prev, typeOfAppliance: v }));
                                      setOtherAppliance("");
                                    }
                                  }}
                                  className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-300 text-black"
                                >
                                  <option value="">Select appliance</option>
                                  {applianceOptions.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>

                                {/* If user chooses Others, show editable input */}
                                {(!applianceOptions.includes(String(formValues.typeOfAppliance ?? "")) || String(formValues.typeOfAppliance) === 'Others') && (
                                  <input
                                    type="text"
                                    placeholder="Describe other appliance"
                                    value={otherAppliance}
                                    onChange={(e) => {
                                      const v = e.target.value;
                                      setOtherAppliance(v);
                                      setFormValues((prev) => ({ ...prev, typeOfAppliance: v }));
                                    }}
                                    className="mt-2 w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-300 text-black"
                                  />
                                )}
                              </div>
                            ) : (
                              <input
                                type={type || 'text'}
                                value={type === 'date' ? (value ? new Date(value).toISOString().substring(0,10) : '') : value}
                                onChange={(e) => handleInputChange(key, e.target.value)}
                                className="w-full sm:w-72 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-300 text-black"
                              />
                            )}
                          </div>
                        ) : (
                          <div className="mt-1 text-gray-800">{type === 'date' ? (value ? new Date(value).toLocaleDateString() : 'Not provided') : (value || 'Not provided')}</div>
                        )}
                      </div>

                      <div className="flex-shrink-0 mt-2 sm:mt-0 flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button onClick={() => handleSave(key)} className="px-3 py-1 bg-green-500 text-white rounded">Save</button>
                            <button onClick={() => handleEditToggle(key)} className="px-3 py-1 border rounded">Cancel</button>
                          </>
                        ) : (
                          <button onClick={() => handleEditToggle(key)} className="px-3 py-1 text-cyan-600">Edit</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
        {/* Image preview modal */}
        {previewOpen && previewField && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="relative max-w-3xl w-full mx-4">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    setPreviewOpen(false);
                    setPreviewField(null);
                    setPreviewIndex(0);
                  }}
                  className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white border hover:bg-gray-100"
                  aria-label="Close preview"
                >
                  ✕
                </button>

                <div className="p-4 flex items-center justify-center gap-4 bg-white">
                  <button
                    onClick={() => {
                      const len = previewUrls.length;
                      if (len === 0) return;
                      setPreviewIndex((i) => (i - 1 + len) % len);
                    }}
                    className="px-3 py-2 border rounded-md"
                    aria-label="Previous"
                  >
                    ‹ Prev
                  </button>

                  <div className="flex-1 flex justify-center">
                    <img src={currentPreviewUrl || "https://via.placeholder.com/600x400?text=No+Image"} alt="preview" className="max-h-[75vh] object-contain w-full" />
                  </div>

                  <button
                    onClick={() => {
                      const len = previewUrls.length;
                      if (len === 0) return;
                      setPreviewIndex((i) => (i + 1) % len);
                    }}
                    className="px-3 py-2 border rounded-md"
                    aria-label="Next"
                  >
                    Next ›
                  </button>
                </div>

                <div className="p-4 flex justify-between items-center gap-2 bg-white">
                  <div className="text-sm text-gray-700">{previewField}: {previewIndex + 1} / {previewUrls.length}</div>
                  <div className="flex items-center gap-2">
                    <a href={currentPreviewUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-cyan-600 text-white rounded-md">Open</a>
                    <button onClick={() => { setPreviewOpen(false); setPreviewField(null); setPreviewIndex(0); }} className="px-4 py-2 border rounded-md">Close</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Investigations (moved below details) */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Investigations</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {imageFields.map(({ label, key }) => {
              const urls = getUrlsForKey(key);
              const thumb = urls[0] || "https://via.placeholder.com/300?text=No+Image";
                return (
                <div key={key} className="bg-gray-50 p-3 rounded-md shadow-sm flex flex-col items-center">
                  <div className="w-28 h-28 overflow-hidden bg-gray-100 flex items-center justify-center mb-3 rounded-md">
                    <button
                      onClick={() => { if (urls.length) { setPreviewField(key); setPreviewIndex(0); setPreviewOpen(true); } }}
                      className="w-full h-full block"
                      aria-label={`Preview ${label}`}
                    >
                      <img
                        src={thumb}
                        alt={label}
                        className="object-cover w-full h-full"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/300?text=No+Image"; }}
                      />
                    </button>
                  </div>

                  <label className="inline-block bg-cyan-600 text-white px-3 py-1 rounded cursor-pointer text-sm w-full text-center">
                    Upload
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const files = e.target.files; if (files) handleFileUpload(key, files); }} />
                  </label>

                  {/* Thumbnails */}
                  {urls.length > 0 && (
                    <div className="w-full mt-2 flex gap-2 overflow-x-auto">
                      {urls.map((u, idx) => (
                        <button key={u + idx} onClick={() => { setPreviewField(key); setPreviewIndex(idx); setPreviewOpen(true); }} className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden border">
                          <img src={u} alt={`${label} ${idx+1}`} className="object-cover w-full h-full" onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/100?text=No"; }} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* View button: transparent with cyan outline */}
                  <button
                    onClick={() => { if (urls.length) { setPreviewField(key); setPreviewIndex(0); setPreviewOpen(true); } }}
                    className="w-full mt-2 px-3 py-1 rounded-md border border-cyan-600 text-cyan-600 bg-transparent"
                  >
                    View
                  </button>

                  {uploadStatus[key] && (
                    <span className={`text-xs font-medium mt-2 ${uploadStatus[key]?.includes("successful") ? "text-green-600" : "text-red-600"}`}>{uploadStatus[key]}</span>
                  )}
                  <div className="text-sm font-medium text-gray-700 mt-2 text-center">{label}</div>
                </div>
              );
            })}
          </div>
        </div>
        </div>

        {/* Track Records */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Track Records</h3>
          {data.details.adherenceHistory && data.details.adherenceHistory.length > 0 ? (
            <div className="overflow-x-auto bg-white rounded-md shadow-sm">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-3 py-2 font-medium text-gray-700">Date</th>
                    <th className="px-3 py-2 font-medium text-gray-700">Adherence</th>
                    <th className="px-3 py-2 font-medium text-gray-700">Duration</th>
                    <th className="px-3 py-2 font-medium text-gray-700">Appliance</th>
                    <th className="px-3 py-2 font-medium text-gray-700">Score</th>
                    <th className="px-3 py-2 font-medium text-gray-700">Reason</th>
                    <th className="px-3 py-2 font-medium text-gray-700">Useful</th>
                    <th className="px-3 py-2 font-medium text-gray-700">Notes</th>
                    <th className="px-3 py-2 font-medium text-gray-700">Photo</th>
                  </tr>
                </thead>
                <tbody>
                  {data.details.adherenceHistory.slice().reverse().map((entry) => (
                    <tr key={entry._id} className="border-t">
                      <td className="px-3 py-2 align-top text-gray-700">{entry.date ? new Date(entry.date).toLocaleString() : ''}</td>
                      <td className="px-3 py-2 align-top text-gray-700">{entry.adherence ? 'Yes' : 'No'}</td>
                      <td className="px-3 py-2 align-top text-gray-700">{entry.duration || '-'}</td>
                      <td className="px-3 py-2 align-top text-gray-700">{entry.applianceType || '-'}</td>
                      <td className="px-3 py-2 align-top text-gray-700">{entry.score !== undefined ? `${entry.score}%` : '-'}</td>
                      <td className="px-3 py-2 align-top text-gray-700">{entry.reason || '-'}</td>
                      <td className="px-3 py-2 align-top text-gray-700">{entry.useful ? 'Yes' : 'No'}</td>
                      <td className="px-3 py-2 align-top text-gray-700">{entry.notes ? <div className="max-w-xs truncate">{entry.notes}</div> : '-'}</td>
                      <td className="px-3 py-2 align-top text-gray-700">
                        {entry.photoUrl ? (
                          <a href={entry.photoUrl} target="_blank" rel="noreferrer" className="text-cyan-600 hover:underline">View</a>
                        ) : ('-')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-600">No track records yet.</div>
          )}
        </div>
    </Layout>
  );
}
