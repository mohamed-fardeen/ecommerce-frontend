import axios from "axios";

// Set global defaults for ALL axios requests
axios.defaults.withCredentials = true;

const api = axios.create({
  // default configurations
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('🔍 Axios Request:', {
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials,
      baseURL: config.baseURL
    });
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log('✅ Axios Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    const { data, status } = response;
    return { data, status };
  },
  (error) => {
    console.log('❌ Axios Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default api;
