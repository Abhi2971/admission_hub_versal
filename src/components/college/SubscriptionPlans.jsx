import React, { useState, useEffect } from 'react';
import { getPlans, subscribeToPlan, getSubscriptionStatus } from '../../services/subscription';
import Alert from '../common/Alert';
import Loader from '../common/Loader';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansRes, subRes] = await Promise.all([
        getPlans(),
        getSubscriptionStatus(),
      ]);
      setPlans(plansRes.data || []);
      setCurrentSub(subRes.data || null);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    setSubscribing(true);
    setError('');
    try {
      const response = await subscribeToPlan(planId);
      const { order_id, razorpay_key, amount } = response.data;
      const options = {
        key: razorpay_key,
        amount,
        currency: 'INR',
        name: 'Admission Platform',
        description: 'College Subscription',
        order_id,
        handler: function (response) {
          setSuccess('Subscription activated!');
          fetchData();
        },
        theme: { color: '#3399cc' },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.error || 'Subscription failed');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) return <Loader size="lg" />;
  if (error) return <Alert type="error" message={error} onClose={() => setError('')} />;

  // Separate monthly and yearly plans for better display
  const monthlyPlans = plans.filter(p => p.billing_period === 'monthly');
  const yearlyPlans = plans.filter(p => p.billing_period === 'yearly');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Subscription Plans</h1>
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} autoClose={3000} />}
      {currentSub && currentSub.status === 'active' && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>
            You have an active subscription until{' '}
            {new Date(currentSub.end_date).toLocaleDateString()}.
          </p>
        </div>
      )}
      {plans.length === 0 ? (
        <p className="text-gray-600">No subscription plans available.</p>
      ) : (
        <>
          {monthlyPlans.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Monthly Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {monthlyPlans.map((plan) => (
                  <PlanCard key={plan._id} plan={plan} onSubscribe={handleSubscribe} currentSub={currentSub} subscribing={subscribing} />
                ))}
              </div>
            </div>
          )}
          {yearlyPlans.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Yearly Plans (Save 20%)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {yearlyPlans.map((plan) => (
                  <PlanCard key={plan._id} plan={plan} onSubscribe={handleSubscribe} currentSub={currentSub} subscribing={subscribing} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const PlanCard = ({ plan, onSubscribe, currentSub, subscribing }) => {
  const isActive = currentSub && currentSub.plan_id === plan._id && currentSub.status === 'active';
  const canSubscribe = !currentSub || currentSub.status !== 'active';

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md border ${isActive ? 'border-green-500' : 'border-gray-300'}`}>
      <h3 className="text-2xl font-bold mb-2">{plan.plan_name}</h3>
      <p className="text-3xl font-bold text-blue-600 mb-2">₹{plan.price}</p>
      <p className="text-sm text-gray-500 mb-4">{plan.billing_period === 'monthly' ? 'per month' : 'per year'}</p>
      <div className="mb-4">
        <p className="text-sm"><span className="font-semibold">Courses:</span> {plan.max_courses === 30 ? 'Unlimited' : plan.max_courses}</p>
        <p className="text-sm"><span className="font-semibold">Manual Students:</span> {plan.max_students}</p>
      </div>
      <ul className="mb-6 space-y-2 text-sm">
        {plan.features.map((feat, idx) => (
          <li key={idx} className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {feat}
          </li>
        ))}
      </ul>
      {isActive ? (
        <div className="text-center text-green-600 font-semibold">Current Plan</div>
      ) : (
        <button
          onClick={() => onSubscribe(plan._id)}
          disabled={subscribing || !canSubscribe}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {subscribing ? <Loader size="sm" color="white" /> : 'Subscribe'}
        </button>
      )}
    </div>
  );
};

export default SubscriptionPlans;