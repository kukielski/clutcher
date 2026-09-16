import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [host, setHost] = useState(() => localStorage.getItem("HOST") || "");
    const [token, setToken] = useState(() => localStorage.getItem("APP_TOKEN") || "");

    const saveCredentials = (fullHost, apiToken) => {
        localStorage.setItem("HOST", fullHost);
        localStorage.setItem("APP_TOKEN", apiToken);
        setHost(fullHost);
        setToken(apiToken);
    };

    const clearCredentials = () => {
        localStorage.removeItem("HOST");
        localStorage.removeItem("APP_TOKEN");
        setHost("");
        setToken("");
    };

    return (
        <AuthContext.Provider value={{ host, token, saveCredentials, clearCredentials }}>
            {children}
        </AuthContext.Provider>
    );
}
