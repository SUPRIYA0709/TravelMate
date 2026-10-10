const API_BASE = "http://localhost:5000";
const SESSION_KEY = "travelmate-session";

function readSession() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
        return null;
    }
}

export async function apiRequest(path, options = {}) {
    const { auth = true, headers = {}, ...requestOptions } = options;
    const requestHeaders = new Headers(headers);
    const session = readSession();

    if (requestOptions.body && !requestHeaders.has("Content-Type")) {
        requestHeaders.set("Content-Type", "application/json");
    }

    if (auth && session?.token) {
        requestHeaders.set("Authorization", `Bearer ${session.token}`);
    }

    let response;
    try {
        response = await fetch(`${API_BASE}${path}`, {
            ...requestOptions,
            headers: requestHeaders
        });
    } catch {
        throw new Error("Cannot connect to TravelMate server.");
    }

    const contentType = response.headers.get("content-type") || "";
    let data = null;

    if (contentType.includes("application/json")) {
        try {
            data = await response.json();
        } catch {
            throw new Error("TravelMate server returned invalid JSON.");
        }
    } else {
        const text = await response.text();
        data = text ? { message: `Request failed (${response.status}).` } : null;
    }

    if (!response.ok) {
        throw new Error(data?.message || `Request failed (${response.status}).`);
    }

    return data;
}

export { SESSION_KEY };