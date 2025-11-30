import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from 'react-hot-toast';

export default function VerifyCertificate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCert() {
      try {
        setLoading(true);
        const res = await api.get(`/admin/verify/${id}`);
        setData(res.data);
      } catch (error) {
        console.error('Verification error:', error);
        setError(error.response?.data?.message || 'Certificate not found');
        toast.error('Certificate verification failed');
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchCert();
    }
  }, [id]);

  const downloadCertificate = () => {
    if (data?.id) {
      window.open(`${api.defaults.baseURL}/admin/certificates/${data.id}/download`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-0 shadow-lg">
              <div className="card-body text-center p-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5>Verifying Certificate...</h5>
                <p className="text-muted">Please wait while we verify certificate ID: <strong>{id}</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-danger shadow-lg">
              <div className="card-body text-center p-5">
                <i className="bi bi-x-circle text-danger" style={{ fontSize: '4rem' }}></i>
                <h3 className="text-danger mt-3">Certificate Not Found</h3>
                <p className="text-muted mb-4">{error}</p>
                <p className="small text-muted">Certificate ID: <strong>{id}</strong></p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/')}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card border-success shadow-lg">
            <div className="card-header bg-success text-white text-center">
              <i className="bi bi-check-circle" style={{ fontSize: '3rem' }}></i>
              <h3 className="mt-2 mb-0">Certificate Verified</h3>
            </div>
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <h4 className="text-primary">{data.student_name}</h4>
                <p className="text-muted">Certificate ID: <strong>{data.certificate_number}</strong></p>
              </div>
              
              <div className="row">
                <div className="col-sm-6 mb-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-person-badge text-primary me-2"></i>
                    <div>
                      <small className="text-muted d-block">Student ID</small>
                      <strong>{data.student_id}</strong>
                    </div>
                  </div>
                </div>
                
                <div className="col-sm-6 mb-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-book text-primary me-2"></i>
                    <div>
                      <small className="text-muted d-block">Course</small>
                      <strong>{data.course}</strong>
                    </div>
                  </div>
                </div>
                
                <div className="col-sm-6 mb-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-calendar-check text-primary me-2"></i>
                    <div>
                      <small className="text-muted d-block">Issue Date</small>
                      <strong>{data.issue_date}</strong>
                    </div>
                  </div>
                </div>
                
                <div className="col-sm-6 mb-3">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-mortarboard text-primary me-2"></i>
                    <div>
                      <small className="text-muted d-block">Institution</small>
                      <strong>Puntland State University</strong>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="alert alert-success mt-4">
                <i className="bi bi-shield-check me-2"></i>
                <strong>Authentic Certificate:</strong> This certificate has been verified as genuine and issued by Puntland State University.
              </div>
              
              <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => navigate('/')}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Verify Another
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={downloadCertificate}
                >
                  <i className="bi bi-download me-2"></i>
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
