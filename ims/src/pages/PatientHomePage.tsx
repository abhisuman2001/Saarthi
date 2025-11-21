// src/pages/PatientHomepage.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchPatientInfo, PatientInfo as fetchPatientDetails, addAdherenceEntry, uploadFile } from "../api/Patientinfo";
import type { AdherenceEntryPayload } from "../api/Patientinfo";
import Layout from "../components/Layout";

export default function PatientHomepage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const patid = searchParams.get("patid") || "";

  type LocalPatientData = {
    name?: string;
    answeredToday?: boolean;
    details?: Record<string, unknown> | null;
  };
  type PatientDetails = {
    typeOfAppliance?: string;
    dob?: string;
    gender?: string;
    nextAppointment?: string;
    startDate?: string;
    provisionalDiagnosis?: string;
    finalDiagnosis?: string;
    adherenceHistory?: Array<{ _id?: string; adherence?: boolean; date?: string; score?: number }>;
  };
  const [data, setData] = useState<LocalPatientData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [useful, setUseful] = useState<boolean | null>(null);
  const [duration, setDuration] = useState<string>("");
  const [applianceType, setApplianceType] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{ score: number; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const reasons = [
    "The appliance broke",
    "The appliance didn't fit well",
    "The appliance is pinching",
    "Wearing the appliance causes pain",
    "I forgot to wear the appliance",
    "Other",
  ];

  const durations = [
    "<6 hrs",
    "6-10 hrs",
    "10-14 hrs",
    "14-18 hrs",
    ">18 hrs",
  ];

  const applianceTypes = [      "Upper Plate",
      "Lower Plate",
      "Functional Appliance (Activator,Bionator,Twinblock)",
      "Elastics",
      "Headgear",
      "Facemask",
      "Retainer",
      "Aligner",
      "Others",
    ];

    const [otherAppliance, setOtherAppliance] = useState<string>("");

  const loadPatientInfo = useCallback(async () => {
    try {
      setError(null);
      // fetch quick adherence/answeredToday info
      const quick = await fetchPatientInfo(patid);
      // fetch full patient details
      const full = await fetchPatientDetails(patid);
      const merged: LocalPatientData = {
        name: quick?.name || full?.details?.name || "",
        answeredToday: quick?.answeredToday ?? false,
        details: full?.details ?? full ?? null,
      };

      // If server didn't explicitly mark answeredToday, check the details' history for a recent entry within 24 hours
      const submittedWithin24 = (d: PatientDetails | undefined | null) => {
        if (!d || !d.adherenceHistory || d.adherenceHistory.length === 0) return false;
        const last = d.adherenceHistory[d.adherenceHistory.length - 1];
        if (!last?.date) return false;
        const diff = Date.now() - new Date(last.date).getTime();
        return diff < 24 * 60 * 60 * 1000; // 24 hours
      };

      if (!merged.answeredToday && submittedWithin24(merged.details as PatientDetails | undefined)) {
        merged.answeredToday = true;
      }
      // If there's a recent adherence entry, derive today's score from it so
      // the UI shows the correct percent after a refresh (don't rely only on answeredToday boolean).
      const recentHistory = (merged.details as PatientDetails | undefined)?.adherenceHistory;
      if (recentHistory && recentHistory.length > 0) {
        const last = recentHistory[recentHistory.length - 1];
        if (last && last.date) {
          const diff = Date.now() - new Date(last.date).getTime();
          if (diff < 24 * 60 * 60 * 1000) {
            // mark answeredToday and set submissionResult based on stored score (fallback to adherence boolean)
            merged.answeredToday = true;
            const score = typeof last.score === 'number' ? last.score : (last.adherence ? 100 : 0);
            const message = score === 100
              ? "Great — you reported today!"
              : "Thanks for reporting — don't be discouraged. Please try again tomorrow and keep going!";
            setSubmissionResult({ score, message });
          } else {
            setSubmissionResult(null);
          }
        }
      }

      setData(merged);
    } catch (err) {
      console.error("Failed to load patient info:", err);
      setError("Failed to load patient data. Please check your connection or try again later.");
    }
  }, [patid]);

  useEffect(() => {
    loadPatientInfo();
  }, [loadPatientInfo]);

  // Camera helpers (moved before conditional returns so hooks remain in stable order)
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      // store stream in ref and mark camera active; attach to video element in effect after mount
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      console.error("Camera error:", err);
      alert("Unable to access camera. Please allow camera permissions or use photo upload.");
    }
  };

  const stopCamera = () => {
    const stream = streamRef.current ?? (videoRef.current?.srcObject as MediaStream | undefined);
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    streamRef.current = null;
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const ensureReady = async () => {
      if (video.videoWidth && video.videoHeight) return;
      await new Promise<void>((resolve) => {
        const handler = () => {
          video.removeEventListener("loadedmetadata", handler);
          resolve();
        };
        video.addEventListener("loadedmetadata", handler);
        setTimeout(resolve, 600);
      });
    };

    ensureReady().then(() => {
      const w = video.videoWidth || 640;
      const h = video.videoHeight || 480;
      if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
      const canvas = canvasRef.current as HTMLCanvasElement;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, w, h);
      canvas.toBlob((blob) => {
        if (!blob) return;
        // revoke previous preview URL to avoid leaks
        if (capturedPreview) {
          try { URL.revokeObjectURL(capturedPreview); } catch (e) { console.warn(e); }
        }
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: blob.type });
        setPhotoFile(file);
        const url = URL.createObjectURL(blob);
        setCapturedPreview(url);
        setPhotoPreview(url);
        // stop camera after capture
        stopCamera();
      }, "image/jpeg", 0.9);
    });
  };
  // cleanup & keyboard handlers (hook order kept above the conditional return)
  useEffect(() => {
    return () => {
      // cleanup any active camera stream on unmount
      stopCamera();
      if (capturedPreview) URL.revokeObjectURL(capturedPreview);
    };
  }, [capturedPreview]);

  // ESC key handler: close camera or clear captured preview
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (cameraActive) {
          stopCamera();
        } else if (capturedPreview) {
          try {
            URL.revokeObjectURL(capturedPreview);
          } catch {
            // ignore
          }
          setCapturedPreview(null);
          setPhotoPreview(null);
          setPhotoFile(null);
        }
      }
    };

    if (cameraActive || capturedPreview) {
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [cameraActive, capturedPreview]);

  // When cameraActive becomes true and a stream exists, attach stream to the video element
  useEffect(() => {
    const attach = async () => {
      const stream = streamRef.current;
      const video = videoRef.current;
      if (!stream || !video) return;
      try {
        video.muted = true;
      } catch (e) {
        console.warn("Could not mute video element:", e);
      }
      video.playsInline = true;
      video.srcObject = stream;
      // wait for metadata
      await new Promise<void>((resolve) => {
        if (video.readyState >= 2) return resolve();
        const handler = () => {
          video.removeEventListener("loadedmetadata", handler);
          resolve();
        };
        video.addEventListener("loadedmetadata", handler);
        setTimeout(resolve, 600);
      });
      try {
        await video.play();
      } catch (err) {
        console.warn("Video play failed:", err);
      }
    };
    if (cameraActive) attach();
  }, [cameraActive]);

  if (!data)
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          {error ? (
            <div className="max-w-md text-center bg-white p-6 rounded shadow">
              <h3 className="text-lg font-semibold text-gray-800">Unable to load</h3>
              <p className="mt-2 text-gray-600">{error}</p>
              <div className="mt-4">
                <button onClick={loadPatientInfo} className="px-4 py-2 bg-cyan-600 text-white rounded">Retry</button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 text-xl">Loading...</p>
          )}
        </div>
      </Layout>
    );

  // const showQuestionnaire = !data.answeredToday; // no longer used
  const details = (data?.details as PatientDetails) ?? undefined;
  const alreadySubmitted = data?.answeredToday ?? false;

  // scoring: per request yes => 100, no => 0
  const computeScore = (ans: string) => (ans === "yes" ? 100 : 0);

  

  const handleSubmit = async () => {
    // Guard: prevent duplicate submissions within 24 hours
    if (data?.answeredToday) {
      alert("You've already submitted today. Please come back tomorrow to report again.");
      return;
    }

    if (!answer) {
      alert("Please select an answer");
      return;
    }

    // validations
    if (answer === "yes") {
      if (!duration) {
        alert("Please select duration");
        return;
      }
      if (!applianceType) {
        alert("Please select appliance type");
        return;
      }
      if (applianceType === 'Others' && !otherAppliance) {
        alert("Please describe the other appliance");
        return;
      }
    }

    if (answer === "no") {
      if (!selectedReason) {
        alert("Please select a reason for not wearing the appliance");
        return;
      }
      if (selectedReason === "Other" && !notes) {
        alert("Please provide a reason in the text box");
        return;
      }
    }

    setLoading(true);

    try {
      let photoUrl: string | undefined = undefined;
      if (photoFile) {
        const up = await uploadFile(photoFile, patid, "adherencePhoto");
        if (up?.url) photoUrl = up.url;
      }

      const score = computeScore(answer);

      const payload: AdherenceEntryPayload = {
        date: new Date().toISOString(),
        adherence: answer === "yes",
        useful: useful ?? undefined,
        notes: notes || undefined,
        duration: answer === "yes" ? duration : undefined,
        applianceType: answer === "yes" ? (applianceType === 'Others' ? otherAppliance : applianceType) : undefined,
        photoUrl: photoUrl || undefined,
        score,
        reason: answer === "no" ? selectedReason : undefined,
      };

      const response = await addAdherenceEntry(patid, payload);

      if (response) {
        // Optimistically update local state so the UI (badge + track records) reflects the new submission immediately
        setData((prev) => {
          const prevDetails = (prev?.details as PatientDetails) ?? {};
          const respObj = response as { _id?: string } | null;
          const newEntry = {
            _id: respObj?._id || `local-${Date.now()}`,
            adherence: answer === "yes",
            date: payload.date,
          };
          const history = prevDetails.adherenceHistory ? [...prevDetails.adherenceHistory, newEntry] : [newEntry];
          const newDetails: PatientDetails = { ...prevDetails, adherenceHistory: history };
          return { ...(prev ?? {}), answeredToday: true, details: newDetails };
        });

        // refresh from server but ignore failures — local optimistic update keeps UI consistent
        try {
          await loadPatientInfo();
        } catch {
          /* ignore */
        }

        setAnswer("");
        setSelectedReason("");
        setNotes("");
        setUseful(null);
        setDuration("");
        setApplianceType("");
        setOtherAppliance("");
        setPhotoFile(null);
        setPhotoPreview(null);
        setCapturedPreview(null);

        // show motivational message after submit
        const message = score === 100
          ? "Excellent — keep it up! Come back tomorrow to continue your progress."
          : "Thanks for reporting — don't be discouraged. Please try again tomorrow and keep going!";
        // attach a small reminder in UI (we store locally)
        setSubmissionResult({ score, message });
      } else {
        alert("Failed to submit. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: main heading */}
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-gray-800">Patient Portal</h1>
            <p className="text-lg text-gray-600 mt-1">Welcome back, <span className="font-semibold">{data?.name}</span></p>
          </div>
          {/* Right: profile card */}
          <div className="md:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xl font-semibold">{String(data?.name || "P")[0]?.toUpperCase()}</div>
                <div>
                  <div className="font-semibold">{data?.name || "Patient"}</div>
                  <div className="text-sm text-gray-500">{details?.typeOfAppliance || ""}</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700">
                <div><span className="font-medium">DOB:</span> {details?.dob ? new Date(details.dob).toLocaleDateString() : '—'}</div>
                <div><span className="font-medium">Gender:</span> {details?.gender || '—'}</div>
                <div><span className="font-medium">Next appt:</span> {details?.nextAppointment ? new Date(details.nextAppointment).toLocaleDateString() : '—'}</div>
                <div><span className="font-medium">Start date:</span> {details?.startDate ? new Date(details.startDate).toLocaleDateString() : '—'}</div>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <div className="font-medium">Diagnosis</div>
                <div className="mt-1">{details?.provisionalDiagnosis || details?.finalDiagnosis || 'Not provided'}</div>
              </div>
              {/* submission badge */}
              <div className="mt-3">
                {data?.answeredToday ? (
                  <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">Submitted today ✓</div>
                ) : (
                  <div className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">Not submitted</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {/* Questionnaire container */}
            <div className="p-6 rounded-lg bg-white shadow-sm space-y-4 mt-4">
              <h2 className="font-semibold text-gray-800">Daily Appliance Check — Did you wear your appliance today?</h2>


              {/* Already submitted banner */}
              {alreadySubmitted && (
                <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded">You've already submitted today — please come back tomorrow to report again.</div>
              )}

              {/* Yes/No Main Question */}
              <div className="flex space-x-4">
              <button
                disabled={alreadySubmitted}
                className={`flex-1 px-4 py-2 rounded-lg font-medium ${answer === "yes" ? "bg-green-400 text-white" : "bg-gray-300 text-gray-800"} ${alreadySubmitted ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => setAnswer("yes")}
              >
                Yes
              </button>
              <button
                disabled={alreadySubmitted}
                className={`flex-1 px-4 py-2 rounded-lg font-medium ${answer === "no" ? "bg-red-400 text-white" : "bg-gray-300 text-gray-800"} ${alreadySubmitted ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => setAnswer("no")}
              >
                No
              </button>
            </div>

            {/* If Yes: duration, appliance type, photo, useful */}
            {answer === "yes" && (
              <div className="space-y-3 mt-4">
                <div>
                  <label className="block font-medium text-gray-800">How long did you wear it today?</label>
                  <select value={duration} onChange={(e)=>setDuration(e.target.value)} disabled={alreadySubmitted} className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none">
                    <option value="">Select duration</option>
                    {durations.map(d=> <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-800">Appliance type</label>
                  <select value={applianceType} onChange={(e)=>{ setApplianceType(e.target.value); if(e.target.value !== 'Others') setOtherAppliance(''); }} disabled={alreadySubmitted} className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none">
                    <option value="">Select appliance</option>
                    {applianceTypes.map(a=> <option key={a} value={a}>{a}</option>)}
                  </select>

                  {applianceType === 'Others' && (
                    <input
                      type="text"
                      placeholder="Describe other appliance"
                      value={otherAppliance}
                      onChange={(e)=>setOtherAppliance(e.target.value)}
                      disabled={alreadySubmitted}
                      className="mt-2 w-full border border-gray-300 rounded-lg p-2"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-medium text-gray-800">Upload a photo (optional)</label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <input type="file" accept="image/*" disabled={alreadySubmitted} onChange={(e)=>{ const f = e.target.files?.[0]; if(f){ setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); } }} className="mt-2" />

                    {/* Camera controls */}
                    {!cameraActive ? (
                      <button type="button" onClick={startCamera} disabled={alreadySubmitted} className="mt-2 px-3 py-2 bg-gray-200 rounded-md">Open Camera</button>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        <button type="button" onClick={capturePhoto} disabled={alreadySubmitted} className="px-3 py-2 bg-cyan-600 text-white rounded-md">Capture</button>
                        <button type="button" onClick={stopCamera} disabled={alreadySubmitted} className="px-3 py-2 border rounded-md">Close Camera</button>
                      </div>
                    )}
                    {/* Hint for keyboard users */}
                    {(cameraActive || capturedPreview) && (
                      <div className="text-sm text-gray-500 mt-2">Press <span className="font-medium">ESC</span> to close camera / clear photo</div>
                    )}
                  </div>

                  {cameraActive && (
                    <div className="mt-2">
                      <video ref={videoRef} className="w-full max-h-60 bg-black" playsInline />
                    </div>
                  )}

                  {photoPreview && (<img src={photoPreview} alt="preview" className="mt-2 max-h-40 object-contain" />)}
                </div>

                <div>
                  <label className="block font-medium text-gray-800">Was this reminder message useful?</label>
                  <div className="flex space-x-4 mt-2">
                    <button disabled={alreadySubmitted} className={`flex-1 px-4 py-2 rounded-lg font-medium ${useful===true? 'bg-green-400 text-white':'bg-gray-300 text-gray-800'} ${alreadySubmitted ? 'opacity-60 cursor-not-allowed' : ''}`} onClick={()=>setUseful(true)}>Yes</button>
                    <button disabled={alreadySubmitted} className={`flex-1 px-4 py-2 rounded-lg font-medium ${useful===false? 'bg-red-400 text-white':'bg-gray-300 text-gray-800'} ${alreadySubmitted ? 'opacity-60 cursor-not-allowed' : ''}`} onClick={()=>setUseful(false)}>No</button>
                  </div>
                </div>
              </div>
            )}

            {/* If No: reason and feedback */}
            {answer === "no" && (
              <div className="space-y-3 mt-4">
                <label className="block font-medium text-gray-800">Why didn't you wear the appliance?</label>
                <select value={selectedReason} disabled={alreadySubmitted} onChange={(e)=>{ setSelectedReason(e.target.value); if(e.target.value !== 'Other') setNotes(e.target.value); else setNotes(''); }} className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none">
                  <option value="">Select reason</option>
                  {reasons.map(r=> <option key={r} value={r}>{r}</option>)}
                </select>
                {selectedReason === 'Other' && (
                  <textarea value={notes} disabled={alreadySubmitted} onChange={(e)=>setNotes(e.target.value)} placeholder="Please describe..." className="w-full border border-gray-300 rounded-lg p-2" rows={3} />
                )}
                <div>
                  <label className="block font-medium text-gray-800">Any feedback?</label>
                  <textarea value={notes} disabled={alreadySubmitted} onChange={(e)=>setNotes(e.target.value)} placeholder="Optional feedback" className="w-full border border-gray-300 rounded-lg p-2" rows={2} />
                </div>
                                <div>
                  <label className="block font-medium text-gray-800">Was this reminder message useful?</label>
                  <div className="flex space-x-4 mt-2">
                    <button disabled={alreadySubmitted} className={`flex-1 px-4 py-2 rounded-lg font-medium ${useful===true? 'bg-green-400 text-white':'bg-gray-300 text-gray-800'} ${alreadySubmitted ? 'opacity-60 cursor-not-allowed' : ''}`} onClick={()=>setUseful(true)}>Yes</button>
                    <button disabled={alreadySubmitted} className={`flex-1 px-4 py-2 rounded-lg font-medium ${useful===false? 'bg-red-400 text-white':'bg-gray-300 text-gray-800'} ${alreadySubmitted ? 'opacity-60 cursor-not-allowed' : ''}`} onClick={()=>setUseful(false)}>No</button>
                  </div>
                </div>

              </div>
            )}

              <div className="pt-2">
                <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-md shadow-sm" onClick={handleSubmit} disabled={loading || alreadySubmitted}>{alreadySubmitted ? 'Submitted today' : (loading? 'Submitting...':'Submit')}</button>
              </div>
            </div>
          </div>

          {/* Right column: score + motivational + track records */}
          <div className="md:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
              <div className="text-center">
                <div className="text-sm text-gray-500">Today's Score</div>
                <div className="mt-3">
                  {/* animated progress bar */}
                  <div className="w-full bg-gray-100 h-4 rounded overflow-hidden">
                    <div
                      className="h-4 bg-cyan-600 rounded"
                      style={{ width: `${submissionResult ? submissionResult.score : (data?.answeredToday ? 100 : 0)}%`, transition: 'width 700ms ease' }}
                    />
                  </div>
                  <div className="mt-2 text-2xl font-bold">{submissionResult ? submissionResult.score : (data?.answeredToday ? 100 : 0)}%</div>
                </div>

                <div className="mt-3 text-sm text-gray-600">{submissionResult ? submissionResult.message : (data?.answeredToday ? 'Great — you reported today!' : 'Please submit your daily check')}</div>
              </div>
            </div>

            {/* Track Records */}
            <div className="bg-white p-4 rounded-lg shadow-sm mt-4">
              <h3 className="font-semibold text-gray-800 mb-2">Track Records</h3>
              {details?.adherenceHistory && details.adherenceHistory.length > 0 ? (
                <div className="space-y-2">
                  {details.adherenceHistory.slice().reverse().map((entry) => (
                    <div key={entry._id} className="p-2 border rounded">
                      <div className="text-sm font-medium">{entry.adherence ? 'Wore appliance' : 'Did not wear'}</div>
                      <div className="text-xs text-gray-500">{entry.date ? new Date(entry.date).toLocaleString() : ''}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-600">No track records yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Submission result / motivational message */}
        {submissionResult && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold">Score: {submissionResult.score}%</div>
            <div className="mt-2 text-gray-700">{submissionResult.message}</div>
            <div className="mt-3 text-sm text-gray-500">Reminder: Please come back tomorrow and update your progress — small steps every day make a big difference!</div>
          </div>
        )}
      </div>
    </Layout>
  );
}
