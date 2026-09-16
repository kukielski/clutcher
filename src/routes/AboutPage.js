import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="about-container">
      <img
        className="about-logo"
        src="/clutcher-sq-192.png"
        alt="Clutcher"
        width="72"
        height="72"
      />
      <h1>About</h1>
      <p className="about-description">
        Clutcher lists every lesson, campaign, and automation across all teams
        for a ConveYour client. Open Settings to connect with the client domain
        and Zapier API token, then browse Content.
      </p>
    </div>
  );
}
