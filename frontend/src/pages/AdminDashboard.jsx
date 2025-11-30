import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [certificates, setCertificates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [formData, setFormData] = useState({
    student_name: '',
    student_id: '',
    course_id: ''
  });
  const [issuing, setIssuing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [certsRes, coursesRes] = await Promise.all([
        api.get('/admin/certificates'),
        api.get('/admin/courses')
      ]);
      setCertificates(certsRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    setIssuing(true);

    try {
      const response = await api.post('/admin/certificates', formData);
      toast.success('Certificate issued successfully!');
      setFormData({ student_name: '', student_id: '', course_id: '' });
      setShowIssueForm(false);
      fetchData(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to issue certificate');
    } finally {
      setIssuing(false);
    }
  };

  const downloadCertificate = (certId) => {
    window.open(`${api.defaults.baseURL}/admin/certificates/${certId}/download`, '_blank');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5>Loading Dashboard...</h5>
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
            <button className="btn btn-outline-light" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">Certificate Management</h2>
            <p className="text-muted mb-0">Manage and issue certificates</p>
          </div>
          <button 
            className="btn btn-success"
            onClick={() => setShowIssueForm(!showIssueForm)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Issue Certificate
          </button>
        </div>

        {/* Issue Certificate Form */}
        {showIssueForm && (
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-award me-2"></i>
                Issue New Certificate
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleIssue}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Student Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.student_name}
                      onChange={(e) => setFormData({...formData, student_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Student ID</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.student_id}
                      onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Course</label>
                  <select
                    className="form-select"
                    value={formData.course_id}
                    onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="d-flex gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={issuing}
                  >
                    {issuing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Issuing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Issue Certificate
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowIssueForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="mb-0">{certificates.length}</h4>
                    <p className="mb-0">Total Certificates</p>
                  </div>
                  <i className="bi bi-award" style={{ fontSize: '2rem' }}></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="mb-0">{courses.length}</h4>
                    <p className="mb-0">Available Courses</p>
                  </div>
                  <i className="bi bi-book" style={{ fontSize: '2rem' }}></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-info text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h4 className="mb-0">{certificates.filter(c => 
                      new Date(c.issue_date) > new Date(Date.now() - 30*24*60*60*1000)
                    ).length}</h4>
                    <p className="mb-0">This Month</p>
                  </div>
                  <i className="bi bi-calendar-check" style={{ fontSize: '2rem' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certificates Table */}
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-list-ul me-2"></i>
              All Certificates
            </h5>
          </div>
          <div className="card-body p-0">
            {certificates.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                <h5 className="text-muted mt-3">No certificates issued yet</h5>
                <p className="text-muted">Click "Issue Certificate" to get started</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Certificate #</th>
                      <th>Student Name</th>
                      <th>Student ID</th>
                      <th>Course</th>
                      <th>Issue Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map((cert) => (
                      <tr key={cert.id}>
                        <td>
                          <span className="badge bg-primary">{cert.certificate_number}</span>
                        </td>
                        <td className="fw-medium">{cert.student_name}</td>
                        <td>{cert.student_id}</td>
                        <td>{cert.course}</td>
                        <td>{new Date(cert.issue_date).toLocaleDateString()}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => navigate(`/admin/certificates/${cert.id}`)}
                              title="View Details"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button
                              className="btn btn-outline-success"
                              onClick={() => downloadCertificate(cert.id)}
                              title="Download PDF"
                            >
                              <i className="bi bi-download"></i>
                            </button>
                            <button
                              className="btn btn-outline-info"
                              onClick={() => navigate(`/verify/${cert.certificate_number}`)}
                              title="Verify Certificate"
                            >
                              <i className="bi bi-check-circle"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}