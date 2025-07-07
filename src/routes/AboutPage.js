import './AboutPage.css';

export default function AboutPage() {
  return <div className="about-container">
    <h1>About</h1>
    <p className='about-description'>
    This simple app returns a list of all lessons, campaigns, and automations
    from all teams for a ConveYour client. To utilize it, you'll need the client's 
    domain name and Zapier API key.</p>
  </div>;
}