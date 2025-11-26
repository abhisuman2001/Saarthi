import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/User";
import "./LoginPage.css";
import Layout from "../components/Layout";
import DecorativeBlobs from "../components/DecorativeBlobs";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
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
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="login-page relative" style={{ marginTop: '-40px' }}>
        <DecorativeBlobs />
        <div className="split-container">
          <div className="left-panel">
            <div className="left-inner">
              <h2 className="text-2xl font-semibold text-center mb-1 text-gray-800">Registration</h2>
              <h2 className="text-sm text-center mb-6 text-gray-800">For Doctors Only</h2>

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
                <div className="input-with-icon">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                  <button
                    type="button"
                    title="Press and hold to view password"
                    aria-label="Press and hold to view password"
                    onMouseDown={() => setShowPassword(true)}
                    onMouseUp={() => setShowPassword(false)}
                    onMouseLeave={() => setShowPassword(false)}
                    onTouchStart={() => setShowPassword(true)}
                    onTouchEnd={() => setShowPassword(false)}
                    className="icon-btn"
                  >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#374151" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2.036 12.322C3.429 7.969 7.199 5 12 5c4.801 0 8.571 2.969 9.964 7.322a1.012 1.012 0 010 .356C20.571 16.031 16.801 19 12 19c-4.801 0-8.571-2.969-9.964-7.322a1.012 1.012 0 010-.356z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#374151" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 3l18 18" />
                          <path d="M6.06 6.06C7.81 4.88 9.83 4 12 4c4.8 0 8.57 2.97 9.96 7.32a1 1 0 010 .36C20.57 16.03 16.8 19 12 19c-2.17 0-4.19-.88-6-2.06" />
                          <path d="M10.94 10.94A3 3 0 0114.06 14.06" />
                        </svg>
                      )}
                  </button>
                </div>

                <div className="input-with-icon">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-input"
                    required
                  />
                  <button
                    type="button"
                    title="Press and hold to view password"
                    aria-label="Press and hold to view confirm password"
                    onMouseDown={() => setShowConfirmPassword(true)}
                    onMouseUp={() => setShowConfirmPassword(false)}
                    onMouseLeave={() => setShowConfirmPassword(false)}
                    onTouchStart={() => setShowConfirmPassword(true)}
                    onTouchEnd={() => setShowConfirmPassword(false)}
                    className="icon-btn"
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#374151" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2.036 12.322C3.429 7.969 7.199 5 12 5c4.801 0 8.571 2.969 9.964 7.322a1.012 1.012 0 010 .356C20.571 16.031 16.801 19 12 19c-4.801 0-8.571-2.969-9.964-7.322a1.012 1.012 0 010-.356z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#374151" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3l18 18" />
                        <path d="M6.06 6.06C7.81 4.88 9.83 4 12 4c4.8 0 8.57 2.97 9.96 7.32a1 1 0 010 .36C20.57 16.03 16.8 19 12 19c-2.17 0-4.19-.88-6-2.06" />
                        <path d="M10.94 10.94A3 3 0 0114.06 14.06" />
                      </svg>
                    )}
                  </button>
                </div>

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

        
      </div>
    </Layout>
  );
}
