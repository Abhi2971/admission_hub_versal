import React from 'react';
import { useSidebar } from '../../context/SidebarContext';

const DashboardLayout = ({ sidebar, children }) => {
  const { sidebarWidth } = useSidebar();

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* Sidebar */}
      <div style={{
        flexShrink: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 100,
      }}>
        {sidebar}
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        minWidth: 0,
        marginLeft: sidebarWidth,
        transition: 'margin-left 0.2s ease',
      }}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
