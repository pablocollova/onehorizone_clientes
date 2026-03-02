// src/lib/api.js
// Thin fetch wrapper — throws on non-2xx so callers can catch a single error type.

/**
 * @param {string} path — relative path starting with "/" (proxied by Vite to http://localhost:4000)
 * @param {RequestInit} [options]
 * @returns {Promise<any>} parsed JSON body
 * @throws {Error} with message from server or HTTP status text
 */
export async function apiGet(path, options = {}) {
    const res = await fetch(path, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        ...options,
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
