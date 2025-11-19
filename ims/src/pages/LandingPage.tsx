import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import DecorativeBlobs from "../components/DecorativeBlobs";
import logo from "../logo.png";
import InteractiveMockup from "../components/InteractiveMockup";

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

            <div className="mt-8 text-sm text-gray-500">Designed for clinics and patients  Quick setup, daily adherence tracking, and insightful history.</div>
            <div className="mt-4">
              <a href="/orthosaarthi" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:underline font-medium">know more about orthosaarthi</a>
            </div>
          </div>

          {/* Right image / interactive mockup */}
          <InteractiveMockup />
        </div>
      </div>
    </Layout>
  );
}
