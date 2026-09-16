import React, { useEffect, useContext } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useCache } from '../context/CacheContext';
import './LessonPage.css';

export default function AutomationsPage() {
  const { host, token } = useContext(AuthContext);
  const { search = "" } = useOutletContext() || {};
  const { automations: cached, ensureLoaded } = useCache();
  const { items: automations, status, error } = cached;

  useEffect(() => {
    document.title = "Automations";
  }, []);

  useEffect(() => {
    if (!host || !token) return;
    ensureLoaded("automations");
  }, [host, token, ensureLoaded]);

  if (!host || !token) {
    return <p className="status-msg">Add your domain and API token in <Link to="/settings">Settings</Link> to load this list.</p>;
  }

  if ((status === "idle" || status === "loading") && automations.length === 0) return <p className="status-msg">Loading…</p>;

  if (error && automations.length === 0) return <p className="status-msg">Error: {error}</p>;

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
    <div className="list-page">
      {filteredAutomations.length === 0 ? (
        <p className="empty-state">No automations match your search.</p>
      ) : (
        Object.entries(automationsByTeam).map(([teamLabel, teamAutomations]) => (
          <section key={teamLabel} className="team-section">
            <h3 className="team-heading">
              {teamLabel}
              {teamAutomations[0].teamId ? (
                <span>
                  (<a
                    href={`${host}/settings/teams/${teamAutomations[0].teamId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {teamAutomations[0].teamId}
                  </a>)
                </span>
              ) : null}
              <span className="team-count">
                — {teamAutomations.length} Automation{teamAutomations.length !== 1 ? 's' : ''}
              </span>
            </h3>
            <table className="lesson-table item-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Start date</th>
                </tr>
              </thead>
              <tbody>
                {teamAutomations.map((automation, idx) => (
                  <tr key={`${automation.teamId || "no-team"}-${automation.id || idx}`}>
                    <td>{automation.name}</td>
                    <td>
                      <a
                        href={`${host}/automations/edit/${automation.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {automation.id}
                      </a>
                    </td>
                    <td>{automation.type}</td>
                    <td>{automation.start_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="item-cards">
              {teamAutomations.map((automation, idx) => (
                <article
                  key={`${automation.teamId || "no-team"}-${automation.id || idx}`}
                  className="item-card"
                >
                  <span className="item-card-title">{automation.name}</span>
                  <dl className="item-card-meta">
                    <div>
                      <dt>Type</dt>
                      <dd>{automation.type}</dd>
                    </div>
                    <div>
                      <dt>ID</dt>
                      <dd>
                        <a
                          href={`${host}/automations/edit/${automation.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {automation.id}
                        </a>
                      </dd>
                    </div>
                    <div>
                      <dt>Start</dt>
                      <dd>{automation.start_date || '—'}</dd>
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
