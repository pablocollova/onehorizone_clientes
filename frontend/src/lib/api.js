// src/lib/api.js
// Thin fetch wrapper — throws on non-2xx so callers can catch a single error type.

/** Build headers, attaching Authorization if a token is stored in localStorage. */
function buildHeaders(extra = {}) {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json", ...extra };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
}

/**
 * @param {string} path — relative path starting with "/" (proxied by Vite to http://localhost:4000)
 * @param {RequestInit} [options]
 * @returns {Promise<any>} parsed JSON body
 * @throws {Error} with message from server or HTTP status text
 */
export async function apiGet(path, options = {}) {
    const { headers: extraHeaders, ...rest } = options;
    const res = await fetch(path, {
        method: "GET",
        headers: buildHeaders(extraHeaders),
        ...rest,
    });

    if (!res.ok) {
        let message = `HTTP ${res.status}: ${res.statusText}`;
        try {
            const body = await res.json();
            if (body?.error) message = body.error;
        } catch {
            // ignore — body not JSON
        }
        throw new Error(message);
    }

    return res.json();
}

/**
 * @param {string} path
 * @param {object} body
 * @param {RequestInit} [options]
 * @returns {Promise<any>}
 */
export async function apiPost(path, body, options = {}) {
    const { headers: extraHeaders, ...rest } = options;
    const res = await fetch(path, {
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
        } catch {
            // ignore
        }
        throw new Error(message);
    }

    return res.json();
}
