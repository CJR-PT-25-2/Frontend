import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
});

api.interceptors.request.use(
  (config) => {
    // Pega o token do localStorage
    const token = localStorage.getItem("token");

    // Se o token existir, anexa ele no header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
