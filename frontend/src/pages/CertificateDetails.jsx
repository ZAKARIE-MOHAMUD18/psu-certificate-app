import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function CertificateDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificate();
  }, [id]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/certificates/${id}`);
      setCertificate(response.data);
    } catch (error) {
      toast.error('Failed to fetch certificate details');
      if (error.response?.status === 401) {
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = () => {
    window.open(`${api.defaults.baseURL}/admin/certificates/${id}/download`, '_blank');
  };

  const copyVerificationLink = () => {
    const link = `${window.location.origin}/verify/${certificate.certificate_number}`;
    navigator.clipboard.writeText(link);
    toast.success('Verification link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5>Loading Certificate Details...</h5>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">
          <h4>Certificate Not Found</h4>
          <p>The requested certificate could not be found.</p>
          <button className="btn btn-primary" onClick={() => navigate('/admin/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <a className="navbar-brand fw-bold" href="/admin/dashboard">
            <i className="bi bi-mortarboard me-2"></i>
            PSU Admin Dashboard
          </a>
          <div className="navbar-nav ms-auto">
            <button 
              className="btn btn-outline-light"
              onClick={() => navigate('/admin/dashboard')}
            >
              <i className="bi bi-arrow-left me-1"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">Certificate Details</h2>
            <p className="text-muted mb-0">Certificate #{certificate.certificate_number}</p>
          </div>
          <div className="btn-group">
            <button className="btn btn-success" onClick={downloadCertificate}>
              <i className="bi bi-download me-2"></i>
              Download PDF
            </button>
            <button className="btn btn-info" onClick={copyVerificationLink}>
              <i className="bi bi-link-45deg me-2"></i>
              Copy Link
            </button>
          </div>
        </div>

        <div className="row">
          {/* Certificate Information */}
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-award me-2"></i>
                  Certificate Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">Student Name</label>
                    <p className="h5 text-primary">{certificate.student_name}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">Student ID</label>
                    <p className="h6">{certificate.student_id}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">Course</label>
                    <p className="h6">{certificate.course}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">Issue Date</label>
                    <p className="h6">{new Date(certificate.issue_date).toLocaleDateString()}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">Certificate Number</label>
                    <p className="h6">
                      <span className="badge bg-primary fs-6">{certificate.certificate_number}</span>
                    </p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-muted">Status</label>
                    <p className="h6">
                      <span className="badge bg-success fs-6">
                        <i className="bi bi-check-circle me-1"></i>
                        Valid
                      </span>
                    </p>
                  </div>
                </div>

                {/* Verification Link */}
                <div className="mt-4">
                  <label className="form-label text-muted">Verification Link</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={`${window.location.origin}/verify/${certificate.certificate_number}`}
                      readOnly
                    />
                    <button className="btn btn-outline-secondary" onClick={copyVerificationLink}>
                      <i className="bi bi-clipboard"></i>
                    </button>
                  </div>
                  <small className="text-muted">
                    Share this link to allow others to verify the certificate
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="bi bi-qr-code me-2"></i>
                  QR Code
                </h5>
              </div>
              <div className="card-body text-center">
                <div className="mb-3">
                  <QRCodeSVG
                    value={`${window.location.origin}/verify/${certificate.certificate_number}`}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-muted small">
                  Scan this QR code to verify the certificate
                </p>
                <button 
                  className="btn btn-outline-success btn-sm"
                  onClick={() => navigate(`/verify/${certificate.certificate_number}`)}
                >
                  <i className="bi bi-eye me-1"></i>
                  Preview Verification
                </button>
              </div>
            </div>

            {/* Certificate Preview */}
            <div className="card mt-3">
              <div className="card-header">
                <h6 className="mb-0">
                  <i className="bi bi-file-earmark-pdf me-2"></i>
                  Certificate Preview
                </h6>
              </div>
              <div className="card-body text-center">
                <div className="border rounded p-3 bg-light">
                  <div className="mb-2">
                    <strong>PUNTLAND STATE UNIVERSITY</strong>
                  </div>
                  <div className="mb-2">Certificate of Completion</div>
                  <div className="mb-2">
                    <strong>{certificate.student_name}</strong>
                  </div>
                  <div className="mb-2">{certificate.course}</div>
                  <div className="small text-muted">
                    {new Date(certificate.issue_date).toLocaleDateString()}
                  </div>
                </div>
                <button className="btn btn-primary btn-sm mt-3" onClick={downloadCertificate}>
                  <i className="bi bi-download me-1"></i>
                  Download Full PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}