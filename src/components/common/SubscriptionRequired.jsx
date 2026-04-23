import React from 'react';
import { Link } from 'react-router-dom';

const SubscriptionRequired = ({ feature = 'access this page' }) => {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold mb-4">Subscription Required</h2>
      <p className="mb-6">You need an active subscription to {feature}.</p>
      <Link
        to="/admin/subscription"
        className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
      >
        View Subscription Plans
      </Link>
    </div>
  );
};

export default SubscriptionRequired;