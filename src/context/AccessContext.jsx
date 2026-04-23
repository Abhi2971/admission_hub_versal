// frontend/src/context/AccessContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkAIAccess } from '../services/access';

const AccessContext = createContext();

export const useAccess = () => {
  const context = useContext(AccessContext);
  if (!context) {
    return { has_ai_access: false, ai_credits: 0, loading: false };
  }
  return context;
};

export const AccessProvider = ({ children }) => {
  const [accessData, setAccessData] = useState({
    has_ai_access: false,
    ai_credits: 0,
    subscription: null,
    role: null,
    loading: true
  });

  const refreshAccess = async () => {
    // Check if user has a token before making API call
    const token = localStorage.getItem('access_token');
    if (!token) {
      setAccessData({ has_ai_access: false, ai_credits: 0, subscription: null, role: null, loading: false });
      return;
    }
    
    try {
      const data = await checkAIAccess();
      setAccessData({ ...data, loading: false });
    } catch (error) {
      console.error('Error refreshing access:', error);
      setAccessData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    refreshAccess();
  }, []);

  return (
    <AccessContext.Provider value={{ ...accessData, refreshAccess }}>
      {children}
    </AccessContext.Provider>
  );
};
