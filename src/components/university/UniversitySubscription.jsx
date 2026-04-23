import React, { useState, useEffect, useCallback } from 'react';

const UniversitySubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchSubscription = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/university-admin/subscription`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const fetchPlans = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/superadmin/plans/college`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchSubscription();
    fetchPlans();
  }, [fetchSubscription, fetchPlans]);

  const getPlanColor = (planName) => {
    const colors = {
      'Starter': '#10B981',
      'Growth': '#3B82F6',
      'Enterprise': '#F59E0B',
      'Ultimate': '#7C3AED'
    };
    return colors[planName] || '#6B7280';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysRemaining = () => {
    if (!subscription?.end_date) return 0;
    const end = new Date(subscription.end_date);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '32px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1F2937',
      margin: 0
    },
    subtitle: {
      fontSize: '14px',
      color: '#6B7280',
      marginTop: '4px'
    },
    currentPlanCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #E5E7EB',
      marginBottom: '24px'
    },
    planHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '24px'
    },
    planBadge: (color) => ({
      padding: '6px 16px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '600',
      backgroundColor: color + '20',
      color: color
    }),
    planName: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1F2937',
      margin: '8px 0'
    },
    planPrice: {
      fontSize: '20px',
      color: '#6B7280'
    },
    statusBadge: (status) => ({
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize',
      backgroundColor: status === 'active' ? '#ECFDF5' : '#FEF2F2',
      color: status === 'active' ? '#059669' : '#DC2626'
    }),
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    statCard: {
      padding: '16px',
      backgroundColor: '#F9FAFB',
      borderRadius: '12px',
      textAlign: 'center'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#185FA5'
    },
    statLabel: {
      fontSize: '12px',
      color: '#6B7280',
      marginTop: '4px'
    },
    progressSection: {
      marginTop: '24px'
    },
    progressLabel: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '14px',
      color: '#6B7280',
      marginBottom: '8px'
    },
    progressBar: {
      height: '8px',
      backgroundColor: '#E5E7EB',
      borderRadius: '4px',
      overflow: 'hidden'
    },
    progressFill: (percent, color) => ({
      height: '100%',
      width: `${percent}%`,
      backgroundColor: color,
      borderRadius: '4px',
      transition: 'width 0.3s'
    }),
    featuresSection: {
      marginTop: '24px',
      paddingTop: '24px',
      borderTop: '1px solid #E5E7EB'
    },
    featuresTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: '16px'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '12px'
    },
    featureItem: (enabled) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      color: enabled ? '#059669' : '#9CA3AF',
      textDecoration: enabled ? 'none' : 'line-through'
    }),
    billingSection: {
      display: 'flex',
      gap: '16px',
      marginTop: '24px',
      paddingTop: '24px',
      borderTop: '1px solid #E5E7EB'
    },
    billingInfo: {
      flex: 1,
      padding: '16px',
      backgroundColor: '#F9FAFB',
      borderRadius: '12px'
    },
    billingLabel: {
      fontSize: '12px',
      color: '#6B7280',
      marginBottom: '4px'
    },
    billingValue: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1F2937'
    },
    renewalCard: {
      padding: '16px',
      backgroundColor: '#FEF3C7',
      borderRadius: '12px',
      flex: 1
    },
    renewalTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#92400E',
      marginBottom: '8px'
    },
    renewalDays: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#B45309'
    },
    renewalLabel: {
      fontSize: '12px',
      color: '#92400E'
    },
    plansSection: {
      marginTop: '32px'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: '16px'
    },
    plansGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '20px'
    },
    planCard: (highlight) => ({
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      border: highlight ? '2px solid #185FA5' : '1px solid #E5E7EB',
      position: 'relative'
    }),
    recommendedBadge: {
      position: 'absolute',
      top: '-10px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#185FA5',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600'
    },
    planCardName: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1F2937'
    },
    planCardPrice: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#1F2937',
      margin: '8px 0'
    },
    planCardPeriod: {
      fontSize: '14px',
      color: '#6B7280'
    },
    planCardFeatures: {
      listStyle: 'none',
      padding: 0,
      margin: '20px 0'
    },
    planCardFeature: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      color: '#4B5563',
      marginBottom: '8px'
    },
    upgradeBtn: {
      width: '100%',
      padding: '12px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #E5E7EB'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>
          Loading subscription details...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Subscription & Plans</h1>
        <p style={styles.subtitle}>Manage your university subscription and view plan details</p>
      </div>

      {subscription ? (
        <>
          <div style={styles.currentPlanCard}>
            <div style={styles.planHeader}>
              <div>
                <span style={styles.planBadge(getPlanColor(subscription.plan_name || 'Growth'))}>
                  {subscription.plan_name || 'Current Plan'}
                </span>
                <h2 style={styles.planName}>{subscription.plan_name}</h2>
                <p style={styles.planPrice}>
                  ₹{subscription.amount || 0}/{subscription.billing_period || 'month'}
                </p>
              </div>
              <span style={styles.statusBadge(subscription.status)}>
                {subscription.status}
              </span>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <p style={styles.statValue}>
                  {subscription.limits?.max_colleges === -1 ? '∞' : (subscription.limits?.max_colleges || 'N/A')}
                </p>
                <p style={styles.statLabel}>Max Colleges</p>
              </div>
              <div style={styles.statCard}>
                <p style={styles.statValue}>
                  {subscription.limits?.max_courses === -1 ? '∞' : (subscription.limits?.max_courses || 'N/A')}
                </p>
                <p style={styles.statLabel}>Max Courses</p>
              </div>
              <div style={styles.statCard}>
                <p style={styles.statValue}>
                  {subscription.limits?.max_students === -1 ? '∞' : (subscription.limits?.max_students || 'N/A')}
                </p>
                <p style={styles.statLabel}>Max Students</p>
              </div>
              <div style={styles.statCard}>
                <p style={styles.statValue}>
                  {subscription.features_enabled?.ai_credits_per_month === -1 
                    ? '∞' 
                    : (subscription.features_enabled?.ai_credits_per_month || 0)}
                </p>
                <p style={styles.statLabel}>AI Credits/Month</p>
              </div>
            </div>

            <div style={styles.featuresSection}>
              <h3 style={styles.featuresTitle}>Enabled Features</h3>
              <div style={styles.featuresGrid}>
                {subscription.features_enabled?.analytics?.map((feature, idx) => (
                  <div key={idx} style={styles.featureItem(true)}>
                    <span>✓</span> {feature.charAt(0).toUpperCase() + feature.slice(1)} Analytics
                  </div>
                ))}
                {subscription.features_enabled?.custom_branding && (
                  <div style={styles.featureItem(true)}>
                    <span>✓</span> Custom Branding
                  </div>
                )}
                {subscription.features_enabled?.api_access && (
                  <div style={styles.featureItem(true)}>
                    <span>✓</span> API Access
                  </div>
                )}
                {subscription.features_enabled?.multi_language && (
                  <div style={styles.featureItem(true)}>
                    <span>✓</span> Multi-language Support
                  </div>
                )}
                {subscription.features_enabled?.white_label && (
                  <div style={styles.featureItem(true)}>
                    <span>✓</span> White Label
                  </div>
                )}
              </div>
            </div>

            <div style={styles.billingSection}>
              <div style={styles.billingInfo}>
                <p style={styles.billingLabel}>Billing Period</p>
                <p style={styles.billingValue}>{subscription.billing_period || 'Monthly'}</p>
              </div>
              <div style={styles.billingInfo}>
                <p style={styles.billingLabel}>Start Date</p>
                <p style={styles.billingValue}>{formatDate(subscription.start_date)}</p>
              </div>
              <div style={styles.billingInfo}>
                <p style={styles.billingLabel}>End Date</p>
                <p style={styles.billingValue}>{formatDate(subscription.end_date)}</p>
              </div>
              <div style={styles.renewalCard}>
                <p style={styles.renewalTitle}>Days Until Renewal</p>
                <p style={styles.renewalDays}>{getDaysRemaining()}</p>
                <p style={styles.renewalLabel}>days remaining</p>
              </div>
            </div>
          </div>

          <div style={styles.plansSection}>
            <h2 style={styles.sectionTitle}>Available Plans</h2>
            <div style={styles.plansGrid}>
              {plans.map((plan) => {
                const isCurrent = subscription.plan_name === plan.plan_name;
                const isRecommended = plan.plan_name === 'Enterprise';
                return (
                  <div key={plan._id} style={styles.planCard(isCurrent || isRecommended)}>
                    {isRecommended && !isCurrent && (
                      <span style={styles.recommendedBadge}>Recommended</span>
                    )}
                    <h3 style={styles.planCardName}>{plan.plan_name}</h3>
                    <p style={styles.planCardPrice}>₹{plan.price}</p>
                    <p style={styles.planCardPeriod}>per {plan.billing_period}</p>
                    
                    <ul style={styles.planCardFeatures}>
                      <li style={styles.planCardFeature}>
                        <span>🏛️</span> {plan.max_colleges === -1 ? 'Unlimited' : plan.max_colleges} Colleges
                      </li>
                      <li style={styles.planCardFeature}>
                        <span>📚</span> {plan.max_courses === -1 ? 'Unlimited' : plan.max_courses} Courses
                      </li>
                      <li style={styles.planCardFeature}>
                        <span>👨‍🎓</span> {plan.max_students === -1 ? 'Unlimited' : plan.max_students} Students
                      </li>
                      <li style={styles.planCardFeature}>
                        <span>🤖</span> {plan.features?.ai_credits_per_month === -1 ? 'Unlimited' : plan.features?.ai_credits_per_month} AI Credits
                      </li>
                    </ul>
                    
                    <button 
                      style={{
                        ...styles.upgradeBtn,
                        backgroundColor: isCurrent ? '#E5E7EB' : '#185FA5',
                        color: isCurrent ? '#6B7280' : 'white',
                        cursor: isCurrent ? 'default' : 'pointer'
                      }}
                      disabled={isCurrent}
                    >
                      {isCurrent ? 'Current Plan' : 'Select Plan'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1F2937', margin: '0 0 8px 0' }}>
            No Active Subscription
          </h2>
          <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
            Contact the platform administrator to set up your university subscription.
          </p>
        </div>
      )}
    </div>
  );
};

export default UniversitySubscription;
