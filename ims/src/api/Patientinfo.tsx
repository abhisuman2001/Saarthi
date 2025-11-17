// fetchPatientInfo.ts
export interface PatientInfo {
  name: string;
  adherence: {
    last30days: number;
    yes: number;
  };
  answeredToday: boolean;
}

export const fetchPatientInfo = async (patid: string): Promise<PatientInfo | null> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND}/api/patientinfo/getPatientAdherence/${patid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch patient info: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Normalize response keys
    return {
      name: data.name,
      adherence: data.adherence ?? { last30days: 0, yes: 0 },
      answeredToday: data.answeredToday ?? false,
    };
  } catch (err) {
    console.error("Error fetching patient info:", err);
    return null;
  }
};

// api/Patientinfo.ts
export const addAdherenceEntry = async (
  patid: string,
  entry: { date: string; adherence: boolean; useful?: boolean; notes?: string }
) => {
  try {
    // Vite environment variable
    const backend = import.meta.env.VITE_BACKEND || "http://localhost:5000";

    const res = await fetch(`${backend}/api/patientinfo/addAdherenceEntry/${patid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adherence: entry.adherence,
        notes: entry.notes || "",
        useful: entry.useful !== undefined ? entry.useful : null,
        date: entry.date,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to add adherence entry");
    }

    return await res.json();
  } catch (err) {
    console.error("Error adding adherence entry:", err);
    return null;
  }
};

// --------------------- Types ---------------------
type Field = {
  name: string;
  value: string;
};

type HistoryEntry = {
  date: string;
  doctorName: string;
  fieldname: Field[];
};

type PatientDetails = {
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
};

type PatientData = {
  details: PatientDetails;
  adherencePercent?: number;
  history?: HistoryEntry[];
};

//console log
export const PatientInfo = async (patid: string): Promise<PatientData | null> => {
  try {
    const backend = import.meta.env.VITE_BACKEND || "http://localhost:5000";
  
    const res = await fetch(`${backend}/api/patientinfo/getPatientDetails/${patid}`);
    if (!res.ok) throw new Error("Failed to fetch patient data");
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
};



// ../api/Patientinfo.ts

export const updatePatientInfo = async (
  patid: string,
  updatedFields: { [key: string]: any }
): Promise<boolean> => {
  try {
        const backend = import.meta.env.VITE_BACKEND || "http://localhost:5000"; // <-- backend port
    const res = await fetch(`${backend}/api/patientinfo/updateInfo/${patid}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedFields),
    });

    if (!res.ok) {
      console.error("Failed to update patient info", await res.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error updating patient info:", err);
    return false;
  }
};



export const uploadFile = async (
  file: File,
  patid: string,
  field: string // e.g., "studyModelUrl"
): Promise<{ url?: string }> => {
  try {
    if (!patid) throw new Error("Patient ID is required");
    if (!field) throw new Error("Field is required");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("field", field); // still needed in body

    const backend = import.meta.env.VITE_BACKEND || "http://localhost:5000";

    const res = await fetch(`${backend}/api/patientinfo/uploadPatientFile/${patid}`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("File upload failed");

    const data = await res.json();
    return data; // { url: string }
  } catch (err) {
    console.error("Upload error:", err);
    return {};
  }
};
export const getPatientsByDoctor = async (docid: string): Promise<any[]> => {
  try {
    const backend = import.meta.env.VITE_BACKEND || "http://localhost:5000";
    const res = await fetch(`${backend}/api/patientinfo/getPatientsByDoctor/${docid}`);
    if (!res.ok) throw new Error("Failed to fetch patients");
    return res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};


export const addPatient = async ({
  name,
  contactNumber,
  password,
  doctorId,
}: {
  name: string;
  contactNumber: string;
  password: string;
  doctorId: string;
}) => {
  const backend = import.meta.env.VITE_BACKEND || "http://localhost:5000";
  const res = await fetch(`${backend}/api/patientinfo/addPatient`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, contactNumber, password, doctorId }),
  });
  if (!res.ok) throw new Error("Failed to add patient");
  return res.json();
};
