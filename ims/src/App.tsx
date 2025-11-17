import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientHomepage from './pages/PatientHomePage'; // Make sure this exists
import PatientProfile from './pages/PatientProfile';
import AddPatient from './pages/AddPatient';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; // If you have a RegisterPage

function App() {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen">
        <Navbar />
        <Routes>
          <Route path="patient/homepage" element={<PatientHomepage />} />
          <Route path="doctor/profile" element={<PatientProfile />} />
          <Route path="doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="patient/add" element={<AddPatient />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
