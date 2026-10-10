import React from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { canOpenPath, firstAllowedPath } from '../utils/permissions';

const NoAccess = ({ home }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12, textAlign: 'center', padding: 24 }}>
    <span style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--ux-brand-soft, #fdeee7)', color: '#DE5C2B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
      <LockOutlined />
    </span>
    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>You don't have access to this page</h2>
    <p style={{ margin: 0, color: '#5f5e58', maxWidth: 380 }}>Your role doesn't include this section. Ask the admin if you need it.</p>
    {home && <Link to={home} style={{ fontWeight: 600 }}>Go to your pages →</Link>}
  </div>
);

// Shows the page only if the signed-in account's role allows it (rendered inside the admin layout)
export const PageGuard = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!canOpenPath(user, location.pathname)) {
    const home = firstAllowedPath(user);
    // Staff without the dashboard start on their first allowed page
    if (location.pathname === '/' && home) return <Navigate to={home} replace />;
    return <NoAccess home={home && home !== location.pathname ? home : null} />;
  }
  return children;
};

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="protected-loading">
        <div className="protected-spinner" />
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
