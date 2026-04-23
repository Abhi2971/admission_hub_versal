import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { AccessProvider } from './context/AccessContext';
import { SidebarProvider } from './context/SidebarContext';
import AppRoutes from './routes';
import './styles/index.css';

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <SubscriptionProvider>
              <AccessProvider>
                <SidebarProvider>
                  <AppRoutes />
                </SidebarProvider>
              </AccessProvider>
            </SubscriptionProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;