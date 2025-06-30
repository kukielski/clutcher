import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './LessonPage.css';

const APP_KEY = process.env.REACT_APP_APP_KEY;

export default function CampaignsPage() {
  const { host, token, updateCreds } = useContext(AuthContext);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!host || !token) return;
    async function fetchAll() {
      try {
        // 1. Fetch teams
        const teamsRes = await fetch(`${host}/api/teams`, {
          headers: {
            "x-conveyour-appkey": APP_KEY,
            "x-conveyour-token": token,
          },
        });
        if (!teamsRes.ok) throw new Error("Failed to fetch teams");
        const teamsData = await teamsRes.json();
        const teams = Array.isArray(teamsData.data) ? teamsData.data : [];

        // 2. Fetch "No Team" campaigns
        const noTeamPromise = fetch(`${host}/api/campaigns?teams`, {
          headers: {
            "x-conveyour-appkey": APP_KEY,
            "x-conveyour-token": token,
          },
        })
          .then(res => res.json())
          .then(data => ({
            teamLabel: "No Team",
            teamId: null,
            campaigns: Array.isArray(data.data?.results) ? data.data.results : [],
          }));

        // 3. Fetch campaigns for each team
        const teamPromises = teams.map(team =>
          fetch(`${host}/api/campaigns?teams[]=${team.id}`, {
            headers: {
              "x-conveyour-appkey": APP_KEY,
              "x-conveyour-token": token,
            },
          })
            .then(res => res.json())
            .then(data => ({
              teamLabel: team.label,
              teamId: team.id,
              campaigns: Array.isArray(data.data?.results) ? data.data.results : [],
            }))
        );

        // 4. Wait for all
        const allCampaignsByTeam = await Promise.all([noTeamPromise, ...teamPromises]);

        // 5. Flatten for easier rendering
        const allCampaigns = allCampaignsByTeam.flatMap(({ teamLabel, teamId, campaigns }) =>
          campaigns.map(campaign => ({
            ...campaign,
            teamLabel,
            teamId,
          }))
        );

        setCampaigns(allCampaigns);
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
    document.title = "Campaigns";
  }, []);

  if (!host || !token) {
    return <div>Please reload and enter your domain and APP_TOKEN.</div>;
  }

  if (loading) return <div>Loading...</div>;
  if (error) return (
    <div>
      Error: {error}
      <button
        onClick={updateCreds}
        style={{
          background: "#2d72d9",
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
          marginTop: "1rem"
        }}
      >
        Update Domain or Token
      </button>
    </div>
  );

  // Sort and group by teamLabel
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    if (a.teamLabel === "No Team" && b.teamLabel !== "No Team") return -1;
    if (a.teamLabel !== "No Team" && b.teamLabel === "No Team") return 1;
    const teamCompare = (a.teamLabel || '').localeCompare(b.teamLabel || '');
    if (teamCompare !== 0) return teamCompare;
    return (a.name || '').localeCompare(b.name || '');
  });

  const filteredCampaigns = sortedCampaigns.filter(
    campaign =>
      (campaign.name && campaign.name.toLowerCase().includes(search.toLowerCase())) ||
      (campaign.teamLabel && campaign.teamLabel.toLowerCase().includes(search.toLowerCase()))
  );

  const campaignsByTeam = {};
  filteredCampaigns.forEach(campaign => {
    if (!campaignsByTeam[campaign.teamLabel]) {
      campaignsByTeam[campaign.teamLabel] = [];
    }
    campaignsByTeam[campaign.teamLabel].push(campaign);
  });

  return (
    <div>
      <h2>Campaigns by Team</h2>
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={updateCreds}
          style={{
            background: "#2d72d9",
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
      </div>
      <input
        type="text"
        placeholder="Search campaigns or teams..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="search-input"
        style={{ marginBottom: "1rem" }}
      />
      {Object.entries(campaignsByTeam).map(([teamLabel, campaigns]) => (
        <div key={teamLabel} style={{ marginBottom: "2rem" }}>
          <h3 style={{ marginBottom: "1rem", fontSize: "1.35rem" }}>
            {teamLabel} {campaigns[0].teamId ? `(${campaigns[0].teamId})` : ""}
          </h3>
          <table className="lesson-table">
            <thead>
              <tr>
                <th style={{ paddingRight: "10px" }}>NAME</th>
                <th style={{ paddingLeft: "10px", textAlign: "left" }}>TYPE</th>
                <th style={{ paddingLeft: "10px", textAlign: "left" }}>ID</th>
                <th style={{ paddingLeft: "10px", textAlign: "left" }}>START</th>
                <th style={{ paddingLeft: "10px", textAlign: "left" }}>END</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign, idx) => (
                <tr key={`${campaign.teamId || "no-team"}-${campaign.id || idx}`}>
                  <td style={{ paddingRight: "10px" }}>{campaign.name}</td>
                  <td style={{ paddingLeft: "10px", textAlign: "left" }}>{campaign.type}</td>
                  <td style={{ paddingLeft: "10px", textAlign: "left" }}>
                    <a
                      href={`${host}/campaigns/${campaign.id}/content`}
                      target="_blank"
                      rel="noreferrer"
                    >{campaign.id}</a>
                  </td>
                  <td style={{ paddingLeft: "10px", textAlign: "left" }}>{campaign.start_time}</td>
                  <td style={{ paddingLeft: "10px", textAlign: "left" }}>{campaign.end_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}