import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Tooltip } from 'antd';
import {
  AppstoreOutlined,
  TeamOutlined,
  CustomerServiceOutlined,
  CrownOutlined,
  BankOutlined,
  TrophyOutlined,
  ReadOutlined,
  ThunderboltOutlined,
  SettingOutlined,
  LogoutOutlined,
  SearchOutlined,
  CloseOutlined,
  RightOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { getFrontendUrl } from '../config';
import useNewRequestsCount from '../hooks/useNewRequestsCount';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [{ path: '/', label: 'Dashboard', icon: <AppstoreOutlined />, exact: true }],
  },
  {
    label: 'Students & CRM',
    items: [
      {
        id: 'crm',
        label: 'Leads & CRM',
        icon: <TeamOutlined />,
        children: [
          { path: '/leads', label: 'All Leads' },
          { path: '/crm/board', label: 'Pipeline Board' },
          { path: '/crm/pipelines', label: 'CRM Pipelines' },
          { path: '/crm/forms', label: 'Form Builder' },
          { path: '/crm/calendar', label: 'Booking Calendar' },
          { path: '/users', label: 'Users & Staff' },
        ],
      },
      { path: '/requests', label: 'Support Requests', icon: <CustomerServiceOutlined />, badge: 'requests' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { path: '/unicoach', label: 'Creators & Revenue', icon: <CrownOutlined /> },
      { path: '/universities', label: 'Universities', icon: <BankOutlined /> },
      { path: '/scholarships', label: 'Scholarships', icon: <TrophyOutlined /> },
      {
        id: 'content',
        label: 'Content',
        icon: <ReadOutlined />,
        children: [
          { path: '/blogs', label: 'Blogs & Articles' },
          { path: '/news', label: 'News & Updates' },
          { path: '/events', label: 'Events & Webinars' },
          { path: '/digest', label: 'Video Digest' },
        ],
      },
    ],
  },
  {
    label: 'Growth',
    items: [
      {
        id: 'automation',
        label: 'Automation',
        icon: <ThunderboltOutlined />,
        children: [
          { path: '/automation/email', label: 'Email Hub' },
          { path: '/automation/whatsapp', label: 'WhatsApp Cloud API' },
          { path: '/automation/workflows', label: 'Workflows' },
          { path: '/templates', label: 'Templates' },
          { path: '/bulk-messaging', label: 'Bulk Messaging' },
        ],
      },
      { path: '/settings', label: 'Settings', icon: <SettingOutlined /> },
    ],
  },
];

const isPathActive = (pathname, path, exact) =>
  exact ? pathname === path : pathname === path || pathname.startsWith(`${path}/`);

const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const newRequests = useNewRequestsCount();
  const [query, setQuery] = useState('');
  const [openGroups, setOpenGroups] = useState({ crm: true });

  // Open the group that holds the current page
  useEffect(() => {
    NAV_SECTIONS.forEach((section) =>
      section.items.forEach((item) => {
        if (item.children?.some((c) => isPathActive(location.pathname, c.path))) {
          setOpenGroups((prev) => (prev[item.id] ? prev : { ...prev, [item.id]: true }));
        }
      })
    );
  }, [location.pathname]);

  const closeOnMobile = () => {
    if (window.innerWidth <= 1024) window.dispatchEvent(new Event('toggle-sidebar'));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const q = query.trim().toLowerCase();
  const matches = (item) =>
    !q || item.label.toLowerCase().includes(q) || item.children?.some((c) => c.label.toLowerCase().includes(q));

  const withTooltip = (label, node) =>
    collapsed ? (
      <Tooltip title={label} placement="right" key={label}>
        {node}
      </Tooltip>
    ) : (
      node
    );

  const name = user?.name || 'Admin';
  const initial = name.trim().charAt(0).toUpperCase() || 'A';

  return (
    <aside className={`sidebar nx-sidebar ${collapsed ? 'sidebar--collapsed' : ''}`} aria-label="Admin navigation">
      <div className="nx-brand">
        <NavLink to="/" className="nx-brand-link" onClick={closeOnMobile} aria-label="UniCoach admin home">
          <span className="nx-mark">
            <img src="/mark-white.png" alt="" />
          </span>
          {!collapsed && (
            <span className="nx-wordmark">
              <img src="/logo-white.png" alt="UniCoach" />
              <span>Admin Console</span>
            </span>
          )}
        </NavLink>
        <button type="button" className="nx-collapse-btn" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      {!collapsed && (
        <div className="nx-search">
          <SearchOutlined className="nx-search-icon" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to…"
            aria-label="Search navigation"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
              <CloseOutlined />
            </button>
          )}
        </div>
      )}

      <nav className="nx-nav">
        {NAV_SECTIONS.map((section) => {
          const items = section.items.filter(matches);
          if (items.length === 0) return null;
          return (
            <div key={section.label}>
              <div className="nx-section">{section.label}</div>
              {items.map((item) => {
                if (item.children) {
                  const groupActive = item.children.some((c) => isPathActive(location.pathname, c.path));
                  const open = !collapsed && (openGroups[item.id] || Boolean(q));
                  const children = q ? item.children.filter((c) => c.label.toLowerCase().includes(q) || item.label.toLowerCase().includes(q)) : item.children;
                  return (
                    <div key={item.id}>
                      {withTooltip(
                        item.label,
                        <button
                          type="button"
                          className={`nx-item ${open ? 'nx-item--open' : ''} ${groupActive ? (collapsed ? 'nx-item--active' : 'nx-item--group-active') : ''}`}
                          onClick={() =>
                            collapsed
                              ? navigate(item.children[0].path)
                              : setOpenGroups((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                          }
                          aria-expanded={open}
                        >
                          <span className="nx-item-icon">{item.icon}</span>
                          {!collapsed && (
                            <>
                              <span className="nx-item-label">{item.label}</span>
                              <RightOutlined className="nx-item-chevron" />
                            </>
                          )}
                        </button>
                      )}
                      {open && (
                        <div className="nx-sub">
                          {children.map((child) => (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              onClick={closeOnMobile}
                              className={isPathActive(location.pathname, child.path) ? 'nx-sub--active' : ''}
                            >
                              {child.label}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                const active = isPathActive(location.pathname, item.path, item.exact);
                const badge = item.badge === 'requests' ? newRequests : 0;
                return withTooltip(
                  badge > 0 ? `${item.label} (${badge} new)` : item.label,
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeOnMobile}
                    className={`nx-item ${active ? 'nx-item--active' : ''}`}
                  >
                    <span className="nx-item-icon">
                      {item.icon}
                      {collapsed && badge > 0 && <span className="nx-dot" />}
                    </span>
                    {!collapsed && (
                      <>
                        <span className="nx-item-label">{item.label}</span>
                        {badge > 0 && <span className="nx-badge">{badge}</span>}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="nx-footer">
        {withTooltip(
          'Open live website',
          <a href={getFrontendUrl()} target="_blank" rel="noreferrer" className="nx-item">
            <span className="nx-item-icon">
              <GlobalOutlined />
            </span>
            {!collapsed && <span className="nx-item-label">Live website ↗</span>}
          </a>
        )}
        <div className="nx-profile">
          <span className="nx-avatar" aria-hidden="true">{initial}</span>
          {!collapsed && (
            <span className="nx-profile-text">
              <strong>{name}</strong>
              <span>{user?.email || 'Administrator'}</span>
            </span>
          )}
          {withTooltip(
            'Log out',
            <button type="button" className="nx-icon-btn" onClick={handleLogout} aria-label="Log out">
              <LogoutOutlined />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
