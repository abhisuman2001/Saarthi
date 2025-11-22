// src/pages/Login.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, sendOtp, verifyOtp, resetPassword } from "../api/User";
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

  // Forgot / Reset password (OTP) states
  const [showChangePassword, setShowChangePassword] = useState(false); // toggles forgot-password UI
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotStep, setForgotStep] = useState<'idle'|'otp'|'reset'>('idle');
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

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

  // ----- FORGOT PASSWORD (OTP) HANDLERS -----
  const handleSendOtp = async () => {
    setError(null);
    setOtpError(null);
    if (!contactNumber) {
      setError("Contact number is required to send OTP");
      return;
    }

    try {
      setSendingOtp(true);
      const res = await sendOtp({ contactNumber });
      if (res.success) {
        setForgotStep('otp');
      } else {
        setError(res.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setOtpError(null);
    const code = otp.join('');
    if (code.length < 4) {
      setOtpError('Enter the OTP');
      return;
    }
    try {
      setVerifyingOtp(true);
      const res = await verifyOtp({ contactNumber, otp: code });
      if (res.success) {
        setForgotStep('reset');
      } else {
        setOtpError(res.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error(err);
      setOtpError('OTP verification failed');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setOtpError(null);
    if (!newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const code = otp.join('');
    try {
      setResetting(true);
      const res = await resetPassword({ contactNumber, otp: code, newPassword });
      if (res.success) {
        setShowChangePassword(false);
        setForgotStep('idle');
        setNewPassword('');
        setConfirmPassword('');
        setOtp(new Array(6).fill(''));
      } else {
        setError(res.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to reset password');
    } finally {
      setResetting(false);
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
                    placeholder="ex- 9876543210" 
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

            {/* ----- FORGOT / RESET PASSWORD (OTP) UI ----- */}
            {showChangePassword && (
              <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 text-center">Forgot Password</h3>

                {forgotStep === 'idle' && (
                  <div className="mt-3">
                    <label className="block mb-1 text-sm font-medium text-gray-700">Contact Number</label>
                    <input
                      type="text"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="form-input"
                      placeholder="Enter registered contact"
                      required
                    />
                    <button onClick={handleSendOtp} disabled={sendingOtp} className="primary-btn mt-3">
                      {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                  </div>
                )}

                {forgotStep === 'otp' && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 text-center mb-3">Enter the 6-digit OTP sent to your phone</p>
                    <div className="otp-inputs" style={{display:'flex',gap:8,justifyContent:'center'}}>
                      {otp.map((val, idx) => (
                        <input
                          key={idx}
                          inputMode="numeric"
                          maxLength={1}
                          value={val}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^0-9]/g, '');
                            const next = [...otp];
                            next[idx] = v;
                            setOtp(next);
                            if (v && idx < otp.length - 1) {
                              const el = document.querySelectorAll<HTMLInputElement>('.otp-inputs input')[idx + 1];
                              el?.focus();
                            }
                          }}
                          className="otp-box"
                          style={{width:44,height:52,textAlign:'center',fontSize:18,borderRadius:8,border:'1px solid rgba(15,23,36,0.08)'}}
                        />
                      ))}
                    </div>
                    {otpError && <p className="text-red-500 text-center mt-2">{otpError}</p>}
                    <div style={{display:'flex',gap:8,marginTop:12,justifyContent:'center'}}>
                      <button onClick={handleVerifyOtp} disabled={verifyingOtp} className="primary-btn" style={{width:160}}>
                        {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                      </button>
                      <button onClick={handleSendOtp} disabled={sendingOtp} className="secondary-btn" style={{width:120}}>
                        {sendingOtp ? 'Resending...' : 'Resend'}
                      </button>
                    </div>
                  </div>
                )}

                {forgotStep === 'reset' && (
                  <form onSubmit={handleResetPassword} className="mt-3 space-y-3">
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
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    <button type="submit" disabled={resetting} className="primary-btn muted">
                      {resetting ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ----- TOGGLE BUTTON ----- */}
            <div className="text-center mt-4">
              <button type="button" onClick={() => setShowChangePassword(!showChangePassword)} className="ghost-link">
                {showChangePassword ? "Back to Login" : "Forgot Password? Click here"}
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
