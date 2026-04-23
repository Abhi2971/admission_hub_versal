import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { manualAddStudent, getCollegeCourses } from '../../services/admin';
import { useSubscription } from '../../context/SubscriptionContext';
import Alert from '../common/Alert';
import Loader from '../common/Loader';
import SubscriptionRequired from '../common/SubscriptionRequired';

const ManualEntry = () => {
  const { hasActive, plan, usage, refresh } = useSubscription(); // ✅ added refresh

  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    course: '',
    marks: '',
    year: '',
    college_name: '',
    location: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetchingCourses, setFetchingCourses] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (hasActive) {
      fetchCourses();
    } else {
      setFetchingCourses(false);
    }
  }, [hasActive]);

  const fetchCourses = async () => {
    try {
      const response = await getCollegeCourses();
      setCourses(response.data);
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setFetchingCourses(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasActive) {
      setError('Active subscription required');
      return;
    }

    if (usage && plan && usage.students >= plan.max_students) {
      setError(`Student limit reached (max ${plan.max_students})`);
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await manualAddStudent(formData);

      setSuccess(
        'Student added successfully. Login credentials sent to email if provided.'
      );

      // Reset form
      setFormData({
        name: '',
        mobile: '',
        email: '',
        course: '',
        marks: '',
        year: '',
        college_name: '',
        location: '',
      });

      // ✅ Refresh subscription usage
      refresh();

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  if (!hasActive) {
    return <SubscriptionRequired feature="add students manually" />;
  }

  if (fetchingCourses) {
    return <Loader size="lg" />;
  }

  const canAddStudent =
    usage && plan && usage.students < plan.max_students;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Manual Student Entry</h1>

      <p className="text-gray-600 mb-4">
        Add a student who applied offline. If email is provided, login credentials
        will be sent automatically.
      </p>

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess('')}
          autoClose={3000}
        />
      )}

      {plan && (
        <div className="bg-blue-50 p-4 rounded mb-4">
          <p className="text-sm">
            Student usage: {usage?.students || 0} / {plan.max_students}
          </p>
        </div>
      )}

      {!canAddStudent && (
        <div>
          <Alert
            type="warning"
            message={`You have reached the student limit (${plan?.max_students}). Upgrade your plan.`}
          />

          {/* Optional Upgrade CTA */}
          <Link
            to="/admin/subscription"
            className="text-blue-600 underline text-sm"
          >
            Upgrade Plan
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Student Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        {/* Mobile */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Mobile (10 digits) *
          </label>
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            pattern="[0-9]{10}"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Email (optional)
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        {/* Course */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Select Course *
          </label>
          <select
            name="course"
            value={formData.course}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">-- Select a course --</option>
            {courses.map((c) => (
              <option key={c._id} value={c.course_name}>
                {c.course_name}
              </option>
            ))}
          </select>
        </div>

        {/* Marks */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Marks/Grade *
          </label>
          <input
            type="text"
            name="marks"
            value={formData.marks}
            onChange={handleChange}
            placeholder="e.g., 85% or A"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        {/* Year */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Year of Passing *
          </label>
          <input
            type="text"
            name="year"
            value={formData.year}
            onChange={handleChange}
            placeholder="e.g., 2024"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        {/* College Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            College Name (optional)
          </label>
          <input
            type="text"
            name="college_name"
            value={formData.college_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        {/* Location */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Location (optional)
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !canAddStudent}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? <Loader size="sm" color="white" /> : 'Add Student'}
        </button>
      </form>
    </div>
  );
};

export default ManualEntry;