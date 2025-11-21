// api/Patientinfo.ts
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
    const backend = import.meta.env.VITE_BACKEND || "http://localhost:5000";
    const response = await fetch(
      `${backend}/api/patientinfo/getPatientAdherence/${patid}`,
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

export interface AdherenceEntryPayload {
  adherence: boolean;
  date?: string;
  notes?: string;
  useful?: boolean;
  duration?: string;
  applianceType?: string;
  photoUrl?: string;
  score?: number;
  reason?: string;
  [key: string]: unknown;
}

export const addAdherenceEntry = async (
  patid: string,
  entry: AdherenceEntryPayload
): Promise<unknown> => {
  try {
    const backend = import.meta.env.VITE_BACKEND || "http://localhost:5000";

    const res = await fetch(`${backend}/api/patientinfo/addAdherenceEntry/${patid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
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
  dob?: string | null;
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
  history?: HistoryEntry[];
};

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

export const updatePatientInfo = async (
  patid: string,
  updatedFields: Partial<PatientDetails>
): Promise<boolean> => {
  try {
    const backend = import.meta.env.VITE_BACKEND || "http://localhost:5000"; 
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
export const getPatientsByDoctor = async (docid: string): Promise<unknown[]> => {
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
