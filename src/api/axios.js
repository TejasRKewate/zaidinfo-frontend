
// import axios from "axios";

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Automatically send token with every request
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default api;


import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request Interceptor: Har API call me token automatically bhejo
api.interceptors.request.use(
  (config) => {
    // Check all possible places where token might be stored
    let token = localStorage.getItem("token") || localStorage.getItem("accessToken");

    if (!token) {
      const userInfo = localStorage.getItem("userInfo") || localStorage.getItem("user");
      if (userInfo) {
        try {
          const parsed = JSON.parse(userInfo);
          token = parsed?.token || parsed?.accessToken;
        } catch {
          // ignore parse error
        }
      }
    }

    if (token) {
      // Remove extra quotes if stored as JSON string
      const cleanToken = token.replace(/^"(.*)"$/, "$1").trim();
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

