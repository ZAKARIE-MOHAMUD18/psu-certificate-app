import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Home() {
  const [certificateId, setCertificateId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certificateId.trim()) {
      toast.error('Please enter a certificate ID');
      return;
    }

    setLoading(true);
    try {
      // Navigate to verification page
      navigate(`/verify/${certificateId.trim()}`);
    } catch (error) {
      toast.error('Failed to verify certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <a className="navbar-brand fw-bold" href="/">
            <i className="bi bi-mortarboard me-2"></i>
            PSU Certificate System
          </a>
          <div className="navbar-nav ms-auto">
            <a className="nav-link" href="/admin/login">
              <i className="bi bi-person-circle me-1"></i>
              Admin Login
            </a>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        {/* Page Title */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-primary">Certificate Verification</h1>
          <p className="lead text-muted">Puntland State University</p>
        </div>

        {/* Certificate Input Card */}
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4">
                <h5 className="card-title text-center mb-4">
                  <i className="bi bi-search me-2"></i>
                  Verify Certificate
                </h5>

                <form onSubmit={handleVerify}>
                  <div className="input-group mb-3">
                    <span className="input-group-text">
                      <i className="bi bi-award"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Enter certificate ID (e.g., PSU-ABC123)"
                      value={certificateId}
                      onChange={(e) => setCertificateId(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Verify Certificate
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* How to Verify Section */}
        <div className="row justify-content-center mt-5">
          <div className="col-md-10 col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h5 className="card-title text-center mb-4">
                  <i className="bi bi-info-circle me-2"></i>
                  How to Verify a Certificate
                </h5>

                <div className="row">
                  <div className="col-md-6">
                    <h6 className="fw-bold text-primary">
                      <i className="bi bi-1-circle me-2"></i>
                      Manual Verification
                    </h6>
                    <ol className="list-unstyled ps-4">
                      <li className="mb-2">
                        <i className="bi bi-arrow-right text-primary me-2"></i>
                        Enter the certificate ID in the search box above
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-arrow-right text-primary me-2"></i>
                        Click "Verify" to check the certificate status
                      </li>
                      <li className="mb-2">
                        <i className="bi bi-arrow-right text-primary me-2"></i>
                        View the complete certificate details if valid
                      </li>
                    </ol>
                  </div>
                  
                  <div className="col-md-6">
                    <h6 className="fw-bold text-success">
                      <i className="bi bi-qr-code me-2"></i>
                      QR Code Scanning
                    </h6>
                    <div className="alert alert-success">
                      <p className="mb-0">
                        <i className="bi bi-camera me-2"></i>
                        Scan the QR code on your physical certificate with your
                        device's camera. The system will automatically redirect you to the
                        verification page.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
