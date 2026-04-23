import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSubscriptionStatus } from '../services/subscription';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'college_admin') {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const response = await getSubscriptionStatus();
      setSubscription(response.data);
    } catch (err) {
      console.error('Failed to fetch subscription', err);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    setLoading(true);
    fetchSubscription();
  };

  // Correctly determine if there is an active subscription
  const hasActive = subscription && subscription.status === 'active';

  const value = {
    subscription,
    loading,
    refresh,
    hasActive,
    plan: subscription?.plan,
    usage: subscription?.usage,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};