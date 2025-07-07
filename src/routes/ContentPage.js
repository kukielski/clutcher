import React, { useContext } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, AuthContext } from "../context/AuthContext";
import './ContentPage.css';

function ContentNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = (tab) => location.pathname.includes(tab);
    const { updateCreds } = useContext(AuthContext);

    return (
        <div className="contents-container">
            <nav className="tab-nav">
                <button
                    type="button"
                    onClick={() => navigate('lessons')}
                    className={`tab-btn${isActive('lessons') ? ' active' : ''}`}
                >
                    Lessons
                </button>
                <button
                    type="button"
                    onClick={() => navigate('campaigns')}
                    className={`tab-btn${isActive('campaigns') ? ' active' : ''}`}
                >
                    Campaigns
                </button>
                <button
                    type="button"
                    onClick={() => navigate('automations')}
                    className={`tab-btn${isActive('automations') ? ' active' : ''}`}
                >
                    Automations
                </button>
                <button
                    onClick={updateCreds}
                    style={{
                        background: "#1bc0af",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 16px",
                        fontSize: "1rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        height: "32px",
                        lineHeight: "24px",
                        minWidth: "unset",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                        display: "inline-block",
                    }}
                >
                    Update Domain or Token
                </button>
            </nav>
            
            <Outlet />
        </div>
    );
}

export default function ContentPage() {
    return (
        <AuthProvider>
            <ContentNav />
        </AuthProvider>
    );
}