import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";

const APP_KEY = process.env.REACT_APP_APP_KEY;

const emptyResource = { items: [], status: "idle", error: null };

const CacheContext = createContext(null);

function headers(token) {
    return {
        "x-conveyour-appkey": APP_KEY,
        "x-conveyour-token": token,
    };
}

export function CacheProvider({ children }) {
    const { host, token } = useContext(AuthContext);
    const [lessons, setLessons] = useState(emptyResource);
    const [campaigns, setCampaigns] = useState(emptyResource);
    const [automations, setAutomations] = useState(emptyResource);
    const teamsRef = useRef({ key: "", data: null });
    const generation = useRef({ lessons: 0, campaigns: 0, automations: 0 });
    const credsKey = `${host}|${token}`;
    const credsRef = useRef(credsKey);

    const reset = useCallback(() => {
        generation.current = {
            lessons: generation.current.lessons + 1,
            campaigns: generation.current.campaigns + 1,
            automations: generation.current.automations + 1,
        };
        teamsRef.current = { key: "", data: null };
        setLessons(emptyResource);
        setCampaigns(emptyResource);
        setAutomations(emptyResource);
    }, []);

    useEffect(() => {
        if (credsRef.current === credsKey) return;
        credsRef.current = credsKey;
        reset();
    }, [credsKey, reset]);

    const fetchTeams = useCallback(async (force) => {
        const key = `${host}|${token}`;
        if (!force && teamsRef.current.data && teamsRef.current.key === key) {
            return teamsRef.current.data;
        }
        const res = await fetch(`${host}/api/teams`, { headers: headers(token) });
        if (!res.ok) throw new Error("Failed to fetch teams");
        const data = await res.json();
        const teams = Array.isArray(data.data) ? data.data : [];
        teamsRef.current = { key, data: teams };
        return teams;
    }, [host, token]);

    const loadLessons = useCallback(async (force) => {
        if (!host || !token) return;
        const id = ++generation.current.lessons;
        setLessons((prev) => ({
            ...prev,
            status: "loading",
            error: null,
        }));
        try {
            const teams = await fetchTeams(force);
            const lessonFetches = [
                fetch(`${host}/api/lessons`, { headers: headers(token) })
                    .then((res) => res.json())
                    .then((data) => ({
                        teamLabel: "No Team",
                        teamId: null,
                        lessons: Array.isArray(data.data) ? data.data : [],
                    })),
                ...teams.map((team) =>
                    fetch(`${host}/api/lessons?teams=${team.id}`, { headers: headers(token) })
                        .then((res) => res.json())
                        .then((data) => ({
                            teamLabel: team.label,
                            teamId: team.id,
                            lessons: Array.isArray(data.data) ? data.data : [],
                        }))
                ),
            ];
            const allLessonsByTeam = await Promise.all(lessonFetches);
            const items = allLessonsByTeam.flatMap(({ teamLabel, teamId, lessons: teamLessons }) =>
                teamLessons.map((lesson) => ({ ...lesson, teamLabel, teamId }))
            );
            if (id !== generation.current.lessons) return;
            setLessons({ items, status: "loaded", error: null });
        } catch (err) {
            if (id !== generation.current.lessons) return;
            setLessons((prev) => ({
                ...prev,
                status: "error",
                error: err.message || "Failed to fetch lessons",
            }));
        }
    }, [fetchTeams, host, token]);

    const loadCampaigns = useCallback(async (force) => {
        if (!host || !token) return;
        const id = ++generation.current.campaigns;
        setCampaigns((prev) => ({
            ...prev,
            status: "loading",
            error: null,
        }));
        try {
            const teams = await fetchTeams(force);
            const noTeamPromise = fetch(`${host}/api/campaigns?teams`, { headers: headers(token) })
                .then((res) => res.json())
                .then((data) => ({
                    teamLabel: "No Team",
                    teamId: null,
                    campaigns: Array.isArray(data.data?.results) ? data.data.results : [],
                }));
            const teamPromises = teams.map((team) =>
                fetch(`${host}/api/campaigns?teams[]=${team.id}`, { headers: headers(token) })
                    .then((res) => res.json())
                    .then((data) => ({
                        teamLabel: team.label,
                        teamId: team.id,
                        campaigns: Array.isArray(data.data?.results) ? data.data.results : [],
                    }))
            );
            const allCampaignsByTeam = await Promise.all([noTeamPromise, ...teamPromises]);
            const items = allCampaignsByTeam.flatMap(({ teamLabel, teamId, campaigns: teamCampaigns }) =>
                teamCampaigns.map((campaign) => ({ ...campaign, teamLabel, teamId }))
            );
            if (id !== generation.current.campaigns) return;
            setCampaigns({ items, status: "loaded", error: null });
        } catch (err) {
            if (id !== generation.current.campaigns) return;
            setCampaigns((prev) => ({
                ...prev,
                status: "error",
                error: err.message || "Failed to fetch campaigns",
            }));
        }
    }, [fetchTeams, host, token]);

    const loadAutomations = useCallback(async (force) => {
        if (!host || !token) return;
        const id = ++generation.current.automations;
        setAutomations((prev) => ({
            ...prev,
            status: "loading",
            error: null,
        }));
        try {
            const campaignsRes = await fetch(`${host}/api/campaigns`, { headers: headers(token) });
            if (!campaignsRes.ok) throw new Error("Failed to fetch campaigns");
            const campaignsData = await campaignsRes.json();
            const campaignList = Array.isArray(campaignsData.data?.results) ? campaignsData.data.results : [];
            const simpleCampaign = campaignList.find((c) => c.type === "simple");
            if (!simpleCampaign) throw new Error("No campaign with type 'simple' found.");
            const defaultCampaign = simpleCampaign.id;

            const teams = await fetchTeams(force);
            const noTeamPromise = fetch(`${host}/api/triggers?campaign=${defaultCampaign}`, { headers: headers(token) })
                .then((res) => res.json())
                .then((data) => ({
                    teamLabel: "No Team",
                    teamId: null,
                    automations: Array.isArray(data.data?.results) ? data.data.results : [],
                }));
            const teamPromises = teams.map((team) =>
                fetch(`${host}/api/triggers?campaign=${defaultCampaign}&teams[]=${team.id}`, { headers: headers(token) })
                    .then((res) => res.json())
                    .then((data) => ({
                        teamLabel: team.label,
                        teamId: team.id,
                        automations: Array.isArray(data.data?.results) ? data.data.results : [],
                    }))
            );
            const allAutomationsByTeam = await Promise.all([noTeamPromise, ...teamPromises]);
            const items = allAutomationsByTeam.flatMap(({ teamLabel, teamId, automations: teamAutomations }) =>
                teamAutomations.map((automation) => ({ ...automation, teamLabel, teamId }))
            );
            if (id !== generation.current.automations) return;
            setAutomations({ items, status: "loaded", error: null });
        } catch (err) {
            if (id !== generation.current.automations) return;
            setAutomations((prev) => ({
                ...prev,
                status: "error",
                error: err.message || "Failed to fetch automations",
            }));
        }
    }, [fetchTeams, host, token]);

    const loaders = useRef({ lessons: loadLessons, campaigns: loadCampaigns, automations: loadAutomations });
    loaders.current = { lessons: loadLessons, campaigns: loadCampaigns, automations: loadAutomations };

    const snapshots = useRef({ lessons, campaigns, automations });
    snapshots.current = { lessons, campaigns, automations };

    const ensureLoaded = useCallback((resource) => {
        const current = snapshots.current[resource];
        if (!current || current.status === "loaded" || current.status === "loading") return;
        loaders.current[resource](false);
    }, []);

    const refresh = useCallback((resource) => {
        if (!loaders.current[resource]) return;
        loaders.current[resource](true);
    }, []);

    return (
        <CacheContext.Provider
            value={{ lessons, campaigns, automations, ensureLoaded, refresh }}
        >
            {children}
        </CacheContext.Provider>
    );
}

export function useCache() {
    const value = useContext(CacheContext);
    if (!value) {
        throw new Error("useCache must be used within CacheProvider");
    }
    return value;
}
