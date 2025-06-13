import axios from "axios";

// Create an axios instance with base URL
const API_BASE_URL = "http://localhost:5000/api/v1";

console.log("API Base URL:", API_BASE_URL);

// Create axios instance with base configuration
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", error?.response?.data || error.message);

    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");

      // Redirect to login if needed
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const AuthAPI = {
  register: (userData) => API.post("/auth/register", userData),
  login: (credentials) => API.post("/auth/login", credentials),
  logout: () => API.post("/auth/logout"),
  getMe: () => API.get("/auth/me"),
  getRoles: () => API.get("/auth/roles"),
  getOrganizations: () => API.get("/organizations"),
  updateProfile: (userData) => API.put("/auth/profile", userData),
  forgotPassword: (email) => API.post("/auth/forgotpassword", { email }),
  resetPassword: (token, password) =>
    API.put(`/auth/resetpassword/${token}`, { password }),
  updatePassword: (currentPassword, newPassword) =>
    API.put("/auth/updatepassword", { currentPassword, newPassword }),
  verifyEmail: (token) => API.get(`/auth/verifyemail/${token}`),
};

// Organizations API
export const OrganizationsAPI = {
  getAll: () => API.get("/organizations"),
  getOrganizations: () => API.get("/organizations/user"),
  getById: (id) => API.get(`/organizations/${id}`),
  create: async (data) => {
    try {
      const response = await API.post("/organizations", data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers["retry-after"] || 3600;
        throw {
          message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
          status: 429,
          retryAfter: parseInt(retryAfter, 10),
        };
      }
      throw error;
    }
  },
  update: (id, data) => API.put(`/organizations/${id}`, data),
  delete: (id) => API.delete(`/organizations/${id}`),
  getMembers: (id) => API.get(`/organizations/${id}/members`),
  addMember: (id, memberData) =>
    API.post(`/organizations/${id}/members`, memberData),
  removeMember: (id, memberId) =>
    API.delete(`/organizations/${id}/members/${memberId}`),
  updateMemberRole: (id, memberId, role) =>
    API.put(`/organizations/${id}/members/${memberId}`, { role }),
};

export default API;
