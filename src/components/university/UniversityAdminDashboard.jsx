import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UniversityAdminDashboard = ({ tab: initialTab }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const [loading, setLoading] = useState(true);
  const [myUniversity, setMyUniversity] = useState(null);
  const [data, setData] = useState({
    colleges: [],
    collegeAdmins: [],
    deptAdmins: [],
    applications: [],
    subscription: null,
    supportTickets: [],
    supportUsers: []
  });
  const [stats, setStats] = useState({
    colleges: 0, collegeAdmins: 0, deptAdmins: 0, applications: 0,
    openTickets: 0, hasSubscription: false
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
      const [uniRes, colRes, adminRes, statsRes, ticketsRes, supportUsersRes] = await Promise.all([
        fetch(`${API_URL}/api/university-admin/my-university`, { headers }),
        fetch(`${API_URL}/api/university-admin/colleges`, { headers }),
        fetch(`${API_URL}/api/university-admin/college-admins`, { headers }),
        fetch(`${API_URL}/api/university-admin/stats`, { headers }),
        fetch(`${API_URL}/api/support/admin/tickets`, { headers }).catch(() => ({ json: () => ({ tickets: [] }) })),
        fetch(`${API_URL}/api/university-admin/support-users`, { headers }).catch(() => ({ json: () => [] }))
      ]);

      const [uniData, colData, adminData, statsData, ticketsData, supportUsersData] = await Promise.all([
        uniRes.json(), colRes.json(), adminRes.json(), statsRes.json(), ticketsRes.json(), supportUsersRes.json()
      ]);

      setMyUniversity(uniData.university);
      setData({
        colleges: colData.colleges || [],
        collegeAdmins: adminData || [],
        deptAdmins: [],
        applications: [],
        subscription: null,
        supportTickets: ticketsData.tickets || [],
        supportUsers: supportUsersData || []
      });

      setStats({
        colleges: colData.colleges?.length || 0,
        collegeAdmins: adminData?.length || 0,
        deptAdmins: statsData.department_admin_count || 0,
        applications: statsData.application_count || 0,
        openTickets: ticketsData.open || 0,
        hasSubscription: false
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (endpoint, data) => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        setShowModal(null);
        setFormData({});
        fetchAllData();
      }
    } catch (error) {
      console.error('Error creating:', error);
    }
  };

  const handleDelete = async (endpoint, id) => {
    if (!window.confirm('Are you sure?')) return;
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchAllData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const styles = {
    container: { padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '1rem 1.5rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    title: { fontSize: '28px', fontWeight: '700', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
    tabs: { display: 'flex', gap: '6px', marginBottom: '24px', background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(248,250,252,0.8))', padding: '6px', borderRadius: '14px', width: 'fit-content', backdropFilter: 'blur(10px)', border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    tab: (active) => ({ padding: '10px 20px', cursor: 'pointer', borderRadius: '10px', fontSize: '14px', fontWeight: '600', background: active ? 'linear-gradient(135deg, #7c3aed, #8b5cf6)' : 'transparent', color: active ? '#FFFFFF' : '#64748b', border: 'none', boxShadow: active ? '0 4px 14px rgba(124,58,237,0.4)' : 'none', transition: 'all 0.2s ease' }),
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' },
    statCard: { background: 'linear-gradient(135deg, #ffffff, #f8fafc)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' },
    statValue: { fontSize: '36px', fontWeight: '700', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
    statLabel: { fontSize: '13px', color: '#64748b', marginTop: '6px', fontWeight: '500' },
    section: { background: 'linear-gradient(135deg, #ffffff, #f8fafc)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(226,232,240,0.8)', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s ease' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0 },
    th: { textAlign: 'left', padding: '14px 16px', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' },
    td: { padding: '14px 16px', fontSize: '14px', color: '#334155', borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease' },
    badge: (color) => ({ padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: `linear-gradient(135deg, ${color}20, ${color}10)`, color }),
    btn: (variant) => ({ padding: '10px 18px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', border: 'none', background: variant === 'primary' ? 'linear-gradient(135deg, #7c3aed, #8b5cf6)' : variant === 'danger' ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', color: variant === 'outline' ? '#475569' : 'white', marginLeft: '8px', fontWeight: '600', transition: 'all 0.2s ease', boxShadow: variant !== 'outline' ? '0 4px 14px rgba(0,0,0,0.1)' : 'none' }),
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { background: 'linear-gradient(135deg, #ffffff, #f8fafc)', borderRadius: '20px', padding: '32px', width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' },
    input: { width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', background: '#ffffff', color: '#1e293b', transition: 'all 0.2s ease' },
    select: { width: '100%', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', background: '#ffffff', color: '#1e293b', transition: 'all 0.2s ease', cursor: 'pointer' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }
  };

  const renderModal = (type) => {
    if (!showModal) return null;
    const handleSubmit = (e) => {
      e.preventDefault();
      if (type === 'college') handleCreate('/api/university-admin/colleges', formData);
      else if (type === 'collegeAdmin') handleCreate('/api/university-admin/college-admins', formData);
      else if (type === 'supportUser') handleCreate('/api/university-admin/support-users', formData);
    };

    return (
      <div style={styles.modal} onClick={() => setShowModal(null)}>
        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
            {type === 'college' ? 'Create College' : type === 'collegeAdmin' ? 'Create College Admin' : 'Create Support User'}
          </h2>
          <form onSubmit={handleSubmit}>
            {type === 'college' && (
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
                <div style={styles.formGroup}><label style={styles.label}>Website</label><input style={styles.input} value={formData.website || ''} onChange={e => setFormData({...formData, website: e.target.value})} /></div>
              </>
            )}
            {type === 'collegeAdmin' && (
              <>
                <div style={styles.formGroup}><label style={styles.label}>Name *</label><input style={styles.input} value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                <div style={styles.formGroup}><label style={styles.label}>Email *</label><input style={styles.input} type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
                <div style={styles.formGroup}><label style={styles.label}>Password *</label><input style={styles.input} type="password" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} required /></div>
                <div style={styles.formGroup}><label style={styles.label}>College *</label><select style={styles.select} value={formData.college_id || ''} onChange={e => setFormData({...formData, college_id: e.target.value})} required><option value="">Select College</option>{data.colleges.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
              </>
            )}
            {type === 'supportUser' && (
              <>
                <div style={styles.formGroup}><label style={styles.label}>Name *</label><input style={styles.input} value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
                <div style={styles.formGroup}><label style={styles.label}>Email *</label><input style={styles.input} type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
                <div style={styles.formGroup}><label style={styles.label}>Password *</label><input style={styles.input} type="password" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} required /></div>
                <div style={styles.formGroup}><label style={styles.label}>Mobile</label><input style={styles.input} value={formData.mobile || ''} onChange={e => setFormData({...formData, mobile: e.target.value})} /></div>
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

  const renderOverview = () => (
    <>
      {myUniversity && (
        <div style={{ ...styles.section, background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-30%', right: '-20%', width: '60%', height: '200%', background: 'radial-gradient(ellipse, rgba(255,255,255,0.15) 0%, transparent 70%)', animation: 'shimmer 3s ease-in-out infinite' }} />
          <h3 style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 8px 0', fontWeight: '600', letterSpacing: '1px' }}>MY UNIVERSITY</h3>
          <h2 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 8px 0' }}>{myUniversity.name}</h2>
          <p style={{ margin: 0, opacity: 0.9 }}>{myUniversity.city}, {myUniversity.state}</p>
          <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>{myUniversity.contact_email} | {myUniversity.contact_phone}</p>
        </div>
      )}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}><p style={styles.statValue}>{stats.colleges}</p><p style={styles.statLabel}>Colleges</p></div>
        <div style={styles.statCard}><p style={{...styles.statValue, color: '#3B82F6'}}>{stats.collegeAdmins}</p><p style={styles.statLabel}>College Admins</p></div>
        <div style={styles.statCard}><p style={{...styles.statValue, color: '#10B981'}}>{stats.deptAdmins}</p><p style={styles.statLabel}>Dept Admins</p></div>
        <div style={styles.statCard}><p style={{...styles.statValue, color: '#F59E0B'}}>{stats.applications}</p><p style={styles.statLabel}>Applications</p></div>
        <div style={styles.statCard}><p style={{...styles.statValue, color: '#EF4444'}}>{stats.openTickets}</p><p style={styles.statLabel}>Open Tickets</p></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button style={styles.btn('primary')} onClick={() => { setShowModal('college'); setFormData({}); }}>+ Add College</button>
            <button style={{...styles.btn('primary'), backgroundColor: '#3B82F6'}} onClick={() => { setShowModal('collegeAdmin'); setFormData({}); }}>+ Add College Admin</button>
            <button style={{...styles.btn('outline')}} onClick={() => setActiveTab('colleges')}>View Colleges</button>
          </div>
        </div>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Recent Colleges</h3>
          {data.colleges.slice(0, 5).map(c => (
            <div key={c._id} style={{ padding: '12px 0', borderBottom: '1px solid #E5E7EB' }}>
              <strong>{c.name}</strong><br/><span style={{ fontSize: '12px', color: '#6B7280' }}>{c.city}, {c.state}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderColleges = () => (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Colleges ({data.colleges.length})</h2>
        <button style={styles.btn('primary')} onClick={() => { setShowModal('college'); setFormData({}); }}>+ Add College</button>
      </div>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Name</th><th style={styles.th}>Code</th><th style={styles.th}>Location</th><th style={styles.th}>Contact</th><th style={styles.th}>Actions</th></tr></thead>
        <tbody>
          {data.colleges.map(c => (
            <tr key={c._id}>
              <td style={styles.td}><strong>{c.name}</strong></td>
              <td style={styles.td}><span style={styles.badge('#185FA5')}>{c.code}</span></td>
              <td style={styles.td}>{c.city}, {c.state}</td>
              <td style={styles.td}>{c.contact_email}</td>
              <td style={styles.td}>
                <button style={styles.btn('outline')}>View</button>
                <button style={styles.btn('outline')}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCollegeAdmins = () => (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>College Admins ({data.collegeAdmins.length})</h2>
        <button style={styles.btn('primary')} onClick={() => { setShowModal('collegeAdmin'); setFormData({}); }}>+ Add College Admin</button>
      </div>
      <table style={styles.table}>
        <thead><tr><th style={styles.th}>Name</th><th style={styles.th}>Email</th><th style={styles.th}>College</th><th style={styles.th}>Actions</th></tr></thead>
        <tbody>
          {data.collegeAdmins.map(a => {
            const college = data.colleges.find(c => c._id === a.college_id);
            return (
              <tr key={a._id}>
                <td style={styles.td}><strong>{a.name}</strong></td>
                <td style={styles.td}>{a.email}</td>
                <td style={styles.td}>{college?.name || 'N/A'}</td>
                <td style={styles.td}>
                  <button style={styles.btn('outline')}>Edit</button>
                  <button style={styles.btn('danger')} onClick={() => handleDelete('/api/admin/department-admins', a._id)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  const renderSupportUsers = () => (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>University Support Users ({data.supportUsers.length})</h2>
        <button style={styles.btn('primary')} onClick={() => { setShowModal('supportUser'); setFormData({}); }}>+ Add Support User</button>
      </div>
      {data.supportUsers.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6B7280', padding: '40px' }}>No support users created yet</p>
      ) : (
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>Name</th><th style={styles.th}>Email</th><th style={styles.th}>Mobile</th><th style={styles.th}>Actions</th></tr></thead>
          <tbody>
            {data.supportUsers.map(user => (
              <tr key={user._id}>
                <td style={styles.td}><strong>{user.name}</strong></td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.mobile || 'N/A'}</td>
                <td style={styles.td}>
                  <button style={styles.btn('danger')} onClick={() => handleDelete('/api/university-admin/support-users', user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderSupport = () => (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={styles.sectionTitle}>Support Tickets ({data.supportTickets.length})</h2>
      </div>
      {data.supportTickets.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#6B7280', padding: '40px' }}>No support tickets</p>
      ) : (
        <table style={styles.table}>
          <thead><tr><th style={styles.th}>ID</th><th style={styles.th}>Subject</th><th style={styles.th}>Category</th><th style={styles.th}>Priority</th><th style={styles.th}>Status</th><th style={styles.th}>Actions</th></tr></thead>
          <tbody>
            {data.supportTickets.map(t => (
              <tr key={t.id}>
                <td style={styles.td}><strong>{t.id?.slice(-6)}</strong></td>
                <td style={styles.td}>{t.subject}</td>
                <td style={styles.td}><span style={styles.badge('#3B82F6')}>{t.category}</span></td>
                <td style={styles.td}><span style={styles.badge(t.priority === 'high' ? '#EF4444' : '#F59E0B')}>{t.priority}</span></td>
                <td style={styles.td}><span style={styles.badge(t.status === 'open' ? '#10B981' : '#F59E0B')}>{t.status}</span></td>
                <td style={styles.td}><button style={styles.btn('outline')}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  if (loading) return <div style={{ ...styles.container, textAlign: 'center', padding: '60px' }}>Loading dashboard...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>University Dashboard</h1>
        <span style={{ fontSize: '14px', color: '#6B7280' }}>{myUniversity?.name || 'University Admin'}</span>
      </div>

      <div style={styles.tabs}>
        {['overview', 'colleges', 'college-admins', 'support-users', 'support'].map(tab => (
          <button key={tab} style={styles.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>
            {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'colleges' && renderColleges()}
      {activeTab === 'college-admins' && renderCollegeAdmins()}
      {activeTab === 'support-users' && renderSupportUsers()}
      {activeTab === 'support' && renderSupport()}

      {renderModal(showModal)}
    </div>
  );
};

export default UniversityAdminDashboard;
