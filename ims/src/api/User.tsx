export async function loginUser({ contactNumber, password }: { contactNumber: string; password: string }) {
    const backend = import.meta.env.VITE_BACKEND || "http://localhost:5000";
  const res = await fetch(`${backend}/api/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contactNumber, password }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Login failed");
  }

  return res.json();
}




type RegisterPayload = {
  name: string;
  contactNumber: string;
  password: string;
};

type RegisterResponse = {
  docid?: string;
  patid?: string;
};

export async function registerUser({ name, contactNumber, password }: RegisterPayload): Promise<RegisterResponse> {
  const backend = import.meta.env.VITE_BACKEND || "http://localhost:5000";

  const res = await fetch(`${backend}/api/user/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, contactNumber, password, role: "doctor" }), // include name
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Registration failed");
  }

  return data;
}


type ChangePasswordPayload = {
  contactNumber: string;
  oldPassword: string;
  newPassword: string;
};

type ChangePasswordResponse = {
  success: boolean;
  message?: string;
};

export async function changeUserPassword({
  contactNumber,
  oldPassword,
  newPassword,
}: ChangePasswordPayload): Promise<ChangePasswordResponse> {
  const backend = import.meta.env.VITE_BACKEND || "http://localhost:5000";

  const res = await fetch(`${backend}/api/user/change-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contactNumber, oldPassword, newPassword }),
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      success: false,
      message: data.error || "Failed to change password",
    };
  }

  return {
    success: true,
    message: data.message || "Password changed successfully",
  };
}
 
// --- Forgot password / OTP helpers (frontend API wrappers)
export async function sendOtp({ contactNumber }: { contactNumber: string }): Promise<{ success: boolean; message?: string }>{
  const backend = import.meta.env.VITE_BACKEND || "http://localhost:5000";
  const res = await fetch(`${backend}/api/user/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contactNumber }),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, message: data.error || data.message || "Failed to send OTP" };
  return { success: true, message: data.message };
}

export async function verifyOtp({ contactNumber, otp }:{ contactNumber:string; otp:string }): Promise<{ success: boolean; message?: string }>{
  const backend = import.meta.env.VITE_BACKEND || "http://localhost:5000";
  const res = await fetch(`${backend}/api/user/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contactNumber, otp }),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, message: data.error || data.message || "OTP verify failed" };
  return { success: true, message: data.message };
}

export async function resetPassword({ contactNumber, otp, newPassword }:{ contactNumber:string; otp:string; newPassword:string }): Promise<{ success:boolean; message?:string }>{
  const backend = import.meta.env.VITE_BACKEND || "http://localhost:5000";
  const res = await fetch(`${backend}/api/user/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contactNumber, otp, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) return { success: false, message: data.error || data.message || "Reset failed" };
  return { success: true, message: data.message };
}

export async function getDoctorById(docid: string): Promise<{ _id?: string; name?: string; patientsCount?: number; avatar?: string; createdAt?: string } | null> {
  try {
    const backend = import.meta.env.VITE_BACKEND || "http://localhost:5000";
    const res = await fetch(`${backend}/api/doctor/${docid}`);
    if (!res.ok) {
      console.error("Failed to fetch doctor", await res.text());
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function updateDoctor(docid: string, updates: { [k: string]: any }): Promise<any> {
  try {
    const backend = import.meta.env.VITE_BACKEND || "http://localhost:5000";
    const res = await fetch(`${backend}/api/doctor/${docid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update doctor");
    return res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function uploadDoctorAvatar(docid: string, file: File): Promise<{ url?: string } | null> {
  try {
    const backend = import.meta.env.VITE_BACKEND || "http://localhost:5000";
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${backend}/api/doctor/${docid}/avatar`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      console.error("Failed to upload avatar", await res.text());
      return null;
    }
    return res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}
