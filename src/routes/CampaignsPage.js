import React, { useEffect, useContext } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useCache } from '../context/CacheContext';
import './LessonPage.css';

export default function CampaignsPage() {
  const { host, token } = useContext(AuthContext);
  const { search = "" } = useOutletContext() || {};
  const { campaigns: cached, ensureLoaded } = useCache();
  const { items: campaigns, status, error } = cached;

  useEffect(() => {
    document.title = "Campaigns";
  }, []);

  useEffect(() => {
    if (!host || !token) return;
    ensureLoaded("campaigns");
  }, [host, token, ensureLoaded]);

  if (!host || !token) {
    return <p className="status-msg">Add your domain and API token in <Link to="/settings">Settings</Link> to load this list.</p>;
  }

  if ((status === "idle" || status === "loading") && campaigns.length === 0) return <p className="status-msg">Loading…</p>;

  if (error && campaigns.length === 0) return <p className="status-msg">Error: {error}</p>;

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
      (campaign.teamLabel && campaign.teamLabel.toLowerCase().includes(search.toLowerCase())) ||
      (campaign.id && campaign.id.toString().toLowerCase().includes(search.toLowerCase()))
  );

  const campaignsByTeam = {};
  filteredCampaigns.forEach(campaign => {
    if (!campaignsByTeam[campaign.teamLabel]) {
      campaignsByTeam[campaign.teamLabel] = [];
    }
    campaignsByTeam[campaign.teamLabel].push(campaign);
  });

  return (
    <div className="list-page">
      {filteredCampaigns.length === 0 ? (
        <p className="empty-state">No campaigns match your search.</p>
      ) : (
        Object.entries(campaignsByTeam).map(([teamLabel, teamCampaigns]) => (
          <section key={teamLabel} className="team-section">
            <h3 className="team-heading">
              {teamLabel}
              {teamCampaigns[0].teamId ? (
                <span>
                  (<a
                    href={`${host}/settings/teams/${teamCampaigns[0].teamId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {teamCampaigns[0].teamId}
                  </a>)
                </span>
              ) : null}
              <span className="team-count">
                — {teamCampaigns.length} Campaign{teamCampaigns.length !== 1 ? 's' : ''}
              </span>
            </h3>
            <table className="lesson-table item-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>ID</th>
                  <th>Start</th>
                  <th>End</th>
                </tr>
              </thead>
              <tbody>
                {teamCampaigns.map((campaign, idx) => (
                  <tr key={`${campaign.teamId || "no-team"}-${campaign.id || idx}`}>
                    <td>{campaign.name}</td>
                    <td>{campaign.type}</td>
                    <td>
                      <a
                        href={`${host}/campaigns/${campaign.id}/content`}
                        target="_blank"
                        rel="noreferrer"
                      >{campaign.id}</a>
                    </td>
                    <td>{campaign.start_time}</td>
                    <td>{campaign.end_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="item-cards">
              {teamCampaigns.map((campaign, idx) => (
                <article
                  key={`${campaign.teamId || "no-team"}-${campaign.id || idx}`}
                  className="item-card"
                >
                  <span className="item-card-title">{campaign.name}</span>
                  <dl className="item-card-meta">
                    <div>
                      <dt>Type</dt>
                      <dd>{campaign.type}</dd>
                    </div>
                    <div>
                      <dt>ID</dt>
                      <dd>
                        <a
                          href={`${host}/campaigns/${campaign.id}/content`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {campaign.id}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt>Start</dt>
                      <dd>{campaign.start_time || '—'}</dd>
                    </div>
                    <div>
                      <dt>End</dt>
                      <dd>{campaign.end_time || '—'}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
