import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './LessonPage.css';

const APP_KEY = process.env.REACT_APP_APP_KEY;

export default function AutomationsPage() {
  const { host, token } = useContext(AuthContext);
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!host || !token) return;
    async function fetchAll() {
      try {
        // 1. Fetch campaigns and find the "simple" campaign
        const campaignsRes = await fetch(`${host}/api/campaigns`, {
          headers: {
            "x-conveyour-appkey": APP_KEY,
            "x-conveyour-token": token,
          },
        });
        if (!campaignsRes.ok) throw new Error("Failed to fetch campaigns");
        const campaignsData = await campaignsRes.json();
        const campaigns = Array.isArray(campaignsData.data?.results) ? campaignsData.data.results : [];
        const simpleCampaign = campaigns.find(c => c.type === "simple");
        if (!simpleCampaign) throw new Error("No campaign with type 'simple' found.");
        const defaultCampaign = simpleCampaign.id;

        // 2. Fetch teams
        const teamsRes = await fetch(`${host}/api/teams`, {
          headers: {
            "x-conveyour-appkey": APP_KEY,
            "x-conveyour-token": token,
          },
        });
        if (!teamsRes.ok) throw new Error("Failed to fetch teams");
        const teamsData = await teamsRes.json();
        const teams = Array.isArray(teamsData.data) ? teamsData.data : [];

        // 3. Fetch "No Team" automations
        const noTeamPromise = fetch(`${host}/api/triggers?campaign=${defaultCampaign}`, {
          headers: {
            "x-conveyour-appkey": APP_KEY,
            "x-conveyour-token": token,
          },
        })
          .then(res => res.json())
          .then(data => ({
            teamLabel: "No Team",
            teamId: null,
            automations: Array.isArray(data.data?.results) ? data.data.results : [],
          }));

        // 4. Fetch automations for each team
        const teamPromises = teams.map(team =>
          fetch(`${host}/api/triggers?campaign=${defaultCampaign}&teams[]=${team.id}`, {
            headers: {
              "x-conveyour-appkey": APP_KEY,
              "x-conveyour-token": token,
            },
          })
            .then(res => res.json())
            .then(data => ({
              teamLabel: team.label,
              teamId: team.id,
              automations: Array.isArray(data.data?.results) ? data.data.results : [],
            }))
        );

        // 5. Wait for all
        const allAutomationsByTeam = await Promise.all([noTeamPromise, ...teamPromises]);

        // 6. Flatten for easier rendering
        const allAutomations = allAutomationsByTeam.flatMap(({ teamLabel, teamId, automations }) =>
          automations.map(automation => ({
            ...automation,
            teamLabel,
            teamId,
          }))
        );

        setAutomations(allAutomations);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchAll();
  }, [host, token]);

  // Set the browser tab title
  useEffect(() => {
    document.title = "Automations";
  }, []);

  if (!host || !token) {
    return <div>Please reload and enter your domain and APP_TOKEN.</div>;
  }

  if (loading) return <div style={{ margin: "1rem" }}>Loading...</div>;

  // Sort and group by teamLabel
  const sortedAutomations = [...automations].sort((a, b) => {
    if (a.teamLabel === "No Team" && b.teamLabel !== "No Team") return -1;
    if (a.teamLabel !== "No Team" && b.teamLabel === "No Team") return 1;
    const teamCompare = (a.teamLabel || '').localeCompare(b.teamLabel || '');
    if (teamCompare !== 0) return teamCompare;
    return (a.name || '').localeCompare(b.name || '');
  });

  const filteredAutomations = sortedAutomations.filter(
    automation =>
      (automation.name && automation.name.toLowerCase().includes(search.toLowerCase())) ||
      (automation.teamLabel && automation.teamLabel.toLowerCase().includes(search.toLowerCase())) ||
      (automation.id && automation.id.toString().toLowerCase().includes(search.toLowerCase()))
  );

  const automationsByTeam = {};
  filteredAutomations.forEach(automation => {
    if (!automationsByTeam[automation.teamLabel]) {
      automationsByTeam[automation.teamLabel] = [];
    }
    automationsByTeam[automation.teamLabel].push(automation);
  });

  return (
    <div style={{ marginTop: "1rem" }}>
      <input
        type="text"
        placeholder="Search name, team, or ID..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="search-input"
      />
      {Object.entries(automationsByTeam).map(([teamLabel, automations]) => (
        <div key={teamLabel} style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "1.35rem" }}>
            {teamLabel} {automations[0].teamId ? `(${automations[0].teamId})` : ""}
          </h3>
          <table className="lesson-table">
            <thead>
              <tr>
                <th style={{ paddingRight: "10px" }}>NAME</th>
                <th style={{ paddingLeft: "10px", textAlign: "left" }}>ID</th>
                <th style={{ paddingLeft: "10px", textAlign: "left" }}>TYPE</th>
                <th style={{ paddingLeft: "10px", textAlign: "left" }}>START DATE</th>
              </tr>
            </thead>
            <tbody>
              {automations.map((automation, idx) => (
                <tr key={`${automation.teamId || "no-team"}-${automation.id || idx}`}>
                  <td style={{ paddingRight: "10px" }}>{automation.name}</td>
                  <td style={{ paddingLeft: "10px", textAlign: "left" }}><a href={`${host}/automations/edit/${automation.id}`} target="_blank" rel="noopener noreferrer">{automation.id}</a></td>
                  <td style={{ paddingLeft: "10px", textAlign: "left" }}>{automation.type}</td>
                  <td style={{ paddingLeft: "10px", textAlign: "left" }}>{automation.start_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      </div>
  );
}