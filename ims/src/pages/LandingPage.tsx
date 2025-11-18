import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DecorativeBlobs from "../components/DecorativeBlobs";
import logo from "../logo.png";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-[75vh] flex items-center relative">
        <DecorativeBlobs />
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left text */}
          <div className="px-6 md:px-0">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Orthisaarhi" className="h-12 w-12" />
              <div className="text-sm text-gray-500 font-1.2rem font-semibold">Orthosaarthi</div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-6 leading-tight">Smart Assistant for Appliance Reminders and Treatment History</h1>
            <p className="text-lg text-gray-600 mt-4">Your digital chart for appliance wear, reminders and treatment tracking. a single interface to keep patients on track and doctors informed.</p>

            <div className="mt-6 flex gap-3">
              <button onClick={() => navigate('/register')} className="px-5 py-3 bg-white border border-cyan-600 text-cyan-600 rounded-md font-medium hover:bg-cyan-50">Sign Up</button>
              <button onClick={() => navigate('/login')} className="px-5 py-3 bg-cyan-600 text-white rounded-md font-medium hover:bg-cyan-700">Login</button>
            </div>

            <div className="mt-8 text-sm text-gray-500">Designed for clinics and patients — quick setup, daily adherence tracking, and insightful history.</div>
          </div>

          {/* Right image / mockup */}
          <div className="px-6 md:px-0 flex justify-center">
            <div className="max-w-lg w-full bg-gradient-to-br from-cyan-100 to-white rounded-2xl shadow-lg p-6">
              <img src={logo} alt="mockup" className="w-full h-48 object-contain opacity-90" />
              <div className="mt-4 bg-white rounded-lg p-4">
                <div className="h-2 bg-gray-200 rounded mb-3" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-16 bg-cyan-50 rounded" />
                  <div className="h-16 bg-cyan-50 rounded" />
                  <div className="h-16 bg-cyan-50 rounded" />
                </div>
                <div className="mt-3 h-24 bg-gray-50 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
