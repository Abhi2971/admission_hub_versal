import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCreditBalance } from '../../services/credits';
import Loader from '../common/Loader';
import Alert from '../common/Alert';

const AiUsageGuard = ({ children, requiredCredits = 50 }) => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await getCreditBalance();
        setBalance(response.data.balance);
      } catch (err) {
        setError('Failed to fetch credit balance');
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  if (loading) return <Loader size="lg" />;
  if (error) return <Alert type="error" message={error} onClose={() => setError('')} />;

  if (balance < requiredCredits) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Insufficient Credits</h2>
        <p style={{ marginBottom: '1rem', color: '#6B7280' }}>You need at least {requiredCredits} credits to access AI Advisor.</p>
        <button
          onClick={() => navigate('/student/credits/purchase')}
          style={{ backgroundColor: '#185FA5', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Buy Credits
        </button>
      </div>
    );
  }

  return children;
};

export default AiUsageGuard;