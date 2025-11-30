import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function NewCertificate() {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    student_name: '',
    student_id: '',
    course_id: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/admin/courses');
      setCourses(response.data);
    } catch (error) {
      toast.error('Failed to fetch courses');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/admin/certificates', formData);
      toast.success('Certificate issued successfully!');
      navigate(`/admin/certificates/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to issue certificate');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Header */}
            <div className="mb-4">
              <h2 className="mb-1">
                <i className="bi bi-award me-2"></i>
                Issue New Certificate
              </h2>
              <p className="text-muted mb-0">Create a new certificate for a student</p>
            </div>

            {/* Form Card */}
            <div className="card shadow">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-plus-circle me-2"></i>
                  Certificate Information
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <i className="bi bi-person me-1"></i>
                        Student Name
                      </label>
                      <input
                        type="text"
                        name="student_name"
                        className="form-control"
                        value={formData.student_name}
                        onChange={handleInputChange}
                        placeholder="Enter full name"
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        <i className="bi bi-person-badge me-1"></i>
                        Student ID
                      </label>
                      <input
                        type="text"
                        name="student_id"
                        className="form-control"
                        value={formData.student_id}
                        onChange={handleInputChange}
                        placeholder="Enter student ID"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">
                      <i className="bi bi-book me-1"></i>
                      Course
                    </label>
                    <select
                      name="course_id"
                      className="form-select"
                      value={formData.course_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select a course</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                    {courses.length === 0 && (
                      <div className="form-text text-warning">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        No courses available. Please add courses first.
                      </div>
                    )}
                  </div>

                  <div className="d-flex gap-3 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate('/admin/dashboard')}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={loading || courses.length === 0}
                    >
                      {loading ? (
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
                  </div>
                </form>
              </div>
            </div>

            {/* Info Card */}
            <div className="card mt-4 border-info">
              <div className="card-body">
                <h6 className="card-title text-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Certificate Generation Process
                </h6>
                <ul className="list-unstyled mb-0">
                  <li className="mb-1">
                    <i className="bi bi-check text-success me-2"></i>
                    A unique certificate number will be generated
                  </li>
                  <li className="mb-1">
                    <i className="bi bi-check text-success me-2"></i>
                    QR code will be created for verification
                  </li>
                  <li className="mb-1">
                    <i className="bi bi-check text-success me-2"></i>
                    PDF certificate will be generated automatically
                  </li>
                  <li>
                    <i className="bi bi-check text-success me-2"></i>
                    Certificate will be available for download and verification
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}