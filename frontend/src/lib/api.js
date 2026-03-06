// src/lib/api.js
// Thin fetch wrapper — throws on non-2xx so callers can catch a single error type.

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/** Build headers, attaching Authorization if a token is stored in localStorage. */
function buildHeaders(extra = {}) {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", ...extra };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
}

export async function apiGet(path, options = {}) {
    const { headers: extraHeaders, ...rest } = options;
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "GET",
        headers: buildHeaders(extraHeaders),
        ...rest,
    });

    if (!res.ok) {
        let message = `HTTP ${res.status}: ${res.statusText}`;
        try {
            const body = await res.json();
            if (body?.error) message = body.error;
        } catch {}
        throw new Error(message);
    }

    return res.json();
}

export async function apiPost(path, body, options = {}) {
    const { headers: extraHeaders, ...rest } = options;
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: buildHeaders(extraHeaders),
        body: JSON.stringify(body),
        ...rest,
    });

    if (!res.ok) {
        let message = `HTTP ${res.status}: ${res.statusText}`;
        try {
            const errBody = await res.json();
            if (errBody?.error) message = errBody.error;
        } catch {}
        throw new Error(message);
    }

    return res.json();
}

export async function apiPatch(path, body, options = {}) {
    const { headers: extraHeaders, ...rest } = options;
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "PATCH",
        headers: buildHeaders(extraHeaders),
        body: JSON.stringify(body),
        ...rest,
    });

    if (!res.ok) {
        let message = `HTTP ${res.status}: ${res.statusText}`;
        try {
            const errBody = await res.json();
            if (errBody?.error) message = errBody.error;
        } catch {}
        throw new Error(message);
    }

    return res.json();
}