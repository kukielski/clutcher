import React, { useContext, useEffect, useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useCache } from "../context/CacheContext";
import SearchBar from "../components/SearchBar";
import RefreshButton from "../components/RefreshButton";
import './ContentPage.css';

function resourceFromPath(pathname) {
    if (pathname.includes("/campaigns")) return "campaigns";
    if (pathname.includes("/automations")) return "automations";
    if (/\/content\/lessons\/?$/.test(pathname)) return "lessons";
    return null;
}

function ContentNav() {
    const location = useLocation();
    const { host, token } = useContext(AuthContext);
    const { lessons, campaigns, automations, refresh } = useCache();
    const [search, setSearch] = useState("");
    const resource = resourceFromPath(location.pathname);
    const showSearch = Boolean(resource);
    const resourceState = resource === "campaigns"
        ? campaigns
        : resource === "automations"
            ? automations
            : lessons;

    useEffect(() => {
        setSearch("");
    }, [location.pathname]);

    return (
        <div className="contents-container">
            <div className="content-toolbar">
                <nav className="tab-nav" aria-label="Content type">
                    <NavLink
                        to="/content/lessons"
                        className={({ isActive }) => `tab-btn${isActive ? ' active' : ''}`}
                    >
                        Lessons
                    </NavLink>
                    <NavLink
                        to="/content/campaigns"
                        className={({ isActive }) => `tab-btn${isActive ? ' active' : ''}`}
                        end
                    >
                        Campaigns
                    </NavLink>
                    <NavLink
                        to="/content/automations"
                        className={({ isActive }) => `tab-btn${isActive ? ' active' : ''}`}
                        end
                    >
                        Automations
                    </NavLink>
                </nav>
                {showSearch && (
                    <div className="toolbar-actions">
                        <SearchBar key={location.pathname} value={search} onChange={setSearch} />
                        <RefreshButton
                            onClick={() => refresh(resource)}
                            loading={resourceState.status === "loading"}
                            disabled={!host || !token}
                        />
                    </div>
                )}
            </div>
            <Outlet context={{ search }} />
        </div>
    );
}

export default function ContentPage() {
    return <ContentNav />;
}
