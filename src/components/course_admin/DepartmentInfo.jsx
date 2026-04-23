import React, { useState, useEffect } from 'react';
import { getCourseAdminDepartment, getCourseAdminCourses, getCourseAdminStats } from '../../services/courseAdmin';
import Loader from '../common/Loader';

const DepartmentInfo = () => {
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState(null);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, coursesRes, statsRes] = await Promise.all([
          getCourseAdminDepartment(),
          getCourseAdminCourses(),
          getCourseAdminStats()
        ]);
        setDepartment(deptRes.data);
        setCourses(coursesRes.data.courses || []);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching department data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: "'DM Sans', sans-serif",
    },
    header: {
      marginBottom: '24px',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      border: '1px solid rgba(226,232,240,0.8)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: 0,
    },
    subtitle: {
      fontSize: '14px',
      color: '#64748b',
      marginTop: '4px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px',
      marginBottom: '24px',
    },
    card: {
      background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(226,232,240,0.8)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    cardTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#64748b',
      marginBottom: '16px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    statGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
    },
    statItem: {
      textAlign: 'center',
      padding: '16px',
      background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
      borderRadius: '12px',
    },
    statValue: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#14b8a6',
    },
    statLabel: {
      fontSize: '12px',
      color: '#64748b',
      marginTop: '4px',
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid #f1f5f9',
    },
    infoLabel: {
      fontSize: '14px',
      color: '#64748b',
    },
    infoValue: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b',
    },
    courseList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    courseItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px',
      background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
      borderRadius: '10px',
    },
    courseName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1e293b',
    },
    courseSeats: {
      fontSize: '13px',
      color: '#64748b',
    },
    seatBadge: (available) => ({
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '600',
      background: available > 0 ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : 'linear-gradient(135deg, #fee2e2, #fecaca)',
      color: available > 0 ? '#059669' : '#dc2626',
    }),
  };

  if (loading) return <Loader size="lg" />;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>My Department</h1>
        <p style={styles.subtitle}>{department?.department || 'Department Info'}</p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Department Overview</h3>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Department Name</span>
            <span style={styles.infoValue}>{department?.department || 'N/A'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Admin Name</span>
            <span style={styles.infoValue}>{department?.name || 'N/A'}</span>
          </div>
          <div style={{ ...styles.infoRow, borderBottom: 'none' }}>
            <span style={styles.infoLabel}>Status</span>
            <span style={{ ...styles.infoValue, color: '#059669' }}>Active</span>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Admission Statistics</h3>
          <div style={styles.statGrid}>
            <div style={styles.statItem}>
              <p style={styles.statValue}>{stats?.total_seats || 0}</p>
              <p style={styles.statLabel}>Total Seats</p>
            </div>
            <div style={styles.statItem}>
              <p style={styles.statValue}>{stats?.filled_seats || 0}</p>
              <p style={styles.statLabel}>Filled</p>
            </div>
            <div style={styles.statItem}>
              <p style={{ ...styles.statValue, color: '#F59E0B' }}>{stats?.available_seats || 0}</p>
              <p style={styles.statLabel}>Available</p>
            </div>
            <div style={styles.statItem}>
              <p style={{ ...styles.statValue, color: '#3B82F6' }}>{stats?.application_count || 0}</p>
              <p style={styles.statLabel}>Applications</p>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Courses ({courses.length})</h3>
        <div style={styles.courseList}>
          {courses.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>No courses assigned</p>
          ) : (
            courses.map((course) => (
              <div key={course._id} style={styles.courseItem}>
                <div>
                  <div style={styles.courseName}>{course.course_name}</div>
                  <div style={styles.courseSeats}>
                    {course.domain} • {course.duration} • ₹{course.fees?.toLocaleString()}
                  </div>
                </div>
                <span style={styles.seatBadge(course.available_seats)}>
                  {course.available_seats}/{course.seats} seats
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentInfo;
