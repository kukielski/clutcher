import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import './ContentPage.css';

export default function ContentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === `/content/${path}`;

  return (
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
      </nav>
      <Outlet />
    </div>
  );
}