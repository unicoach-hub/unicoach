import { Link, useNavigate } from 'react-router-dom';
import { Tooltip } from 'antd';
import { MenuOutlined, ArrowLeftOutlined, BellOutlined, GlobalOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { getFrontendUrl } from '../config';
import useNewRequestsCount from '../hooks/useNewRequestsCount';

const Header = ({ title, subtitle, extra, showBack, backUrl }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const newRequests = useNewRequestsCount();

  const name = user?.name || 'Admin';
  const initial = name.trim().charAt(0).toUpperCase() || 'A';

  return (
    <header className="nx-header">
      <div className="nx-header-left">
        <button
          type="button"
          className="nx-round-btn nx-menu-btn"
          onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))}
          aria-label="Open menu"
        >
          <MenuOutlined />
        </button>

        {(showBack || backUrl) && (
          <button
            type="button"
            className="nx-round-btn"
            onClick={() => (backUrl ? navigate(backUrl) : navigate(-1))}
            aria-label="Go back"
          >
            <ArrowLeftOutlined />
          </button>
        )}

        <div style={{ minWidth: 0 }}>
          <h1 className="nx-header-title">{title}</h1>
          {subtitle && <p className="nx-header-subtitle">{subtitle}</p>}
        </div>
      </div>

      {/* Page actions: inline on desktop, their own full-width row on phones */}
      {extra && <div className="nx-header-extra">{extra}</div>}

      <div className="nx-header-right">
        <Tooltip title={newRequests > 0 ? `${newRequests} new support request${newRequests === 1 ? '' : 's'}` : 'Support requests'}>
          <Link to="/requests" className="nx-round-btn" aria-label="Support requests">
            <BellOutlined />
            {newRequests > 0 && <span className="nx-bell-count">{newRequests > 99 ? '99+' : newRequests}</span>}
          </Link>
        </Tooltip>

        <a href={getFrontendUrl()} target="_blank" rel="noreferrer" className="nx-pill-link" title="Open the live website">
          <GlobalOutlined />
          <span>Live site</span>
        </a>

        <div className="nx-user-chip">
          <span className="nx-avatar" aria-hidden="true">{initial}</span>
          <div>
            <strong>{name}</strong>
            <span>{user?.role === 'admin' ? 'Administrator' : user?.role || 'Team'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
