// src/pages/PatientHomepage.tsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ReactSpeedometer from "react-d3-speedometer";
import { fetchPatientInfo, addAdherenceEntry } from "../api/Patientinfo";

export default function PatientHomepage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const patid = searchParams.get("patid") || "";

  const [data, setData] = useState<any>(null);
  const [answer, setAnswer] = useState<string>("");
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [useful, setUseful] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const reasons = [
    "The appliance broke",
    "The appliance didn't fit well",
    "The appliance is pinching",
    "Wearing the appliance causes pain",
    "I forgot to wear the appliance",
    "Other",
  ];

  const loadPatientInfo = async () => {
    const res = await fetchPatientInfo(patid);
    if (res) setData(res);
  };

  useEffect(() => {
    loadPatientInfo();
  }, [patid]);

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#8EC5FC] to-[#E0C3FC]">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );

  const adherencePercent =
    data.adherence.last30days === 0
      ? 100
      : Math.round((data.adherence.yes / data.adherence.last30days) * 100);

  const showQuestionnaire = !data.answeredToday;

  const handleSubmit = async () => {
    if (!answer) {
      alert("Please select an answer");
      return;
    }
    if (answer === "no" && !notes) {
      alert("Please select or enter a reason for not wearing the appliance");
      return;
    }

    setLoading(true);

    const response = await addAdherenceEntry(patid, {
      date: new Date().toISOString(),
      adherence: answer === "yes",
      useful: useful ?? undefined,
      notes: notes || undefined,
    });

    if (response) {
      await loadPatientInfo();
      setAnswer("");
      setSelectedReason("");
      setNotes("");
      setUseful(null);
    } else {
      alert("Failed to submit. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-r from-[#8EC5FC] to-[#E0C3FC] p-6">
      <div className="max-w-xl mx-auto space-y-6 py-25">
        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Patient Dashboard
        </h1>
        <p className="text-xl font-medium text-center text-black">
          Hello, {data.name}
        </p>

        {/* Adherence Speedometer Card */}
        <div className="p-6 rounded-3xl bg-white bg-opacity-90 backdrop-blur-md shadow-2xl text-center">
          <h2 className="font-semibold mb-4 text-gray-800">Adherence Last 30 Days</h2>
          <div className="flex justify-center">
            <ReactSpeedometer
              maxValue={100}
              value={adherencePercent}
              needleColor="#4F46E5"
              startColor="#ff5858ff"
              endColor="#62ff9bff"
              segments={10}
              width={250}
              height={150}
              ringWidth={20}
            />
          </div>
          <p className="mt-2 font-medium text-lg text-gray-700">{adherencePercent}% adherence</p>
        </div>

        {/* Today's Questionnaire */}
        {showQuestionnaire ? (
          <div className="p-6 rounded-3xl bg-white bg-opacity-90 backdrop-blur-md shadow-2xl space-y-4">
            <h2 className="font-semibold text-gray-800">Did you wear your appliance today?</h2>

            {/* Yes/No Main Question */}
            <div className="flex space-x-4">
              <button
                className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                  answer === "yes" ? "bg-green-400 text-white" : "bg-gray-300 text-gray-800"
                }`}
                onClick={() => setAnswer("yes")}
              >
                Yes
              </button>
              <button
                className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                  answer === "no" ? "bg-red-400 text-white" : "bg-gray-300 text-gray-800"
                }`}
                onClick={() => setAnswer("no")}
              >
                No
              </button>
            </div>

            {/* Notes / Reason Dropdown (Only if "No") */}
            {answer === "no" && (
              <div className="space-y-2 mt-4">
                <label className="block font-medium text-gray-800">
                  If not worn, what was the reason?
                </label>
                <select
                  value={selectedReason}
                  onChange={(e) => {
                    setSelectedReason(e.target.value);
                    if (e.target.value !== "Other") setNotes(e.target.value);
                    else setNotes("");
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                >
                  <option value="">Select a reason</option>
                  {reasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>

                {selectedReason === "Other" && (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter reason here..."
                    className="w-full border border-gray-300 rounded-lg p-2 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    rows={3}
                  />
                )}
              </div>
            )}

            {/* Useful Question */}
            <div className="space-y-2 mt-4">
              <label className="block font-medium text-gray-800">Was this reminder message useful?</label>
              <div className="flex space-x-4">
                <button
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    useful === true ? "bg-green-400 text-white" : "bg-gray-300 text-gray-800"
                  }`}
                  onClick={() => setUseful(true)}
                >
                  Yes
                </button>
                <button
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    useful === false ? "bg-red-400 text-white" : "bg-gray-300 text-gray-800"
                  }`}
                  onClick={() => setUseful(false)}
                >
                  No
                </button>
              </div>
            </div>

            <button
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg shadow-md hover:scale-105 transition-transform"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        ) : (
          <p className="text-center font-medium text-gray-800">
            You have already submitted today's questionnaire. ✅
          </p>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-6 text-center text-sm rounded-t-xl">
        <p className="font-semibold text-white">ORTHO SAARTHI</p>
        <p className="opacity-75">
          Smart Assistant for Appliance Reminders and Treatment History Interface
        </p>
      </footer>
    </div>
  );
}
