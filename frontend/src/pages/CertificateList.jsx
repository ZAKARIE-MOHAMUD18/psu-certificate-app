import { useEffect, useState } from "react";
import api from "../utils/api";

export default function Certificates() {
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    async function fetchCerts() {
      const res = await api.get("/admin/certificates");
      setCerts(res.data);
    }
    fetchCerts();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-3">Certificates</h2>

      <table className="table table-bordered shadow-sm">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Student</th>
            <th>Course</th>
            <th>Date Issued</th>
          </tr>
        </thead>

        <tbody>
          {certs.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.student_name}</td>
              <td>{c.course}</td>
              <td>{c.date_issued}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
