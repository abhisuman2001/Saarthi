import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/User";
import "./LoginPage.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name || !contactNumber || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const data = await registerUser({ name, contactNumber, password });

      if (data.docid) {
        navigate(`/doctor/dashboard?docid=${data.docid}`);
      } else {
        setError("Failed to register doctor");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="split-container">
        <div className="left-panel">
          <div className="left-inner">
            <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">Register Doctor</h2>

            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

            <form onSubmit={handleRegister} className="form-stack">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
              <input
                type="text"
                placeholder="Contact Number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                className="form-input"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="primary-btn"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>

            <div className="text-center mt-6">
              <button
                onClick={() => navigate("/login")}
                className="ghost-link small"
              >
                Already have an account? Login
              </button>
            </div>
          </div>
        </div>

        <div className="right-panel" role="presentation">
          <div className="right-illus" />
        </div>
      </div>

      {/* Footer */}
      <footer className="page-footer">
        <div className="footer-inner">
          <p className="footer-title">ORTHO SAARTHI</p>
          <p className="footer-copy">Smart Assistant for Appliance Reminders and Treatment History Interface</p>
          <p className="opacity-60 mt-2">© {new Date().getFullYear()} ORTHO SAARTHI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
