import axios from "axios";
import { useAuthStore } from "../store/authStore";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 responses globally — but only when the user is actually authenticated.
// Do NOT redirect on login/register routes as that would cause an infinite loop.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRoute = error.config?.url?.includes("/auth/login") ||
            error.config?.url?.includes("/auth/register");

        // Do NOT redirect on public gallery PIN verification — a wrong PIN
        // returns 401 and we want the customer to stay on the PIN screen.
        const isGalleryRoute = error.config?.url?.includes("/galleries/");

        if (error.response?.status === 401 && !isAuthRoute && !isGalleryRoute) {
            useAuthStore.getState().logout();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default api;