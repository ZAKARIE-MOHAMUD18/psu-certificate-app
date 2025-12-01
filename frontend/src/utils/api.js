import axios from "axios";

// ✅ Auto-switch base URL between local and deployed backend
const api = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5000/" // Local Flask backend
      : "https://psu-certificate-app-6.onrender.com/", // Render backend
  withCredentials: true, // Important if backend uses JWT cookies
});

// ✅ Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Optional: ensure CORS preflight passes cleanly
  config.headers["Content-Type"] = "application/json";
  return config;
});

// ✅ Handle 401 (unauthorized) globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export default api;
