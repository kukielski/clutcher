import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    function getStoredOrPrompted(key, promptText) {
        let value = localStorage.getItem(key);
        if (!value) {
            value = window.prompt(promptText, "");
            if (value) localStorage.setItem(key, value);
        }
        return value;
    }

    function getStoredOrPromptedHost() {
        let host = localStorage.getItem("HOST");
        if (!host) {
            let domain = "";
            while (!domain) {
                domain = window.prompt("Enter your Conveyour domain (e.g. 'bard'):", "");
                if (domain) domain = domain.trim().toLowerCase();
            }
            host = `https://${domain}.conveyour.com`;
            localStorage.setItem("HOST", host);
        }
        return host;
    }

    const [host, setHost] = useState(() => getStoredOrPromptedHost());
    const [token, setToken] = useState(() => getStoredOrPrompted("APP_TOKEN", "Enter your API token (APP_TOKEN):"));

    const updateCreds = () => {
        localStorage.removeItem("HOST");
        localStorage.removeItem("APP_TOKEN");
        setHost(getStoredOrPromptedHost());
        setToken(getStoredOrPrompted("APP_TOKEN", "Enter your API token (APP_TOKEN):"));
    };

    return (
        <AuthContext.Provider value={{ host, token, updateCreds }}>
            {children}
        </AuthContext.Provider>
    );
}