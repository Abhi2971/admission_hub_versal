import React, { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);

  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
    setSidebarWidth(prev => prev === 260 ? 72 : 260);
  };

  return (
    <SidebarContext.Provider value={{ collapsed, sidebarWidth, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export default SidebarContext;
