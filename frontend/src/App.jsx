import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Home from "./pages/Home";
import Login from "./pages/AdminLogin";
import Dashboard from "./pages/AdminDashboard";
import CertificateDetails from "./pages/CertificateDetails";
import IssueCertificate from "./pages/NewCertificate";
import VerifyCertificate from "./pages/VerifyCertificate";

export default function App() {
  return (
    <Router>
      <div>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/verify/:id" element={<VerifyCertificate />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/certificates/:id" element={<CertificateDetails />} />
          <Route path="/admin/issue" element={<IssueCertificate />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}
