// frontend/src/services/access.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const checkAIAccess = async () => {
  try {
    const token = localStorage.getItem('access_token');
    
    // If no token, user is not authenticated
    if (!token) {
      return { has_ai_access: false, ai_credits: 0 };
    }
    
    const response = await fetch(`${API_URL}/api/check-access`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // If 401, token is invalid/expired
    if (response.status === 401) {
      return { has_ai_access: false, ai_credits: 0 };
    }
    
    if (!response.ok) {
      return { has_ai_access: false, ai_credits: 0 };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking AI access:', error);
    return { has_ai_access: false, ai_credits: 0 };
  }
};

export const getSubscription = async (entityId, entityType) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/api/plans/subscriptions/${entityId}/${entityType}/active`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.subscription;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
};

export const getPlans = async (planType) => {
  try {
    const token = localStorage.getItem('access_token');
    const url = planType 
      ? `${API_URL}/api/plans/plans/${planType}`
      : `${API_URL}/api/plans/plans`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.plans || [];
  } catch (error) {
    console.error('Error fetching plans:', error);
    return [];
  }
};

export const purchaseSubscription = async (planId, entityId, entityType) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/api/plans/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        plan_id: planId,
        entity_id: entityId,
        entity_type: entityType
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to purchase subscription');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error purchasing subscription:', error);
    throw error;
  }
};
