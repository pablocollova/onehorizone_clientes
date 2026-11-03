// src/lib/api.js
// Thin fetch wrapper — throws on non-2xx so callers can catch a single error type.

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export async function apiUploadDocument(file, metadata) {
    const params = new URLSearchParams(Object.entries(metadata).filter(([, value]) => value !== undefined && value !== null && value !== ''));
    const res = await fetch(`${API_BASE_URL}/api/documents/upload?${params}`, {
        method: 'POST', headers: buildHeaders({ 'Content-Type': 'application/octet-stream' }), body: file,
    });
    if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error(body.error || 'No se pudo cargar el archivo.'); }
    return res.json();
}

export async function apiDownloadDocument(id, name) {
    const res = await fetch(`${API_BASE_URL}/api/documents/${encodeURIComponent(id)}/download`, { headers: buildHeaders(), cache: 'no-store' });
    if (!res.ok) { const body = await res.json().catch(() => ({})); throw new Error(body.error || 'No se pudo descargar el archivo.'); }
    const url = URL.createObjectURL(await res.blob());
    const link = document.createElement('a');
    link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove();
    // Give the browser time to start reading the object URL.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

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
        } catch { /* response body was not JSON */ }
        const error = new Error(message);
        error.status = res.status;
        throw error;
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
        } catch { /* response body was not JSON */ }
        const error = new Error(message);
        error.status = res.status;
        throw error;
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
        } catch { /* response body was not JSON */ }
        throw new Error(message);
    }

    return res.json();
}
