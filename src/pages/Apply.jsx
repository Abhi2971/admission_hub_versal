import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCourseDetails } from '../services/courses';
import { submitApplication } from '../services/applications';
import { createPaymentOrder } from '../services/payment';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/common/Alert';
import Loader from '../components/common/Loader';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const S = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    padding: '1.5rem',
    backgroundColor: '#f4f5f7',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  wrap: {
    width: '100%',
    maxWidth: 560,
    paddingTop: '2rem',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    color: '#6b7280',
    textDecoration: 'none',
    marginBottom: '1.25rem',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
  },
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    overflow: 'hidden',
  },

  /* Card header */
  cardHeader: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #f3f4f6',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: 18,
  },
  headerTitle: { fontSize: 16, fontWeight: 500, color: '#111', margin: 0 },
  headerSub:   { fontSize: 12, color: '#6b7280', marginTop: 2 },

  /* Card body */
  cardBody: { padding: '1.25rem 1.5rem' },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 500,
    color: '#9ca3af',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  /* Info rows */
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px 16px',
    marginBottom: 20,
  },
  infoItem: { display: 'flex', flexDirection: 'column', gap: 2 },
  infoLabel: { fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.3px' },
  infoValue: { fontSize: 13, color: '#374151', fontWeight: 400 },

  /* Fee highlight */
  feeBox: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: '1rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  feeLabel: { fontSize: 12, color: '#6b7280' },
  feeAmount: { fontSize: 22, fontWeight: 500, color: '#111' },

  /* Seat indicator */
  seatRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  seatLabel: { fontSize: 12, color: '#6b7280' },
  seatPill: (pct) => ({
    fontSize: 11, fontWeight: 500, padding: '3px 10px',
    borderRadius: 100,
    background: pct > 50 ? '#EAF3DE' : pct > 20 ? '#FAEEDA' : '#FCEBEB',
    color:      pct > 50 ? '#27500A' : pct > 20 ? '#633806' : '#A32D2D',
  }),

  divider: { border: 'none', borderTop: '1px solid #f3f4f6', margin: '0 0 20px' },

  /* Notice box for confirm flow */
  noticeBox: {
    background: '#EAF3DE',
    border: '1px solid #c3dfa0',
    borderRadius: 10,
    padding: '1rem 1.25rem',
    marginBottom: 20,
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
  },
  noticeDot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#3B6D11', flexShrink: 0, marginTop: 4,
  },
  noticeText: { fontSize: 13, color: '#27500A', lineHeight: 1.6 },

  /* Payment steps */
  stepList: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 },
  stepRow: { display: 'flex', alignItems: 'center', gap: 10 },
  stepNum: {
    width: 22, height: 22, borderRadius: '50%',
    background: '#E6F1FB', color: '#0C447C',
    fontSize: 11, fontWeight: 500,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  stepText: { fontSize: 13, color: '#374151' },

  /* Buttons */
  btnPrimary: (color) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '10px 16px',
    fontSize: 14,
    fontWeight: 500,
    borderRadius: 8,
    border: `1px solid ${color}`,
    background: color,
    color: '#fff',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  }),
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },

  /* Full seats notice */
  fullBox: {
    background: '#FCEBEB',
    border: '1px solid #f7c1c1',
    borderRadius: 10,
    padding: '1rem 1.25rem',
    textAlign: 'center',
    fontSize: 13,
    color: '#A32D2D',
    fontWeight: 500,
  },
};

/* ─── Main ────────────────────────────────────────────────────────────────── */
const Apply = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { isAuthenticated } = useAuth();

  const queryParams   = new URLSearchParams(location.search);
  const courseId      = queryParams.get('courseId');
  const applicationId = queryParams.get('applicationId');

  const [course,     setCourse]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname + location.search } });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    if (courseId) {
      const fetchCourse = async () => {
        try {
          const response = await getCourseDetails(courseId);
          setCourse(response.data);
        } catch {
          setError('Failed to load course details');
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    } else if (applicationId) {
      setLoading(false);
    } else {
      setError('Invalid request');
      setLoading(false);
    }
  }, [courseId, applicationId]);

  const handleApply = async () => {
    setSubmitting(true);
    setError('');
    try {
      await submitApplication({ course_id: courseId, college_id: course.college_id });
      setSuccess('Application submitted successfully!');
      setTimeout(() => navigate('/student/applications'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Application failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      const response = await createPaymentOrder({ application_id: applicationId, amount: 50000 });
      const { order_id, razorpay_key, amount } = response.data;
      const options = {
        key: razorpay_key,
        amount,
        currency: 'INR',
        name: 'Admission Platform',
        description: 'Admission Confirmation Fee',
        order_id,
        handler: (res) => {
          navigate(`/payment-success?order_id=${res.razorpay_order_id}&payment_id=${res.razorpay_payment_id}`);
        },
        prefill: { name: 'Student Name', email: 'student@example.com', contact: '9999999999' },
        theme: { color: '#185FA5' },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.error || 'Payment initiation failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader size="lg" />;

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} />}

        <button onClick={() => navigate(-1)} style={S.backLink}>
          ← Back
        </button>

        {/* ── Confirm Admission flow ── */}
        {applicationId && (
          <div style={S.card}>
            <div style={S.cardHeader}>
              <div style={{ ...S.headerIcon, background: '#EAF3DE', color: '#27500A' }}>✓</div>
              <div>
                <h1 style={S.headerTitle}>Confirm Admission</h1>
                <p style={S.headerSub}>Complete payment to secure your seat</p>
              </div>
            </div>

            <div style={S.cardBody}>
              <div style={S.noticeBox}>
                <div style={S.noticeDot} />
                <p style={S.noticeText}>
                  You have been offered admission. Confirm your seat by completing the payment below. Your seat will be reserved once payment is successful.
                </p>
              </div>

              <div style={S.sectionTitle}>Payment steps</div>
              <div style={S.stepList}>
                {[
                  'Click "Proceed to Payment" below',
                  'Complete payment via Razorpay',
                  'Receive confirmation on your email',
                ].map((step, i) => (
                  <div key={i} style={S.stepRow}>
                    <div style={S.stepNum}>{i + 1}</div>
                    <span style={S.stepText}>{step}</span>
                  </div>
                ))}
              </div>

              <div style={S.feeBox}>
                <div>
                  <div style={S.feeLabel}>Confirmation fee</div>
                  <div style={S.feeAmount}>₹500.00</div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 500, padding: '3px 10px',
                  borderRadius: 100, background: '#FAEEDA', color: '#633806',
                }}>
                  Due now
                </span>
              </div>

              <button
                onClick={handleConfirm}
                disabled={submitting}
                style={{
                  ...S.btnPrimary('#3B6D11'),
                  ...(submitting ? S.btnDisabled : {}),
                }}
              >
                {submitting ? 'Processing…' : 'Proceed to payment →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Apply for course flow ── */}
        {courseId && course && (
          <div style={S.card}>
            <div style={S.cardHeader}>
              <div style={{ ...S.headerIcon, background: '#E6F1FB', color: '#0C447C' }}>
                {(course.course_name || 'C')[0].toUpperCase()}
              </div>
              <div>
                <h1 style={S.headerTitle}>Apply for {course.course_name}</h1>
                <p style={S.headerSub}>{course.college_name}</p>
              </div>
            </div>

            <div style={S.cardBody}>
              <div style={S.sectionTitle}>Course details</div>

              <div style={S.infoGrid}>
                <div style={S.infoItem}>
                  <span style={S.infoLabel}>Duration</span>
                  <span style={S.infoValue}>{course.duration || '—'}</span>
                </div>
                <div style={S.infoItem}>
                  <span style={S.infoLabel}>Eligibility</span>
                  <span style={S.infoValue}>{course.eligibility || '—'}</span>
                </div>
                <div style={S.infoItem}>
                  <span style={S.infoLabel}>Domain</span>
                  <span style={S.infoValue}>{course.domain || '—'}</span>
                </div>
                <div style={S.infoItem}>
                  <span style={S.infoLabel}>College</span>
                  <span style={S.infoValue}>{course.college_name}</span>
                </div>
              </div>

              <hr style={S.divider} />

              <div style={S.feeBox}>
                <div>
                  <div style={S.feeLabel}>Course fee</div>
                  <div style={S.feeAmount}>
                    ₹{course.fees.toLocaleString('en-IN')}
                  </div>
                </div>
                {course.available_seats != null && (
                  <span style={S.seatPill(
                    course.seats
                      ? Math.round((course.available_seats / course.seats) * 100)
                      : 100
                  )}>
                    {course.available_seats} seat{course.available_seats !== 1 ? 's' : ''} left
                  </span>
                )}
              </div>

              {course.available_seats === 0 ? (
                <div style={S.fullBox}>No seats available for this course.</div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={submitting}
                  style={{
                    ...S.btnPrimary('#185FA5'),
                    ...(submitting ? S.btnDisabled : {}),
                  }}
                >
                  {submitting ? 'Submitting…' : 'Submit application →'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Apply;