import React, { useEffect, useState } from 'react';
import { useSubscription } from '../../context/SubscriptionContext';
import { getCollegeAnalytics } from '../../services/admin';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import SubscriptionRequired from '../common/SubscriptionRequired';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const CollegeAnalytics = () => {
  const { hasActive } = useSubscription();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hasActive) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [hasActive]);

  const fetchAnalytics = async () => {
    try {
      const response = await getCollegeAnalytics();
      setAnalytics(response.data);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (!hasActive) return <SubscriptionRequired feature="view analytics" />;
  if (loading) return <Loader size="lg" />;
  if (error) return <Alert type="error" message={error} onClose={() => setError('')} />;
  if (!analytics) return <Alert type="info" message="No analytics data available" />;

  const statusData = {
    labels: Object.keys(analytics.application_status || {}),
    datasets: [
      {
        label: 'Applications by Status',
        data: Object.values(analytics.application_status || {}),
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

  const courseData = {
    labels: analytics.course_popularity?.map((c) => c.course_name) || [],
    datasets: [
      {
        label: 'Applications per Course',
        data: analytics.course_popularity?.map((c) => c.count) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">College Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Application Status Distribution</h2>
          {Object.keys(analytics.application_status || {}).length > 0 ? (
            <Pie data={statusData} />
          ) : (
            <p className="text-gray-600">No application status data</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Applications per Course</h2>
          {analytics.course_popularity?.length > 0 ? (
            <Bar
              data={courseData}
              options={{
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                  },
                },
              }}
            />
          ) : (
            <p className="text-gray-600">No course application data</p>
          )}
        </div>
      </div>
      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{analytics.total_applications || 0}</p>
            <p className="text-gray-600">Total Applications</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{analytics.total_courses || 0}</p>
            <p className="text-gray-600">Total Courses</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{analytics.total_students || 0}</p>
            <p className="text-gray-600">Total Students</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{analytics.confirmed_admissions || 0}</p>
            <p className="text-gray-600">Confirmed Admissions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeAnalytics;