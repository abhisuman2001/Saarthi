// src/pages/Login.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, changeUserPassword } from "../api/User";
import { requestFirebaseNotificationPermission } from "../fb.ts";
import "./LoginPage.css";
import Layout from "../components/Layout";
import DecorativeBlobs from "../components/DecorativeBlobs";

type LoginResponse = {
  role: "doctor" | "patient";
  docid?: string;
  patid?: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [contactNumber, setContactNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Change password states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // ----- LOGIN HANDLER -----
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!contactNumber || !password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const user: LoginResponse = await loginUser({ contactNumber, password });

      if (!user || !user.role) {
        setError("Invalid credentials");
        return;
      }

      console.log("Requesting notification permission...");
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        }
      });
      requestFirebaseNotificationPermission();

      if (user.role === "doctor") {
        navigate(`/doctor/dashboard?docid=${user.docid}`);
      } else if (user.role === "patient") {
        navigate(`/patient/homepage?patid=${user.patid}`);
      } else {
        setError("Unknown user role");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ----- CHANGE PASSWORD HANDLER -----
  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!contactNumber || !oldPassword || !newPassword) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const response = await changeUserPassword({
        contactNumber,
        oldPassword,
        newPassword,
      });

      if (response.success) {
        // alert("Password changed successfully");
        setShowChangePassword(false);
        setOldPassword("");
        setNewPassword("");
      } else {
        setError(response.message || "Failed to change password");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // keep for analytics or other side-effects in future
  }, []);

  return (
    <Layout>
      <div className="login-page relative" style={{ marginTop: '-40px' }}>
        <DecorativeBlobs />
        <div className="split-container">
        <div className="left-panel">
          <div className="left-inner">
            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Doctor / Patient Login</h2>

            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

            {/* ----- LOGIN FORM ----- */}
            {!showChangePassword && (
              <form onSubmit={handleLogin} className="form-stack">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Contact Number</label>
                  <input
                    type="text"
                    placeholder="9874563210"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <button type="submit" disabled={loading} className="primary-btn">
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            )}

            {/* ----- CHANGE PASSWORD FORM ----- */}
            {showChangePassword && (
              <form onSubmit={handleChangePassword} className="mt-4 space-y-4 bg-gray-100 p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 text-center">Change Password</h3>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Contact Number</label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Old Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <button type="submit" className="primary-btn muted">Change Password</button>
              </form>
            )}

            {/* ----- TOGGLE BUTTON ----- */}
            <div className="text-center mt-4">
              <button type="button" onClick={() => setShowChangePassword(!showChangePassword)} className="ghost-link">
                {showChangePassword ? "Back to Login" : "Change Password"}
              </button>
            </div>

            <div className="text-center mt-6">
              <button onClick={() => navigate("/register")} className="secondary-btn small">Don’t have an account? (only for doctors)</button>
            </div>
          </div>
        </div>

        <div className="right-panel" role="presentation">
          <div className="right-illus" />
        </div>
        </div>

        
      </div>
    </Layout>
  );
}
