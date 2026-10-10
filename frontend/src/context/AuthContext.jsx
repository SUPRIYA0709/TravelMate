import { useState } from "react";
import AuthContext from "./AuthContext.js";
import { apiRequest, SESSION_KEY } from "../services/api";

function getStoredSession() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
        localStorage.removeItem(SESSION_KEY);
        return null;
    }
}

export function AuthProvider({ children }) {
    const [session, setSession] = useState(getStoredSession);

    const login = async (email, password) => {
        const data = await apiRequest("/api/auth/login", {
            method: "POST",
            auth: false,
            body: JSON.stringify({ email, password })
        });

        if (!data?.token || !data?.user) {
            throw new Error("Login response did not include a user session.");
        }

        const nextSession = { token: data.token, user: data.user };
        localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
        setSession(nextSession);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem(SESSION_KEY);
        setSession(null);
    };

    return (
        <AuthContext.Provider
            value={{ session, user: session?.user || null, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}
