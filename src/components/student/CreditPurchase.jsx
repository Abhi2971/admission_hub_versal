import React, { useState } from 'react';
import { purchaseCredits } from '../../services/credits';
import { useAccess } from '../../context/AccessContext';
import Alert from '../common/Alert';
import Loader from '../common/Loader';

const CreditPurchase = () => {
  const { refreshAccess } = useAccess();
  const [amount, setAmount] = useState(100);
  const [credits, setCredits] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const plans = [
    { amount: 100, credits: 10, popular: false },
    { amount: 500, credits: 60, popular: true },
    { amount: 1000, credits: 130, popular: false },
  ];

  const handleSelectPlan = (plan) => {
    setAmount(plan.amount);
    setCredits(plan.credits);
  };

  const handlePurchase = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await purchaseCredits({ amount, credits });
      const { order_id, razorpay_key } = response.data;
      const options = {
        key: razorpay_key,
        amount: amount * 100,
        currency: 'INR',
        name: 'Admission Platform',
        description: `Purchase ${credits} AI Credits`,
        order_id: order_id,
        handler: function (response) {
          setSuccess('Payment successful! Credits added to your account.');
          refreshAccess();
        },
        prefill: {
          name: 'Student Name',
          email: 'student@example.com',
          contact: '9999999999'
        },
        theme: { color: '#185FA5' }
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.error || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  const S = {
    container: {
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backgroundColor: '#F3F4F6',
      minHeight: '100vh',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
    },
    title: {
      fontSize: '28px',
      fontWeight: '600',
      color: '#111827',
      margin: '0 0 8px 0',
    },
    subtitle: {
      fontSize: '14px',
      color: '#6B7280',
      margin: 0,
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      border: '1px solid #E5E7EB',
      padding: '2rem',
      width: '100%',
      maxWidth: '600px',
    },
    plansGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      marginBottom: '1.5rem',
    },
    planCard: (selected, popular) => ({
      padding: '1.25rem 1rem',
      borderRadius: '12px',
      border: `2px solid ${selected ? '#185FA5' : popular ? '#E5E7EB' : '#E5E7EB'}`,
      backgroundColor: selected ? '#EFF6FF' : popular ? '#FAFAFA' : '#FFFFFF',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.2s',
      position: 'relative',
    }),
    popularBadge: {
      position: 'absolute',
      top: '-10px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#185FA5',
      color: '#FFFFFF',
      fontSize: '10px',
      fontWeight: '600',
      padding: '2px 10px',
      borderRadius: '100px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    planAmount: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#111827',
      margin: '8px 0 4px 0',
    },
    planCredits: {
      fontSize: '13px',
      color: '#6B7280',
    },
    planBonus: {
      fontSize: '11px',
      color: '#059669',
      fontWeight: '500',
      marginTop: '4px',
    },
    summaryBox: {
      backgroundColor: '#F9FAFB',
      borderRadius: '10px',
      padding: '1rem 1.25rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    summaryLabel: {
      fontSize: '14px',
      color: '#6B7280',
    },
    summaryValue: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#111827',
    },
    summaryCredits: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#185FA5',
    },
    button: {
      width: '100%',
      padding: '14px',
      backgroundColor: '#185FA5',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '10px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    features: {
      marginTop: '1.5rem',
      paddingTop: '1.5rem',
      borderTop: '1px solid #E5E7EB',
    },
    featuresTitle: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#6B7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '12px',
    },
    featuresList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px',
      color: '#374151',
    },
    featureIcon: {
      color: '#059669',
      fontSize: '14px',
    },
  };

  return (
    <div style={S.container}>
      <div style={S.header}>
        <h1 style={S.title}>Buy AI Credits</h1>
        <p style={S.subtitle}>Get more credits to power your admission journey</p>
      </div>

      <div style={S.card}>
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}

        <div style={S.plansGrid}>
          {plans.map(plan => (
            <div
              key={plan.amount}
              style={S.planCard(amount === plan.amount, plan.popular)}
              onClick={() => handleSelectPlan(plan)}
            >
              {plan.popular && <span style={S.popularBadge}>Best Value</span>}
              <div style={S.planAmount}>₹{plan.amount}</div>
              <div style={S.planCredits}>{plan.credits} Credits</div>
              {plan.credits > 10 && (
                <div style={S.planBonus}>+{Math.round((plan.credits - 10) / 10 * 100)}% bonus</div>
              )}
            </div>
          ))}
        </div>

        <div style={S.summaryBox}>
          <div>
            <div style={S.summaryLabel}>Selected Plan</div>
            <div style={S.summaryValue}>₹{amount}</div>
          </div>
          <div style={S.summaryCredits}>
            {credits} Credits
          </div>
        </div>

        <button
          onClick={handlePurchase}
          disabled={loading}
          style={{
            ...S.button,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <>
              <Loader size="sm" color="white" />
              Processing...
            </>
          ) : (
            <>
              <span>Purchase Now</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </>
          )}
        </button>

        <div style={S.features}>
          <div style={S.featuresTitle}>What's included</div>
          <div style={S.featuresList}>
            <div style={S.featureItem}>
              <span style={S.featureIcon}>✓</span>
              <span>Unlimited course recommendations</span>
            </div>
            <div style={S.featureItem}>
              <span style={S.featureIcon}>✓</span>
              <span>AI-powered admission guidance</span>
            </div>
            <div style={S.featureItem}>
              <span style={S.featureIcon}>✓</span>
              <span>Profile enhancement suggestions</span>
            </div>
            <div style={S.featureItem}>
              <span style={S.featureIcon}>✓</span>
              <span>Career path analysis</span>
            </div>
            <div style={{ ...S.featureItem, marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #E5E7EB' }}>
              <span style={{ color: '#185FA5', fontSize: '14px' }}>ℹ️</span>
              <span style={{ color: '#6B7280', fontSize: '12px' }}>Minimum 50 credits required to access AI Advisor</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditPurchase;
