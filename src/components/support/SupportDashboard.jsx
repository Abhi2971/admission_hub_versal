import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://admission-hub-render.onrender.com';

const SupportDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [ticketsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/support/admin/tickets`, { headers }),
        fetch(`${API_URL}/api/support/admin/stats`, { headers })
      ]);

      const [ticketsData, statsData] = await Promise.all([
        ticketsRes.json(), statsRes.json()
      ]);

      setTickets(ticketsData.tickets || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (ticketId, status) => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/api/support/admin/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchData();
        setSelectedTicket(null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleReply = async (ticketId) => {
    if (!reply.trim()) return;
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`${API_URL}/api/support/admin/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: reply })
      });
      if (res.ok) {
        setReply('');
        fetchData();
        setSelectedTicket(null);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const styles = {
    container: { padding: '24px', maxWidth: '1400px', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '1rem 1.5rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
    title: { fontSize: '28px', fontWeight: '700', background: 'linear-gradient(135deg, #f59e0b, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' },
    statCard: (color) => ({ background: 'linear-gradient(135deg, #ffffff, #f8fafc)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(226,232,240,0.8)', borderLeft: `4px solid ${color}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }),
    statValue: { fontSize: '32px', fontWeight: '700', color: '#1e293b', margin: 0 },
    statLabel: { fontSize: '13px', color: '#64748b', marginTop: '6px', fontWeight: '500' },
    section: { background: 'linear-gradient(135deg, #ffffff, #f8fafc)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(226,232,240,0.8)', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s ease' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    sectionTitle: { fontSize: '18px', fontWeight: '600', color: '#1e293b', margin: 0 },
    filters: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
    filterBtn: (active) => ({ padding: '10px 18px', borderRadius: '20px', fontSize: '13px', cursor: 'pointer', border: 'none', background: active ? 'linear-gradient(135deg, #f59e0b, #f97316)' : 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', color: active ? '#FFFFFF' : '#475569', fontWeight: '600', transition: 'all 0.2s ease', boxShadow: active ? '0 4px 14px rgba(245,158,11,0.4)' : 'none' }),
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0 },
    th: { textAlign: 'left', padding: '14px 16px', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e2e8f0', background: '#f8fafc' },
    td: { padding: '14px 16px', fontSize: '14px', color: '#334155', borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s ease' },
    badge: (color) => ({ padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: `linear-gradient(135deg, ${color}20, ${color}10)`, color }),
    badgeStatus: (status) => {
      const colors = { open: '#10B981', in_progress: '#F59E0B', resolved: '#3B82F6', closed: '#6B7280' };
      return { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: `linear-gradient(135deg, ${colors[status]}20, ${colors[status]}10)`, color: colors[status] || '#6B7280' };
    },
    badgePriority: (priority) => {
      const colors = { low: '#10B981', medium: '#F59E0B', high: '#EF4444' };
      return { padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: `linear-gradient(135deg, ${colors[priority]}20, ${colors[priority]}10)`, color: colors[priority] || '#6B7280' };
    },
    btn: (variant) => ({ padding: '10px 18px', borderRadius: '10px', fontSize: '13px', cursor: 'pointer', border: 'none', background: variant === 'primary' ? 'linear-gradient(135deg, #f59e0b, #f97316)' : variant === 'outline' ? 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' : '#6B7280', color: variant === 'outline' ? '#475569' : 'white', marginLeft: '8px', fontWeight: '600', transition: 'all 0.2s ease', boxShadow: variant === 'primary' ? '0 4px 14px rgba(245,158,11,0.4)' : 'none' }),
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { background: 'linear-gradient(135deg, #ffffff, #f8fafc)', borderRadius: '20px', padding: '32px', width: '700px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
    textarea: { width: '100%', minHeight: '100px', padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", resize: 'vertical', boxSizing: 'border-box', background: '#ffffff', color: '#1e293b', transition: 'all 0.2s ease' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' },
    ticketCard: { padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '12px', cursor: 'pointer', transition: 'all 0.2s ease', background: 'linear-gradient(135deg, #f8fafc, #ffffff)' },
    ticketSubject: { fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px 0' },
    ticketMeta: { fontSize: '12px', color: '#64748b' }
  };

  const renderTicketModal = () => {
    if (!selectedTicket) return null;
    return (
      <div style={styles.modal} onClick={() => setSelectedTicket(null)}>
        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>{selectedTicket.subject}</h2>
              <span style={styles.badgePriority(selectedTicket.priority)}>{selectedTicket.priority}</span>
              <span style={{ ...styles.badgeStatus(selectedTicket.status), marginLeft: '8px' }}>{selectedTicket.status}</span>
            </div>
            <button style={{ ...styles.btn('outline'), margin: 0 }} onClick={() => setSelectedTicket(null)}>Close</button>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>Category: <strong>{selectedTicket.category}</strong></p>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>Created: {new Date(selectedTicket.created_at).toLocaleString()}</p>
            <div style={{ backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '8px' }}>
              <p style={{ margin: 0, color: '#374151' }}>{selectedTicket.description}</p>
            </div>
          </div>
          {selectedTicket.replies && selectedTicket.replies.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Conversation</h4>
              {selectedTicket.replies.map((r, i) => (
                <div key={i} style={{ padding: '12px', backgroundColor: r.by === 'support' ? '#E6F1FB' : '#F9FAFB', borderRadius: '8px', marginBottom: '8px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#374151' }}>{r.message}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#6B7280' }}>{r.by === 'support' ? 'Support' : 'User'} - {new Date(r.created_at || Date.now()).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Reply</label>
            <textarea style={styles.textarea} value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..." />
          </div>
          <div style={styles.modalActions}>
            <select style={{ padding: '8px 12px', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '13px' }} defaultValue="" onChange={e => e.target.value && handleStatusUpdate(selectedTicket.id, e.target.value)}>
              <option value="" disabled>Change Status</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <button style={styles.btn('outline')} onClick={() => setSelectedTicket(null)}>Cancel</button>
            <button style={styles.btn('primary')} onClick={() => handleReply(selectedTicket.id)} disabled={!reply.trim()}>Send Reply</button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div style={{ ...styles.container, textAlign: 'center', padding: '60px' }}>Loading support tickets...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Support Dashboard</h1>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard('#6B7280')}><p style={styles.statValue}>{stats.total}</p><p style={styles.statLabel}>Total</p></div>
        <div style={styles.statCard('#10B981')}><p style={styles.statValue}>{stats.open}</p><p style={styles.statLabel}>Open</p></div>
        <div style={styles.statCard('#F59E0B')}><p style={styles.statValue}>{stats.in_progress}</p><p style={styles.statLabel}>In Progress</p></div>
        <div style={styles.statCard('#3B82F6')}><p style={styles.statValue}>{stats.resolved}</p><p style={styles.statLabel}>Resolved</p></div>
        <div style={styles.statCard('#6B7280')}><p style={styles.statValue}>{stats.closed}</p><p style={styles.statLabel}>Closed</p></div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Tickets ({filteredTickets.length})</h2>
        </div>
        <div style={styles.filters}>
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map(f => (
            <button key={f} style={styles.filterBtn(filter === f)} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>
        {filteredTickets.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6B7280', padding: '40px' }}>No tickets found</p>
        ) : (
          filteredTickets.map(t => (
            <div key={t.id} style={styles.ticketCard} onClick={() => setSelectedTicket(t)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={styles.ticketSubject}>{t.subject}</h3>
                  <p style={styles.ticketMeta}>{t.category} | ID: {t.id?.slice(-6)} | {new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span style={styles.badgePriority(t.priority)}>{t.priority}</span>
                  <span style={{ ...styles.badgeStatus(t.status), marginLeft: '8px' }}>{t.status}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {renderTicketModal()}
    </div>
  );
};

export default SupportDashboard;
