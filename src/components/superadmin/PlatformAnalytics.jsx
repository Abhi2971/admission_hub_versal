import React, { useEffect, useState } from 'react';
import { getPlatformAnalytics } from '../../services/superadmin';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import Loader from '../common/Loader';
import Alert from '../common/Alert';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const PlatformAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await getPlatformAnalytics();
      setAnalytics(response.data);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader size="lg" />;
  if (error) return <Alert type="error" message={error} onClose={() => setError('')} />;

  const statusLabels = Object.keys(analytics.application_status || {});
  const statusValues = Object.values(analytics.application_status || {});
  const hasStatusData = statusLabels.length > 0;

  const statusData = {
    labels: statusLabels,
    datasets: [
      {
        label: 'Applications by Status',
        data: statusValues,
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
      },
    ],
  };

  const collegeLabels = analytics.top_colleges?.map(c => c.college_name) || [];
  const collegeValues = analytics.top_colleges?.map(c => c.count) || [];
  const hasCollegeData = collegeLabels.length > 0;

  const collegeData = {
    labels: collegeLabels,
    datasets: [
      {
        label: 'Applications per College',
        data: collegeValues,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  // Monthly trend data (mock – replace with real data from backend when available)
  const monthlyTrends = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Applications',
        data: [65, 59, 80, 81, 56, 55],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: 'Payments',
        data: [28, 48, 40, 19, 86, 27],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Platform Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Application Status Distribution</h2>
          {hasStatusData ? (
            <Pie data={statusData} />
          ) : (
            <p className="text-gray-500 text-center py-8">No application status data available.</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Top Colleges by Applications</h2>
          {hasCollegeData ? (
            <Bar
              data={collegeData}
              options={{
                indexAxis: 'y',
                responsive: true,
              }}
            />
          ) : (
            <p className="text-gray-500 text-center py-8">No college application data available.</p>
          )}
        </div>
      </div>
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Monthly Trends (Sample Data)</h2>
        <Line data={monthlyTrends} />
        <p className="text-sm text-gray-500 mt-2">Note: This chart shows sample data; real data will appear when applications exist.</p>
      </div>
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{analytics.total_students || 0}</p>
            <p className="text-gray-600">Students</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{analytics.total_colleges || 0}</p>
            <p className="text-gray-600">Colleges</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{analytics.total_courses || 0}</p>
            <p className="text-gray-600">Courses</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{analytics.total_applications || 0}</p>
            <p className="text-gray-600">Applications</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-600">{analytics.total_admins || 0}</p>
            <p className="text-gray-600">Admins</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-600">{analytics.active_subscriptions || 0}</p>
            <p className="text-gray-600">Active Subscriptions</p>
          </div>
          <div className="text-center col-span-2">
            <p className="text-3xl font-bold text-pink-600">₹{((analytics.total_revenue || 0) / 100).toLocaleString()}</p>
            <p className="text-gray-600">Total Revenue</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformAnalytics;