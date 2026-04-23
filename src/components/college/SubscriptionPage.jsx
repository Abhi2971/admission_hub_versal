import React, { useState, useEffect } from 'react';
import { getSubscriptionStatus, getPlans, subscribeToPlan, getSubscriptionHistory } from '../../services/subscription';
import Loader from '../common/Loader';
import Alert from '../common/Alert';

const SubscriptionPage = () => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statusRes, plansRes, historyRes] = await Promise.all([
        getSubscriptionStatus(),
        getPlans(),
        getSubscriptionHistory()
      ]);
      
      if (statusRes.data.status !== 'no_active_subscription') {
        setCurrentPlan(statusRes.data);
      }
      setPlans(plansRes.data || []);
      setHistory(historyRes.data || []);
    } catch (err) {
      console.error('Error fetching subscription data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (planId) => {
    if (!window.confirm('Are you sure you want to subscribe to this plan?')) return;
    
    setPurchasing(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await subscribeToPlan(planId);
      if (res.data.order_id) {
        // Simulate successful payment for demo
        setSuccess('Subscription activated successfully!');
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to purchase plan');
    } finally {
      setPurchasing(false);
    }
  };

  const styles = {
    container: {
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: '1.5rem 2rem',
      backgroundColor: '#F3F4F6',
      minHeight: '100vh',
    },
    header: {
      marginBottom: '24px',
      padding: '1.5rem 2rem',
      background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      border: '1px solid rgba(226,232,240,0.8)',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: 0,
    },
    subtitle: {
      fontSize: '14px',
      color: '#64748b',
      marginTop: '4px',
    },
    section: {
      backgroundColor: '#FFFFFF',
      border: '1px solid #E5E7EB',
      borderRadius: '20px',
      padding: '28px',
      marginBottom: '24px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1e293b',
      marginBottom: '20px',
      paddingBottom: '12px',
      borderBottom: '2px solid #F1F5F9',
    },
    currentPlanCard: {
      background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
      borderRadius: '20px',
      padding: '32px',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '24px',
    },
    planName: {
      fontSize: '32px',
      fontWeight: '700',
      margin: 0,
    },
    planPrice: {
      fontSize: '48px',
      fontWeight: '700',
      margin: '16px 0',
    },
    planBadge: {
      display: 'inline-block',
      padding: '6px 16px',
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '600',
      marginTop: '8px',
    },
    plansGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '20px',
    },
    planCard: {
      background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
      border: '2px solid #E5E7EB',
      borderRadius: '16px',
      padding: '24px',
      transition: 'all 0.3s ease',
    },
    planCardActive: {
      border: '2px solid #0ea5e9',
      background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
    },
    planCardTitle: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1e293b',
      margin: 0,
    },
    planCardPrice: {
      fontSize: '36px',
      fontWeight: '700',
      color: '#0ea5e9',
      margin: '12px 0',
    },
    planFeatures: {
      listStyle: 'none',
      padding: 0,
      margin: '16px 0',
    },
    planFeature: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 0',
      fontSize: '14px',
      color: '#475569',
    },
    purchaseBtn: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '16px',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
    },
    th: {
      textAlign: 'left',
      padding: '16px',
      fontSize: '12px',
      fontWeight: '700',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: '2px solid #e2e8f0',
      background: '#F8FAFC',
    },
    td: {
      padding: '16px',
      fontSize: '14px',
      color: '#334155',
      borderBottom: '1px solid #F1F5F9',
    },
    statusBadge: (status) => ({
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      background: status === 'active' ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
      color: status === 'active' ? '#059669' : '#64748b',
    }),
    emptyState: {
      textAlign: 'center',
      padding: '60px',
      color: '#94a3b8',
    },
  };

  if (loading) return <Loader size="lg" />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Subscription</h1>
        <p style={styles.subtitle}>Manage your college subscription and plans</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={5000} />}

      {/* Current Plan */}
      {currentPlan ? (
        <div style={styles.currentPlanCard}>
          <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '40%', height: '200%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.2) 0%, transparent 70%)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '13px', opacity: 0.9, margin: 0, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Plan</p>
            <h2 style={styles.planName}>{currentPlan.plan?.plan_name || 'Premium Plan'}</h2>
            <p style={styles.planPrice}>₹{currentPlan.plan?.price || 0}</p>
            <span style={styles.planBadge}>
              {currentPlan.plan?.billing_period === 'monthly' ? 'Monthly Billing' : 'Annual Billing'}
            </span>
            <div style={{ marginTop: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px 20px', borderRadius: '12px' }}>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Valid Until</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                  {currentPlan.end_date ? new Date(currentPlan.end_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px 20px', borderRadius: '12px' }}>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Courses</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{currentPlan.usage?.courses || 0}</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px 20px', borderRadius: '12px' }}>
                <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Manual Students</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{currentPlan.usage?.students || 0}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ ...styles.currentPlanCard, background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: '13px', opacity: 0.9, margin: 0, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>No Active Plan</p>
            <h2 style={{ fontSize: '28px', fontWeight: '700', margin: '8px 0' }}>Subscribe to a Plan</h2>
            <p style={{ opacity: 0.9, margin: 0 }}>Choose a plan below to get started</p>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📋 Available Plans</h2>
        <div style={styles.plansGrid}>
          {plans.map((plan) => (
            <div 
              key={plan._id} 
              style={{ 
                ...styles.planCard,
                ...(currentPlan?.plan?._id === plan._id ? styles.planCardActive : {})
              }}
            >
              <h3 style={styles.planCardTitle}>{plan.plan_name}</h3>
              <p style={styles.planCardPrice}>
                ₹{plan.price}
                <span style={{ fontSize: '14px', fontWeight: '400', color: '#64748b' }}>
                  /{plan.billing_period}
                </span>
              </p>
              <ul style={styles.planFeatures}>
                {plan.features && typeof plan.features === 'object' ? (
                  <>
                    {plan.features.ai_enabled && (
                      <li style={styles.planFeature}><span style={{ color: '#059669' }}>✓</span> AI Assistant Access</li>
                    )}
                    {plan.features.ai_credits === -1 ? (
                      <li style={styles.planFeature}><span style={{ color: '#059669' }}>✓</span> Unlimited AI Credits</li>
                    ) : plan.features.ai_credits > 0 && (
                      <li style={styles.planFeature}><span style={{ color: '#059669' }}>✓</span> {plan.features.ai_credits} AI Credits</li>
                    )}
                    {plan.features.max_courses === -1 ? (
                      <li style={styles.planFeature}><span style={{ color: '#059669' }}>✓</span> Unlimited Courses</li>
                    ) : (
                      <li style={styles.planFeature}><span style={{ color: '#059669' }}>✓</span> Up to {plan.features.max_courses} Courses</li>
                    )}
                    {plan.features.analytics && Array.isArray(plan.features.analytics) && (
                      <li style={styles.planFeature}><span style={{ color: '#059669' }}>✓</span> Analytics: {plan.features.analytics.join(', ')}</li>
                    )}
                    {plan.features.support_level && (
                      <li style={styles.planFeature}><span style={{ color: '#059669' }}>✓</span> {plan.features.support_level} Support</li>
                    )}
                  </>
                ) : Array.isArray(plan.features) ? (
                  plan.features.map((feature, idx) => (
                    <li key={idx} style={styles.planFeature}>
                      <span style={{ color: '#059669' }}>✓</span> {feature}
                    </li>
                  ))
                ) : null}
              </ul>
              {currentPlan?.plan?._id === plan._id ? (
                <button style={{ ...styles.purchaseBtn, background: 'linear-gradient(135deg, #059669, #047857)' }} disabled>
                  Current Plan
                </button>
              ) : (
                <button 
                  style={styles.purchaseBtn} 
                  onClick={() => handlePurchase(plan._id)}
                  disabled={purchasing}
                >
                  {purchasing ? 'Processing...' : 'Subscribe'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Subscription History */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>📜 Subscription History</h2>
        {history.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
            <p>No subscription history found</p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Plan</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Billing</th>
                <th style={styles.th}>Start Date</th>
                <th style={styles.th}>End Date</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((sub) => (
                <tr key={sub._id}>
                  <td style={styles.td}><strong>{sub.plan?.plan_name || 'N/A'}</strong></td>
                  <td style={styles.td}>₹{sub.plan?.price || 0}</td>
                  <td style={styles.td}>{sub.plan?.billing_period || 'N/A'}</td>
                  <td style={styles.td}>
                    {sub.start_date ? new Date(sub.start_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={styles.td}>
                    {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.statusBadge(sub.status)}>{sub.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;
