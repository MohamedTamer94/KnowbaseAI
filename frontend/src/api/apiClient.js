// src/api/apiClient.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3002";

export async function apiFetch(url, options = {}, { authRequired = true } = {}) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    });

    // 🚨 Global auth handling
    if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login"; // hard redirect
        throw new Error("Unauthorized");
    }

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "API error");
    }

    return res;
}

/**
 * Upload helper for sending FormData (files) to the API while keeping auth handling centralized.
 * Does NOT set Content-Type so the browser can add the proper multipart boundary.
 */
export async function apiUpload(url, formData, { authRequired = true } = {}) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}${url}`, {
        method: 'POST',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
    });

    if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        throw new Error("Unauthorized");
    }

    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "API error");
    }

    return res;
}

