import React, { useState, useEffect, useCallback } from 'react';
import { getPlatformAnalytics } from '../../services/superadmin';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Loader from '../common/Loader';
import Alert from '../common/Alert';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdvancedAnalytics = () => {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      };
      const response = await getPlatformAnalytics(params);
      setAnalytics(response.data);
    } catch (err) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const exportCSV = () => {
    if (!analytics) return;
    // Simple CSV export (you can enhance this)
    const csvData = [
      ['Metric', 'Value'],
      ['Total Students', analytics.total_students],
      ['Total Colleges', analytics.total_colleges],
      ['Total Courses', analytics.total_courses],
      ['Total Applications', analytics.total_applications],
      ['Total Revenue', analytics.total_revenue / 100],
      ['Active Subscriptions', analytics.active_subscriptions],
    ];
    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics.csv';
    a.click();
  };

  if (loading) return <Loader size="lg" />;
  if (error) return <Alert type="error" message={error} onClose={() => setError('')} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Advanced Analytics</h1>
      <div className="flex space-x-4 mb-6">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <DatePicker selected={startDate} onChange={date => setStartDate(date)} className="border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <DatePicker selected={endDate} onChange={date => setEndDate(date)} className="border p-2 rounded" />
        </div>
        <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded self-end">Export CSV</button>
      </div>

      {analytics && (
        <>
          {/* Funnel Chart */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Conversion Funnel</h2>
            <BarChart width={600} height={300} data={[
              { name: 'Applied', value: analytics.funnel?.applied || 0 },
              { name: 'Shortlisted', value: analytics.funnel?.shortlisted || 0 },
              { name: 'Offered', value: analytics.funnel?.offered || 0 },
              { name: 'Confirmed', value: analytics.funnel?.confirmed || 0 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </div>

          {/* Revenue Over Time */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Revenue (Daily)</h2>
            <LineChart width={800} height={300} data={analytics.revenue || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="daily" stroke="#82ca9d" />
            </LineChart>
          </div>

          {/* Geographic Distribution */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Top Locations</h2>
            <PieChart width={400} height={400}>
              <Pie
                data={analytics.geo || []}
                cx={200}
                cy={200}
                labelLine={false}
                label={entry => entry._id}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {(analytics.geo || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>
        </>
      )}
    </div>
  );
};

export default AdvancedAnalytics;