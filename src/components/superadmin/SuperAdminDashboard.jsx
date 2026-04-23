import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SuperAdminDashboard = ({ tab: initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    universities: [],
    colleges: [],
    students: [],
    universityAdmins: [],
    collegeAdmins: [],
    deptAdmins: [],
    supportTickets: []
  });
  const [plans, setPlans] = useState({ university: [], college: [], student: [] });
  const [stats, setStats] = useState({
    universities: 0, colleges: 0, students: 0,
    universityAdmins: 0, collegeAdmins: 0, deptAdmins: 0,
    openTickets: 0
  });
  const [showModal, setShowModal] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [uniRes, colRes, stuRes, adminsRes, uniPlansRes, colPlansRes, stuPlansRes, ticketsRes] = await Promise.all([
        fetch(`${API_URL}/api/superadmin/universities`, { headers }),
        fetch(`${API_URL}/api/superadmin/colleges`, { headers }),
        fetch(`${API_URL}/api/superadmin/students`, { headers }),
        fetch(`${API_URL}/api/superadmin/all-admins`, { headers }),
        fetch(`${API_URL}/api/plans?type=university`, { headers }),
        fetch(`${API_URL}/api/superadmin/plans/college-plans`, { headers }),
        fetch(`${API_URL}/api/superadmin/plans/student-plans`, { headers }),
        fetch(`${API_URL}/api/support/admin/tickets`, { headers })
      ]);

      const [uniData, colData, stuData, adminsData, uniPlansData, colPlansData, stuPlansData, ticketsData] = await Promise.all([
        uniRes.json(), colRes.json(), stuRes.json(), adminsRes.json(),
        uniPlansRes.json(), colPlansRes.json(), stuPlansRes.json(), ticketsRes.json()
      ]);

      const admins = Array.isArray(adminsData) ? adminsData : [];
      const universityAdmins = admins.filter(a => a.role === 'university_admin');
      const collegeAdmins = admins.filter(a => a.role === 'college_admin');
      const deptAdmins = admins.filter(a => a.role === 'course_admin');

      setData({
        universities: uniData.universities || [],
        colleges: colData.colleges || [],
        students: stuData.students || [],
        universityAdmins,
        collegeAdmins,
        deptAdmins,
        supportTickets: ticketsData.tickets || []
      });

      setPlans({
        university: uniPlansData.plans || [],
        college: colPlansData || [],
        student: stuPlansData || []
      });

      setStats({
        universities: uniData.universities?.length || 0,
        colleges: colData.colleges?.length || 0,
        students: stuData.students?.length || 0,
        universityAdmins: universityAdmins.length,
        collegeAdmins: collegeAdmins.length,
        deptAdmins: deptAdmins.length,
        openTickets: ticketsData.open || 0
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (endpoint, postData) => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(postData)
      });
      if (res.ok) {
        setShowModal(null);
        setFormData({});
        fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create');
      }
    } catch (error) {
      console.error('Error creating:', error);
    }
  };

  const handleTogglePlan = async (endpoint, id, currentStatus) => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) fetchAllData();
    } catch (error) {
      console.error('Error toggling plan:', error);
    }
  };

  const styles = {
    container: { padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '1rem 1.5rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    title: { fontSize: '28px', fontWeight: '700', background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
    tabs: { display: 'flex', gap: '6px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(248,250,252,0.8))', padding: '6px', borderRadius: '14px', width: 'fit-content', backdropFilter: 'blur(10px)', border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    tab: (active) => ({ padding: '10px 20px', cursor: 'pointer', borderRadius: '10px', fontSize: '14px', fontWeight: '600', background: active ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'transparent', color: active ? '#FFFFFF' : '#64748b', border: 'none', boxShadow: active ? '0 4px 14px rgba(139,92,246,0.4)' : 'none', transition: 'all 0.2s ease' }),
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' },
    statCard: { background: 'linear-gradient(135deg, #ffffff, #f8fafc)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(226,232,240,0.8)', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' },
    statValue: { fontSize: '36px', fontWeight: '700', background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
    statValue2: (color) => ({ fontSize: '36px', fontWeight: '700', background: `linear-gradient(135deg, ${color}, ${color}cc)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }),
    statLabel: { fontSize: '13px', color: '#64748b', marginTop: '6px', fontWeight: '500' },
    section: { background: 'linear-gradient(135deg, #ffffff, #f8fafc)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(226,232,240,0.8)', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s ease' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0 },
    th: { textAlign: 'left', padding: '14px 16px', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' },
    td: { padding: '14px 16px', fontSize: '14px', color: '#334155', borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease' },
    badge: (color) => ({ padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: `linear-gradient(135deg, ${color}20, ${color}10)`, color }),
    btn: (variant) => ({ padding: '10px 18px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', border: 'none', background: variant === 'primary' ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : variant === 'danger' ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', color: variant === 'outline' ? '#475569' : 'white', fontWeight: '600', transition: 'all 0.2s ease', boxShadow: variant !== 'outline' ? '0 4px 14px rgba(0,0,0,0.1)' : 'none' }),
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { background: 'linear-gradient(135deg, #ffffff, #f8fafc)', borderRadius: '20px', padding: '32px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' },
    input: { width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', background: '#ffffff', color: '#1e293b', transition: 'all 0.2s ease' },
    select: { width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', background: '#ffffff', color: '#1e293b', transition: 'all 0.2s ease', cursor: 'pointer' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'universities', label: 'Universities' },
    { key: 'colleges', label: 'Colleges' },
    { key: 'students', label: 'Students' },
    { key: 'admins', label: 'Admins' },
    { key: 'plans', label: 'Plans' },
    { key: 'support', label: 'Support' }
  ];

  const openModal = (type) => {
    setFormData({});
    setShowModal(type);
  };

  const renderOverview = () => (
    <>
      <div style={styles.statsGrid}>
        <div style={styles.statCard} onClick={() => setActiveTab('universities')}>
          <p style={styles.statValue}>{stats.universities}</p>
          <p style={styles.statLabel}>Universities</p>
        </div>
        <div style={styles.statCard} onClick={() => setActiveTab('colleges')}>
          <p style={styles.statValue2('#3B82F6')}>{stats.colleges}</p>
          <p style={styles.statLabel}>Colleges</p>
        </div>
        <div style={styles.statCard} onClick={() => setActiveTab('students')}>
          <p style={styles.statValue2('#10B981')}>{stats.students}</p>
          <p style={styles.statLabel}>Students</p>
        </div>
        <div style={styles.statCard} onClick={() => setActiveTab('admins')}>
          <p style={styles.statValue2('#F59E0B')}>{stats.universityAdmins + stats.collegeAdmins + stats.deptAdmins}</p>
          <p style={styles.statLabel}>Total Admins</p>
        </div>
        <div style={styles.statCard} onClick={() => setActiveTab('support')}>
          <p style={styles.statValue2('#EF4444')}>{stats.openTickets}</p>
          <p style={styles.statLabel}>Open Tickets</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Recent Universities</h3>
            <button style={styles.btn('primary')} onClick={() => openModal('university')}>+ Add</button>
          </div>
          {data.universities.slice(0, 5).map(u => (
            <div key={u._id} style={{ padding: '12px 0', borderBottom: '1px solid #E5E7EB' }}>
              <strong>{u.name}</strong><br/>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>{u.city}, {u.state} | {u.code}</span>
            </div>
          ))}
          {data.universities.length === 0 && <p style={{ color: '#6B7280', textAlign: 'center', padding: '20px' }}>No universities</p>}
        </div>
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Recent Colleges</h3>
          </div>
          {data.colleges.slice(0, 5).map(c => {
            const uni = data.universities.find(u => u._id === c.university_id);
            return (
              <div key={c._id} style={{ padding: '12px 0', borderBottom: '1px solid #E5E7EB' }}>
                <strong>{c.name}</strong><br/>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>{uni?.name || 'N/A'} | {c.city}</span>
              </div>
            );
          })}
          {data.colleges.length === 0 && <p style={{ color: '#6B7280', textAlign: 'center', padding: '20px' }}>No colleges</p>}
        </div>
      </div>
    </>
  );

  const renderUniversities = () => (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>All Universities ({data.universities.length})</h2>
        <button style={styles.btn('primary')} onClick={() => openModal('university')}>+ Create University</button>
      </div>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Name</th><th style={styles.th}>Code</th><th style={styles.th}>Location</th><th style={styles.th}>Contact</th><th style={styles.th}>Colleges</th></tr></thead>
        <tbody>
          {data.universities.map(u => {
            const collegeCount = data.colleges.filter(c => c.university_id === u._id).length;
            return (
              <tr key={u._id}>
                <td style={styles.td}><strong>{u.name}</strong></td>
                <td style={styles.td}><span style={styles.badge('#7C3AED')}>{u.code}</span></td>
                <td style={styles.td}>{u.city}, {u.state}</td>
                <td style={styles.td}>{u.contact_email}</td>
                <td style={styles.td}>{collegeCount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderColleges = () => (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>All Colleges ({data.colleges.length})</h2>
      </div>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Name</th><th style={styles.th}>Code</th><th style={styles.th}>University</th><th style={styles.th}>Location</th><th style={styles.th}>Contact</th></tr></thead>
        <tbody>
          {data.colleges.map(c => {
            const uni = data.universities.find(u => u._id === c.university_id);
            return (
              <tr key={c._id}>
                <td style={styles.td}><strong>{c.name}</strong></td>
                <td style={styles.td}><span style={styles.badge('#3B82F6')}>{c.code}</span></td>
                <td style={styles.td}>{uni?.name || 'N/A'}</td>
                <td style={styles.td}>{c.city}, {c.state}</td>
                <td style={styles.td}>{c.contact_email}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderStudents = () => (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>All Students ({data.students.length})</h2>
      </div>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Name</th><th style={styles.th}>Email</th><th style={styles.th}>Mobile</th><th style={styles.th}>Status</th></tr></thead>
        <tbody>
          {data.students.map(s => (
            <tr key={s._id}>
              <td style={styles.td}><strong>{s.name}</strong></td>
              <td style={styles.td}>{s.email}</td>
              <td style={styles.td}>{s.mobile || 'N/A'}</td>
              <td style={styles.td}><span style={styles.badge('#10B981')}>Active</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAdmins = () => (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>All Admins</h2>
        <button style={styles.btn('primary')} onClick={() => openModal('universityAdmin')}>+ Create Admin</button>
      </div>
      
      <h4 style={{ margin: '20px 0 10px', fontSize: '14px', color: '#6B7280', textTransform: 'uppercase' }}>University Admins ({data.universityAdmins.length})</h4>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Name</th><th style={styles.th}>Email</th><th style={styles.th}>University</th><th style={styles.th}>Role</th></tr></thead>
        <tbody>
          {data.universityAdmins.map(a => {
            const uni = data.universities.find(u => u._id === a.university_id);
            return (
              <tr key={a._id}>
                <td style={styles.td}><strong>{a.name}</strong></td>
                <td style={styles.td}>{a.email}</td>
                <td style={styles.td}>{uni?.name || 'N/A'}</td>
                <td style={styles.td}><span style={styles.badge('#7C3AED')}>University Admin</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h4 style={{ margin: '20px 0 10px', fontSize: '14px', color: '#6B7280', textTransform: 'uppercase' }}>College Admins ({data.collegeAdmins.length})</h4>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Name</th><th style={styles.th}>Email</th><th style={styles.th}>College</th><th style={styles.th}>University</th></tr></thead>
        <tbody>
          {data.collegeAdmins.map(a => {
            const col = data.colleges.find(c => c._id === a.college_id);
            const uni = col ? data.universities.find(u => u._id === col.university_id) : null;
            return (
              <tr key={a._id}>
                <td style={styles.td}><strong>{a.name}</strong></td>
                <td style={styles.td}>{a.email}</td>
                <td style={styles.td}>{col?.name || 'N/A'}</td>
                <td style={styles.td}>{uni?.name || 'N/A'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h4 style={{ margin: '20px 0 10px', fontSize: '14px', color: '#6B7280', textTransform: 'uppercase' }}>Department Admins ({data.deptAdmins.length})</h4>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Name</th><th style={styles.th}>Email</th><th style={styles.th}>Department</th><th style={styles.th}>College</th></tr></thead>
        <tbody>
          {data.deptAdmins.map(a => {
            const col = data.colleges.find(c => c._id === a.college_id);
            return (
              <tr key={a._id}>
                <td style={styles.td}><strong>{a.name}</strong></td>
                <td style={styles.td}>{a.email}</td>
                <td style={styles.td}>{a.department || 'N/A'}</td>
                <td style={styles.td}>{col?.name || 'N/A'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderPlans = () => (
    <>
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>University Plans ({plans.university.length})</h2>
          <button style={styles.btn('primary')} onClick={() => openModal('universityPlan')}>+ Create Plan</button>
        </div>
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>Plan Name</th><th style={styles.th}>Price</th><th style={styles.th}>Billing</th><th style={styles.th}>AI</th><th style={styles.th}>Max Colleges</th><th style={styles.th}>Status</th><th style={styles.th}>Actions</th></tr></thead>
          <tbody>
            {plans.university.map(p => (
              <tr key={p.id}>
                <td style={styles.td}><strong>{p.plan_name}</strong></td>
                <td style={styles.td}>₹{p.price}</td>
                <td style={styles.td}>{p.billing_period}</td>
                <td style={styles.td}><span style={styles.badge(p.features?.ai_enabled ? '#10B981' : '#6B7280')}>{p.features?.ai_enabled ? 'Yes' : 'No'}</span></td>
                <td style={styles.td}>{p.features?.max_colleges === -1 ? 'Unlimited' : p.features?.max_colleges}</td>
                <td style={styles.td}><span style={styles.badge(p.is_active ? '#10B981' : '#EF4444')}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                <td style={styles.td}>
                  <button style={styles.btn('outline')} onClick={() => handleTogglePlan('/api/plans/plans', p.id, p.is_active)}>{p.is_active ? 'Deactivate' : 'Activate'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>College Plans ({plans.college.length})</h2>
          <button style={styles.btn('primary')} onClick={() => openModal('collegePlan')}>+ Create Plan</button>
        </div>
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>Plan Name</th><th style={styles.th}>Price</th><th style={styles.th}>Max Courses</th><th style={styles.th}>Max Students</th><th style={styles.th}>Status</th><th style={styles.th}>Actions</th></tr></thead>
          <tbody>
            {plans.college.map(p => (
              <tr key={p._id}>
                <td style={styles.td}><strong>{p.plan_name}</strong></td>
                <td style={styles.td}>₹{p.price}</td>
                <td style={styles.td}>{p.max_courses}</td>
                <td style={styles.td}>{p.max_students}</td>
                <td style={styles.td}><span style={styles.badge(p.is_active ? '#10B981' : '#EF4444')}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                <td style={styles.td}>
                  <button style={styles.btn('outline')} onClick={() => handleTogglePlan('/api/superadmin/plans/college-plans', p._id, p.is_active)}>{p.is_active ? 'Deactivate' : 'Activate'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Student Plans ({plans.student.length})</h2>
          <button style={styles.btn('primary')} onClick={() => openModal('studentPlan')}>+ Create Plan</button>
        </div>
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>Plan Name</th><th style={styles.th}>Price</th><th style={styles.th}>Credits</th><th style={styles.th}>Status</th><th style={styles.th}>Actions</th></tr></thead>
          <tbody>
            {plans.student.map(p => (
              <tr key={p._id}>
                <td style={styles.td}><strong>{p.plan_name}</strong></td>
                <td style={styles.td}>₹{p.price}</td>
                <td style={styles.td}>{p.credits}</td>
                <td style={styles.td}><span style={styles.badge(p.is_active ? '#10B981' : '#EF4444')}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                <td style={styles.td}>
                  <button style={styles.btn('outline')} onClick={() => handleTogglePlan('/api/superadmin/plans/student-plans', p._id, p.is_active)}>{p.is_active ? 'Deactivate' : 'Activate'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderSupport = () => (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Support Tickets ({data.supportTickets.length})</h2>
      </div>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>ID</th><th style={styles.th}>Subject</th><th style={styles.th}>Category</th><th style={styles.th}>Priority</th><th style={styles.th}>Status</th></tr></thead>
        <tbody>
          {data.supportTickets.map(t => (
            <tr key={t.id}>
              <td style={styles.td}><strong>{t.id?.slice(-6)}</strong></td>
              <td style={styles.td}>{t.subject}</td>
              <td style={styles.td}><span style={styles.badge('#3B82F6')}>{t.category}</span></td>
              <td style={styles.td}><span style={styles.badge(t.priority === 'high' ? '#EF4444' : '#F59E0B')}>{t.priority}</span></td>
              <td style={styles.td}><span style={styles.badge(t.status === 'open' ? '#10B981' : '#F59E0B')}>{t.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;
    const handleSubmit = (e) => {
      e.preventDefault();
      if (showModal === 'university') handleCreate('/api/superadmin/universities', formData);
      else if (showModal === 'universityAdmin') handleCreate('/api/superadmin/university-admins', formData);
      else if (showModal === 'universityPlan') handleCreate('/api/plans/plans', { ...formData, plan_type: 'university', features: { ai_enabled: formData.ai_enabled || false, max_colleges: parseInt(formData.max_colleges) || -1 } });
      else if (showModal === 'collegePlan') handleCreate('/api/superadmin/plans/college-plans', { ...formData, max_courses: parseInt(formData.max_courses), max_students: parseInt(formData.max_students) });
      else if (showModal === 'studentPlan') handleCreate('/api/superadmin/plans/student-plans', { ...formData, credits: parseInt(formData.credits) });
    };

    return (
      <div style={styles.modal} onClick={() => setShowModal(null)}>
        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
            {showModal === 'university' && 'Create University'}
            {showModal === 'universityAdmin' && 'Create University Admin'}
            {showModal === 'universityPlan' && 'Create University Plan'}
            {showModal === 'collegePlan' && 'Create College Plan'}
            {showModal === 'studentPlan' && 'Create Student Plan'}
          </h2>
          <form onSubmit={handleSubmit}>
            {showModal === 'university' && (
              <>
                <div style={styles.formGroup}><label style={styles.label}>Name *</label><input style={styles.input} value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                <div style={styles.formGroup}><label style={styles.label}>Code *</label><input style={styles.input} value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} required /></div>
                <div style={styles.formGroup}><label style={styles.label}>Address *</label><input style={styles.input} value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} required /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={styles.formGroup}><label style={styles.label}>City *</label><input style={styles.input} value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} required /></div>
                  <div style={styles.formGroup}><label style={styles.label}>State *</label><input style={styles.input} value={formData.state || ''} onChange={e => setFormData({...formData, state: e.target.value})} required /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={styles.formGroup}><label style={styles.label}>Email *</label><input style={styles.input} type="email" value={formData.contact_email || ''} onChange={e => setFormData({...formData, contact_email: e.target.value})} required /></div>
                  <div style={styles.formGroup}><label style={styles.label}>Phone *</label><input style={styles.input} value={formData.contact_phone || ''} onChange={e => setFormData({...formData, contact_phone: e.target.value})} required /></div>
                </div>
              </>
            )}
            {showModal === 'universityAdmin' && (
              <>
                <div style={styles.formGroup}><label style={styles.label}>Name *</label><input style={styles.input} value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                <div style={styles.formGroup}><label style={styles.label}>Email *</label><input style={styles.input} type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
                <div style={styles.formGroup}><label style={styles.label}>Password *</label><input style={styles.input} type="password" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} required /></div>
                <div style={styles.formGroup}><label style={styles.label}>University *</label><select style={styles.select} value={formData.university_id || ''} onChange={e => setFormData({...formData, university_id: e.target.value})} required><option value="">Select University</option>{data.universities.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}</select></div>
              </>
            )}
            {showModal === 'universityPlan' && (
              <>
                <div style={styles.formGroup}><label style={styles.label}>Plan Name *</label><input style={styles.input} value={formData.plan_name || ''} onChange={e => setFormData({...formData, plan_name: e.target.value})} required /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={styles.formGroup}><label style={styles.label}>Price (₹) *</label><input style={styles.input} type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required /></div>
                  <div style={styles.formGroup}><label style={styles.label}>Billing *</label><select style={styles.select} value={formData.billing_period || 'monthly'} onChange={e => setFormData({...formData, billing_period: e.target.value})}><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></div>
                </div>
                <div style={styles.formGroup}><label style={styles.label}>Max Colleges (-1 for unlimited)</label><input style={styles.input} type="number" value={formData.max_colleges || -1} onChange={e => setFormData({...formData, max_colleges: parseInt(e.target.value)})} /></div>
                <div style={styles.formGroup}><label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" checked={formData.ai_enabled} onChange={e => setFormData({...formData, ai_enabled: e.target.checked})} /> AI Enabled</label></div>
              </>
            )}
            {showModal === 'collegePlan' && (
              <>
                <div style={styles.formGroup}><label style={styles.label}>Plan Name *</label><input style={styles.input} value={formData.plan_name || ''} onChange={e => setFormData({...formData, plan_name: e.target.value})} required /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={styles.formGroup}><label style={styles.label}>Price (₹) *</label><input style={styles.input} type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required /></div>
                  <div style={styles.formGroup}><label style={styles.label}>Billing *</label><select style={styles.select} value={formData.billing_period || 'monthly'} onChange={e => setFormData({...formData, billing_period: e.target.value})}><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={styles.formGroup}><label style={styles.label}>Max Courses *</label><input style={styles.input} type="number" value={formData.max_courses || ''} onChange={e => setFormData({...formData, max_courses: e.target.value})} required /></div>
                  <div style={styles.formGroup}><label style={styles.label}>Max Students *</label><input style={styles.input} type="number" value={formData.max_students || ''} onChange={e => setFormData({...formData, max_students: e.target.value})} required /></div>
                </div>
              </>
            )}
            {showModal === 'studentPlan' && (
              <>
                <div style={styles.formGroup}><label style={styles.label}>Plan Name *</label><input style={styles.input} value={formData.plan_name || ''} onChange={e => setFormData({...formData, plan_name: e.target.value})} required /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={styles.formGroup}><label style={styles.label}>Price (₹) *</label><input style={styles.input} type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required /></div>
                  <div style={styles.formGroup}><label style={styles.label}>Credits *</label><input style={styles.input} type="number" value={formData.credits || ''} onChange={e => setFormData({...formData, credits: e.target.value})} required /></div>
                </div>
                <div style={styles.formGroup}><label style={styles.label}>Description</label><input style={styles.input} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
              </>
            )}
            <div style={styles.modalActions}>
              <button type="button" style={styles.btn('outline')} onClick={() => setShowModal(null)}>Cancel</button>
              <button type="submit" style={styles.btn('primary')}>Create</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) return <div style={{ ...styles.container, textAlign: 'center', padding: '60px' }}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Platform Dashboard</h1>
        <span style={{ fontSize: '14px', color: '#6B7280' }}>SuperAdmin</span>
      </div>

      <div style={styles.tabs}>
        {tabs.map(t => (
          <button key={t.key} style={styles.tab(activeTab === t.key)} onClick={() => setActiveTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'universities' && renderUniversities()}
      {activeTab === 'colleges' && renderColleges()}
      {activeTab === 'students' && renderStudents()}
      {activeTab === 'admins' && renderAdmins()}
      {activeTab === 'plans' && renderPlans()}
      {activeTab === 'support' && renderSupport()}

      {renderModal()}
    </div>
  );
};

export default SuperAdminDashboard;
