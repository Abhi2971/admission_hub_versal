import React, { useState, useEffect, useCallback } from 'react';

const StudentSupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'general',
    priority: 'medium'
  });
  const [replyText, setReplyText] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState('all');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchTickets = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/support/tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const createTicket = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/support/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTicket)
      });
      if (response.ok) {
        setShowModal(false);
        setNewTicket({ subject: '', description: '', category: 'general', priority: 'medium' });
        fetchTickets();
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const addReply = async (ticketId) => {
    if (!replyText.trim()) return;
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/support/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: replyText })
      });
      if (response.ok) {
        setReplyText('');
        fetchTickets();
        fetchTicketDetail(ticketId);
      }
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const fetchTicketDetail = async (ticketId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/support/tickets/${ticketId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setSelectedTicket(data.ticket);
      }
    } catch (error) {
      console.error('Error fetching ticket:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: '#10B981',
      in_progress: '#F59E0B',
      resolved: '#3B82F6',
      closed: '#6B7280'
    };
    return colors[status] || '#6B7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      urgent: '#DC2626'
    };
    return colors[priority] || '#6B7280';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      general: '📋',
      application: '📝',
      payment: '💳',
      technical: '🔧',
      admission: '🎓',
      documents: '📄'
    };
    return icons[category] || '📋';
  };

  const filteredTickets = filter === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filter);

  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#1F2937',
      margin: 0
    },
    createBtn: {
      backgroundColor: '#185FA5',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    filters: {
      display: 'flex',
      gap: '12px',
      marginBottom: '20px'
    },
    filterBtn: (active) => ({
      padding: '8px 16px',
      border: '1px solid #E5E7EB',
      borderRadius: '20px',
      backgroundColor: active ? '#185FA5' : 'white',
      color: active ? 'white' : '#6B7280',
      cursor: 'pointer',
      fontSize: '13px'
    }),
    ticketsGrid: {
      display: 'grid',
      gridTemplateColumns: selectedTicket ? '1fr 400px' : '1fr',
      gap: '20px'
    },
    ticketCard: (status) => ({
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      border: status === 'open' ? '2px solid #10B981' : '1px solid #E5E7EB',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }),
    ticketHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    },
    ticketSubject: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1F2937',
      margin: 0
    },
    badge: (color) => ({
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'capitalize',
      backgroundColor: color + '20',
      color: color
    }),
    ticketMeta: {
      display: 'flex',
      gap: '16px',
      fontSize: '13px',
      color: '#6B7280'
    },
    ticketDesc: {
      fontSize: '14px',
      color: '#6B7280',
      marginTop: '12px',
      lineHeight: '1.5'
    },
    detailPanel: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #E5E7EB',
      maxHeight: 'calc(100vh - 200px)',
      overflowY: 'auto'
    },
    detailHeader: {
      marginBottom: '20px',
      paddingBottom: '16px',
      borderBottom: '1px solid #E5E7EB'
    },
    detailSubject: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1F2937',
      margin: '0 0 12px 0'
    },
    detailBadges: {
      display: 'flex',
      gap: '8px'
    },
    detailDesc: {
      fontSize: '14px',
      color: '#4B5563',
      lineHeight: '1.6',
      marginBottom: '20px'
    },
    repliesSection: {
      marginTop: '24px'
    },
    repliesTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: '16px'
    },
    replyCard: (isSupport) => ({
      padding: '16px',
      borderRadius: '12px',
      marginBottom: '12px',
      backgroundColor: isSupport ? '#F3F4F6' : '#EEF2FF',
      border: isSupport ? '1px solid #E5E7EB' : '1px solid #C7D2FE'
    }),
    replyHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px'
    },
    replyAuthor: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#1F2937'
    },
    replyTime: {
      fontSize: '12px',
      color: '#9CA3AF'
    },
    replyText: {
      fontSize: '14px',
      color: '#4B5563',
      lineHeight: '1.5'
    },
    replyInput: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px'
    },
    replyTextarea: {
      flex: 1,
      padding: '12px',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '80px'
    },
    replyBtn: {
      backgroundColor: '#185FA5',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '500'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6B7280'
    },
    closeBtn: {
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#9CA3AF',
      padding: '0'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      width: '500px',
      maxWidth: '90%'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    modalTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1F2937',
      margin: 0
    },
    formGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '6px'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: '#FFFFFF',
      color: '#111111',
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '14px',
      minHeight: '100px',
      resize: 'vertical',
      fontFamily: 'inherit',
      backgroundColor: '#FFFFFF',
      color: '#111111',
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: '#FFFFFF',
      color: '#111111',
    },
    modalActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      marginTop: '24px'
    },
    cancelBtn: {
      padding: '10px 20px',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      backgroundColor: 'white',
      color: '#6B7280',
      cursor: 'pointer',
      fontSize: '14px'
    },
    submitBtn: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: '#185FA5',
      color: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>
          Loading tickets...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Support Tickets</h1>
        <button style={styles.createBtn} onClick={() => setShowModal(true)}>
          <span>+</span> Create Ticket
        </button>
      </div>

      <div style={styles.filters}>
        {['all', 'open', 'in_progress', 'resolved', 'closed'].map(status => (
          <button
            key={status}
            style={styles.filterBtn(filter === status)}
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div style={styles.ticketsGrid}>
        <div>
          {filteredTickets.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <p>No tickets found</p>
            </div>
          ) : (
            filteredTickets.map(ticket => (
              <div
                key={ticket.id}
                style={styles.ticketCard(ticket.status)}
                onClick={() => fetchTicketDetail(ticket.id)}
              >
                <div style={styles.ticketHeader}>
                  <h3 style={styles.ticketSubject}>
                    {getCategoryIcon(ticket.category)} {ticket.subject}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={styles.badge(getStatusColor(ticket.status))}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span style={styles.badge(getPriorityColor(ticket.priority))}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
                <div style={styles.ticketMeta}>
                  <span>📅 {formatDate(ticket.created_at)}</span>
                  <span>📁 {ticket.category}</span>
                  <span>💬 {ticket.replies?.length || 0} replies</span>
                </div>
                <p style={styles.ticketDesc}>
                  {ticket.description.substring(0, 100)}...
                </p>
              </div>
            ))
          )}
        </div>

        {selectedTicket && (
          <div style={styles.detailPanel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <h2 style={{ ...styles.detailSubject, fontSize: '20px', margin: 0 }}>
                {getCategoryIcon(selectedTicket.category)} {selectedTicket.subject}
              </h2>
              <button style={styles.closeBtn} onClick={() => setSelectedTicket(null)}>×</button>
            </div>
            
            <div style={styles.detailBadges}>
              <span style={styles.badge(getStatusColor(selectedTicket.status))}>
                {selectedTicket.status.replace('_', ' ')}
              </span>
              <span style={styles.badge(getPriorityColor(selectedTicket.priority))}>
                {selectedTicket.priority}
              </span>
              <span style={{ ...styles.badge('#6B7280'), backgroundColor: '#F3F4F6' }}>
                {selectedTicket.category}
              </span>
            </div>

            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>
                Created on {formatDate(selectedTicket.created_at)}
              </p>
              <p style={styles.detailDesc}>{selectedTicket.description}</p>
            </div>

            {selectedTicket.resolution && (
              <div style={{
                padding: '16px',
                backgroundColor: '#ECFDF5',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#059669', margin: '0 0 8px 0' }}>
                  Resolution
                </p>
                <p style={{ fontSize: '14px', color: '#065F46', margin: 0 }}>
                  {selectedTicket.resolution}
                </p>
              </div>
            )}

            <div style={styles.repliesSection}>
              <h3 style={styles.repliesTitle}>Conversation ({selectedTicket.replies?.length || 0})</h3>
              
              {selectedTicket.replies?.map((reply, index) => (
                <div key={index} style={styles.replyCard(reply.by === 'support')}>
                  <div style={styles.replyHeader}>
                    <span style={styles.replyAuthor}>
                      {reply.by === 'support' ? `Support Team${reply.support_role ? ` (${reply.support_role.replace('_', ' ')})` : ''}` : 'You'}
                    </span>
                    <span style={styles.replyTime}>{formatDate(reply.created_at)}</span>
                  </div>
                  <p style={styles.replyText}>{reply.message}</p>
                </div>
              ))}

              {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                <div style={styles.replyInput}>
                  <textarea
                    style={styles.replyTextarea}
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <button
                    style={{ ...styles.replyBtn, alignSelf: 'flex-end' }}
                    onClick={() => addReply(selectedTicket.id)}
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create Support Ticket</h2>
              <button style={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={createTicket}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Subject</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Brief summary of your issue"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  style={styles.select}
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                >
                  <option value="general">General Inquiry</option>
                  <option value="application">Application Related</option>
                  <option value="payment">Payment Issue</option>
                  <option value="technical">Technical Problem</option>
                  <option value="admission">Admission Query</option>
                  <option value="documents">Document Issue</option>
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Priority</label>
                <select
                  style={styles.select}
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={styles.textarea}
                  placeholder="Describe your issue in detail..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  required
                />
              </div>
              
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSupportTickets;
