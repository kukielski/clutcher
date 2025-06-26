import React, { useEffect, useState } from 'react';
import './LessonPage.css';

const HOST = process.env.REACT_APP_HOST;
const APP_KEY = process.env.REACT_APP_APP_KEY;
const APP_TOKEN = process.env.REACT_APP_APP_TOKEN;

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchAll() {
      try {
        const teamsRes = await fetch(`${HOST}/api/teams`, {
          headers: {
            "x-conveyour-appkey": APP_KEY,
            "x-conveyour-token": APP_TOKEN,
          },
        });
        if (!teamsRes.ok) throw new Error("Failed to fetch teams");
        const teamsData = await teamsRes.json();
        const teams = Array.isArray(teamsData.data) ? teamsData.data : [];

        const campaignFetches = [
          // No Team campaigns
          fetch(`${HOST}/api/campaigns?teams`, {
            headers: {
              "x-conveyour-appkey": APP_KEY,
              "x-conveyour-token": APP_TOKEN,
            },
          })
            .then(res => res.json())
            .then(data => ({
              teamLabel: "No Team",
              teamId: null,
              campaigns: Array.isArray(data.data?.results) ? data.data.results : [],
            })),
          // Per-team campaigns
          ...teams.map(team =>
            fetch(`${HOST}/api/campaigns?teams[]=${team.id}`, {
              headers: {
                "x-conveyour-appkey": APP_KEY,
                "x-conveyour-token": APP_TOKEN,
              },
            })
              .then(res => res.json())
              .then(data => ({
                teamLabel: team.label,
                teamId: team.id,
                campaigns: Array.isArray(data.data?.results) ? data.data.results : [],
              }))
          ),
        ];

        const allCampaignsByTeam = await Promise.all(campaignFetches);

        // Flatten for easier rendering
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
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Sort and group by teamLabel
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    if (a.teamLabel === "No Team" && b.teamLabel !== "No Team") return -1;
    if (a.teamLabel !== "No Team" && b.teamLabel === "No Team") return 1;
    const teamCompare = (a.teamLabel || '').localeCompare(b.teamLabel || '');
    if (teamCompare !== 0) return teamCompare;
    return (a.name || '').localeCompare(b.name || '');
  });

  const filteredCampaigns = campaigns.filter(
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
                  <td style={{ paddingLeft: "10px", textAlign: "left" }}>{campaign.id}</td>
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