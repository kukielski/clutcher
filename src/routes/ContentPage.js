import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import './ContentPage.css';

export default function ContentPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Helper to check if a tab is active
    const isActive = (tab) => {
        return location.pathname.includes(tab);
    };

    return (
        <AuthProvider>
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
                </nav>
                <Outlet />
            </div>
        </AuthProvider>
    );
}