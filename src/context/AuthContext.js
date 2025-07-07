import React, { createContext, useState, useEffect, useRef } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [host, setHost] = useState(() => localStorage.getItem("HOST") || "");
    const [token, setToken] = useState(() => localStorage.getItem("APP_TOKEN") || "");
    const [showForm, setShowForm] = useState(!host || !token);
    const [domainInput, setDomainInput] = useState("");
    const [tokenInput, setTokenInput] = useState("");
    const formRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const domain = domainInput.trim().toLowerCase();
        const domainRegex = /^[a-z0-9-]+$/;
        if (!domainRegex.test(domain)) {
            alert("Invalid domain. Use only letters, numbers, and hyphens.");
            return;
        }
        const fullHost = `https://${domain}.conveyour.com`;
        localStorage.setItem("HOST", fullHost);
        localStorage.setItem("APP_TOKEN", tokenInput);
        setHost(fullHost);
        setToken(tokenInput);
        setShowForm(false);
    };

    const updateCreds = () => {
        setDomainInput("");
        setTokenInput("");
        setShowForm(true);
    };

    // Cancel handler: just hide the form, keep previous values
    const handleCancel = (e) => {
        e && e.preventDefault();
        setShowForm(false);
    };

    // ESC key closes the form
    useEffect(() => {
        if (!showForm) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setShowForm(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showForm]);

    if (showForm) {
        return (
            <div style={{
                position: "fixed",
                top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000
            }}>
                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    style={{
                        background: "#fff",
                        padding: "2rem",
                        borderRadius: "8px",
                        boxShadow: "0 2px 16px rgba(0,0,0,0.15)",
                        minWidth: "320px",
                        position: "relative"
                    }}
                >
                    {/* "X" close button */}
                    <button
                        type="button"
                        onClick={handleCancel}
                        aria-label="Close"
                        style={{
                            position: "absolute",
                            top: "12px",
                            right: "16px",
                            background: "transparent",
                            border: "none",
                            fontSize: "1.5rem",
                            cursor: "pointer",
                            color: "#888"
                        }}
                    >
                        ×
                    </button>
                    <h2>Enter Your Credentials</h2>
                    <div style={{ marginBottom: "1rem" }}>
                        <label>
                            Domain (e.g. <b>bard</b>):
                            <input
                                type="text"
                                value={domainInput}
                                onChange={e => setDomainInput(e.target.value)}
                                style={{ width: "100%", marginTop: "0.5rem", height: "1.5rem", fontSize: "1.35rem" }}
                                autoFocus
                                required
                                pattern="[a-z0-9-]+"
                                title="Only letters, numbers, and hyphens"
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                        <label>
                            API Token:
                            <input
                                type="password"
                                value={tokenInput}
                                onChange={e => setTokenInput(e.target.value)}
                                style={{ width: "100%", marginTop: "0.5rem", height: "1.5rem", fontSize: "1.35rem" }}
                                required
                            />
                        </label>
                    </div>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                        <button
                            type="submit"
                            style={{
                                background: "#1bc0af",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                padding: "8px 24px",
                                fontSize: "1rem",
                                fontWeight: 500,
                                cursor: "pointer"
                            }}
                        >
                            Save
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            style={{
                                background: "#eee",
                                color: "#333",
                                border: "none",
                                borderRadius: "4px",
                                padding: "8px 24px",
                                fontSize: "1rem",
                                fontWeight: 500,
                                cursor: "pointer"
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ host, token, updateCreds }}>
            {children}
        </AuthContext.Provider>
    );
}