import React, { useState, useEffect } from 'react';
import { getCourseAdminCourses, createCourseAdminCourse, updateCourseAdminCourse, deleteCourseAdminCourse } from '../../services/courseAdmin';
import Alert from '../common/Alert';
import Loader from '../common/Loader';

const DOCUMENT_OPTIONS = [
  '10th Marksheet',
  '12th Marksheet',
  'Graduation Certificate',
  'Transfer Certificate',
  'Migration Certificate',
  'Caste Certificate',
  'Income Certificate',
  'Domicile Certificate',
  'Passport Size Photos',
  'Aadhar Card',
  'Medical Fitness Certificate',
];

const DOMAIN_OPTIONS = [
  'Engineering',
  'Medical',
  'Arts',
  'Commerce',
  'Science',
  'Law',
  'Management',
  'Education',
  'Agriculture',
  'Pharmacy',
  'Architecture',
  'Design',
  'Other',
];

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    course_name: '',
    domain: '',
    description: '',
    duration: '',
    eligibility: '',
    seats: '',
    fees: '',
    required_documents: [],
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await getCourseAdminCourses();
      setCourses(response.data.courses || []);
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocumentToggle = (doc) => {
    setFormData((prev) => {
      const exists = prev.required_documents.includes(doc);
      return {
        ...prev,
        required_documents: exists
          ? prev.required_documents.filter((d) => d !== doc)
          : [...prev.required_documents, doc],
      };
    });
  };

  const resetForm = () => {
    setFormData({
      course_name: '',
      domain: '',
      description: '',
      duration: '',
      eligibility: '',
      seats: '',
      fees: '',
      required_documents: [],
    });
    setEditingCourse(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      if (editingCourse) {
        await updateCourseAdminCourse(editingCourse._id, formData);
        setSuccess('Course updated successfully');
      } else {
        await createCourseAdminCourse(formData);
        setSuccess('Course created successfully');
      }
      resetForm();
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      course_name: course.course_name,
      domain: course.domain,
      description: course.description || '',
      duration: course.duration,
      eligibility: course.eligibility,
      seats: course.seats,
      fees: course.fees,
      required_documents: course.required_documents || [],
    });
    setShowForm(true);
    // Scroll to form
    setTimeout(() => {
      document.getElementById('course-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourseAdminCourse(courseId);
      setSuccess('Course deleted successfully');
      fetchCourses();
    } catch (err) {
      setError('Delete failed. Please try again.');
    }
  };

  if (loading) return <Loader size="lg" />;

  const canAddCourse = true;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage My Courses</h1>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {courses.length}/3 courses used
        </span>
      </div>

      {/* Alerts */}
      {error && (
        <Alert type="error" message={error} onClose={() => setError('')} />
      )}
      {success && (
        <Alert
          type="success"
          message={success}
          onClose={() => setSuccess('')}
          autoClose={3000}
        />
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-5 flex items-center gap-3">
        <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <p className="text-sm text-blue-700">
          You have created <strong>{courses.length}</strong> out of <strong>3</strong> allowed courses.
          {!canAddCourse && ' You have reached the maximum limit.'}
        </p>
      </div>

      {/* Add Course Button */}
      <button
        onClick={() => {
          if (showForm && !editingCourse) {
            resetForm();
          } else {
            setEditingCourse(null);
            setFormData({
              course_name: '', domain: '', description: '',
              duration: '', eligibility: '', seats: '', fees: '',
              required_documents: [],
            });
            setShowForm(true);
          }
        }}
        disabled={!canAddCourse && !showForm}
        className={`mb-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
          canAddCourse || showForm
            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
        title={!canAddCourse ? 'Maximum courses reached' : ''}
      >
        {showForm && !editingCourse ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Course
          </>
        )}
      </button>

      {/* ── Course Form ── */}
      {showForm && (
        <div id="course-form" className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-5">
            {editingCourse ? 'Edit Course' : 'New Course'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Course Name + Domain */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="course_name"
                  value={formData.course_name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. B.Tech Computer Science"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain <span className="text-red-500">*</span>
                </label>
                <select
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select domain</option>
                  {DOMAIN_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Duration + Eligibility */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 4 Years"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Eligibility <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="eligibility"
                  value={formData.eligibility}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 10+2 with PCM, min 60%"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Row 3: Seats + Fees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Seats <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="seats"
                  value={formData.seats}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="e.g. 60"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Annual Fees (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="fees"
                  value={formData.fees}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="e.g. 75000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief overview of the course..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Required Documents */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Documents
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DOCUMENT_OPTIONS.map((doc) => {
                  const checked = formData.required_documents.includes(doc);
                  return (
                    <label
                      key={doc}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                        checked
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleDocumentToggle(doc)}
                        className="accent-blue-600"
                      />
                      {doc}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Saving...
                  </>
                ) : editingCourse ? 'Update Course' : 'Create Course'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Course Table ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-700">Your Courses</h2>
          <span className="text-sm text-gray-400">{courses.length} course{courses.length !== 1 ? 's' : ''}</span>
        </div>

        {courses.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="font-medium">No courses yet</p>
            <p className="text-sm mt-1">Click "Add New Course" to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Course</th>
                  <th className="px-6 py-3">Domain</th>
                  <th className="px-6 py-3">Duration</th>
                  <th className="px-6 py-3">Seats</th>
                  <th className="px-6 py-3">Fees / Year</th>
                  <th className="px-6 py-3">Eligibility</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">{course.course_name}</div>
                      {course.description && (
                        <div className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-xs">
                          {course.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        {course.domain}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{course.duration}</td>
                    <td className="px-6 py-4 text-gray-600">{course.seats}</td>
                    <td className="px-6 py-4 text-gray-600">
                      ₹{Number(course.fees).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs">
                      <span className="line-clamp-2">{course.eligibility}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(course._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCourses;