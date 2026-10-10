import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { PageGuard } from '../components/ProtectedRoute';

const AdminLayout = () => {
  // Collapse by default on mobile/tablet devices & split-screen (< 1024px)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(typeof window !== 'undefined' ? window.innerWidth <= 1024 : false);
  const location = useLocation();

  useEffect(() => {
    const handleToggle = () => setSidebarCollapsed(prev => !prev);
    window.addEventListener('toggle-sidebar', handleToggle);

    // Auto-collapse sidebar on mobile/tablet when route changes
    if (window.innerWidth <= 1024) {
      setSidebarCollapsed(true);
    }

    const handleResize = () => {
      if (window.innerWidth > 1024) {
        // Keep expanded on desktop by default
        setSidebarCollapsed(false);
      } else {
        // Collapse/hide on tablet & mobile by default
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('toggle-sidebar', handleToggle);
      window.removeEventListener('resize', handleResize);
    };
  }, [location]);

  return (
    <div className={`admin-layout ${sidebarCollapsed ? 'admin-layout--collapsed' : ''}`}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      {/* Mobile sidebar Backdrop overlay */}
      {!sidebarCollapsed && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarCollapsed(true)} 
        />
      )}
      
      <main className="admin-main">
        <PageGuard>
          <Outlet />
        </PageGuard>
      </main>
    </div>
  );
};

export default AdminLayout;
