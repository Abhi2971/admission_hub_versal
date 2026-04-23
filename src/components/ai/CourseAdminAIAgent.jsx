import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const CourseAdminAIAgent = () => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: "Welcome to Department Admin AI Assistant! 📚\n\nI can help you:\n\n✅ Department overview\n✅ Course management insights\n✅ Application review tips\n✅ Admission status updates\n✅ Performance optimization\n\nWhat would you like to do?",
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, coursesRes] = await Promise.all([
        api.get('/course-admin/stats'),
        api.get('/course-admin/courses')
      ]);
      setStats(statsRes.data);
      setCourses(coursesRes.data.courses || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text = input) => {
    const trimmed = text?.trim();
    if (!trimmed) return;

    const userMsg = {
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const lowerMsg = trimmed.toLowerCase();
    let response = '';
    let intent = 'general';

    try {
      if (lowerMsg.includes('department') && (lowerMsg.includes('overview') || lowerMsg.includes('summary') || lowerMsg.includes('status'))) {
        intent = 'department_overview';
        response = `📚 Department Overview:\n\n`;
        response += `Department: ${stats?.department || 'N/A'}\n`;
        response += `Total Courses: ${stats?.course_count || 0}\n`;
        response += `Applications: ${stats?.application_count || 0}\n`;
        response += `Total Seats: ${stats?.total_seats || 0}\n`;
        response += `Filled Seats: ${stats?.filled_seats || 0}\n`;
        response += `Available Seats: ${stats?.available_seats || 0}\n\n`;
        
        const fillRate = stats?.total_seats > 0 
          ? Math.round((stats.filled_seats / stats.total_seats) * 100) 
          : 0;
        response += `📊 Fill Rate: ${fillRate}%`;
      }
      else if (lowerMsg.includes('course') && (lowerMsg.includes('list') || lowerMsg.includes('all') || lowerMsg.includes('manage'))) {
        intent = 'course_list';
        response = `📚 Your Courses:\n\n`;
        
        if (courses.length > 0) {
          courses.forEach((course, i) => {
            response += `${i + 1}. ${course.course_name}\n`;
            response += `   📊 Seats: ${course.available_seats}/${course.seats}\n`;
            response += `   💰 Fees: ₹${course.fees?.toLocaleString()}\n`;
          });
        } else {
          response += `No courses added yet.\n`;
        }
        
        response += `\n📍 Go to My Courses to add or edit courses.`;
      }
      else if (lowerMsg.includes('application') && (lowerMsg.includes('status') || lowerMsg.includes('overview') || lowerMsg.includes('count'))) {
        intent = 'application_status';
        response = `📋 Application Status:\n\n`;
        response += `Total Applications: ${stats?.application_count || 0}\n\n`;
        
        if (stats?.status_counts) {
          const counts = stats.status_counts;
          response += `Breakdown:\n`;
          response += `• Applied: ${counts.applied || 0}\n`;
          response += `• Under Review: ${counts.under_review || 0}\n`;
          response += `• Shortlisted: ${counts.shortlisted || 0}\n`;
          response += `• Rejected: ${counts.rejected || 0}\n`;
          response += `• Offered: ${counts.offered || 0}\n`;
          response += `• Confirmed: ${counts.confirmed || 0}\n`;
        }
      }
      else if (lowerMsg.includes('seat') || lowerMsg.includes('availability')) {
        intent = 'seat_availability';
        const total = stats?.total_seats || 0;
        const filled = stats?.filled_seats || 0;
        const available = stats?.available_seats || 0;
        const fillRate = total > 0 ? Math.round((filled / total) * 100) : 0;
        
        response = `💺 Seat Availability:\n\n`;
        response += `Total Seats: ${total}\n`;
        response += `Filled: ${filled}\n`;
        response += `Available: ${available}\n`;
        response += `Fill Rate: ${fillRate}%\n\n`;
        
        if (fillRate >= 80) {
          response += `✅ High demand! Consider adding more seats.`;
        } else if (fillRate >= 50) {
          response += `📊 Moderate demand. Promoting your courses could help.`;
        } else if (fillRate < 30 && total > 0) {
          response += `⚠️ Low fill rate. Review eligibility or promote courses.`;
        }
      }
      else if (lowerMsg.includes('review') || lowerMsg.includes('pending')) {
        intent = 'review_pending';
        const pending = (stats?.status_counts?.applied || 0) + (stats?.status_counts?.under_review || 0);
        response = `📝 Application Review:\n\n`;
        response += `Pending Applications: ${pending}\n\n`;
        
        if (pending > 10) {
          response += `📢 You have ${pending} applications to review.\n`;
          response += `💡 Tip: Start with recent applications for faster processing.`;
        } else if (pending > 0) {
          response += `✅ Few pending applications. Keep up the good work!`;
        } else {
          response += `✅ All applications have been reviewed!`;
        }
      }
      else if (lowerMsg.includes('recommend') || lowerMsg.includes('suggest') || lowerMsg.includes('tip')) {
        intent = 'recommendations';
        response = `💡 Recommendations:\n\n`;
        
        const fillRate = stats?.total_seats > 0 
          ? Math.round((stats.filled_seats / stats.total_seats) * 100) 
          : 0;
        const pending = (stats?.status_counts?.applied || 0);
        
        if (courses.length < 3) {
          response += `1. 📚 Add more courses to attract diverse students\n\n`;
        }
        
        if (fillRate < 50 && stats?.total_seats > 0) {
          response += `2. 📢 Promote your courses through social media\n\n`;
        }
        
        if (pending > 5) {
          response += `3. ⏰ Review pending applications promptly\n\n`;
        }
        
        if (stats?.available_seats > 0) {
          response += `4. 🎯 You have ${stats.available_seats} seats available - focus on marketing`;
        }
      }
      else if (lowerMsg.includes('help')) {
        intent = 'help';
        response = `Available Commands:\n\n`;
        response += `📚 'Department overview' - Get department summary\n`;
        response += `📋 'List courses' - See all your courses\n`;
        response += `💺 'Seat availability' - Check seat status\n`;
        response += `📝 'Review pending' - Check pending applications\n`;
        response += `💡 'Recommendations' - Get optimization tips`;
      }
      else {
        intent = 'general';
        response = `I can help you with:\n\n`;
        response += `✅ Department statistics\n`;
        response += `✅ Course management\n`;
        response += `✅ Application insights\n`;
        response += `✅ Seat availability\n`;
        response += `✅ Performance tips\n\n`;
        response += `Try: 'Department overview' or 'Application status'`;
      }

      const botMsg = {
        role: 'bot',
        content: response,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        intent
      };
      
      setMessages(prev => [...prev, botMsg]);

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'bot',
        content: 'I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    { text: '📚 Department Overview', command: 'Department overview' },
    { text: '📋 Application Status', command: 'Application status' },
    { text: '💺 Seat Availability', command: 'Seat availability' },
    { text: '💡 Recommendations', command: 'Give me recommendations' },
  ];

  return (
    <div style={styles.container}>
      <style>{`@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }`}</style>

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>📚</div>
          <div>
            <h1 style={styles.headerTitle}>Department Admin AI</h1>
            <p style={styles.headerSubtitle}>{stats?.department || 'Department Management'}</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.roleBadge}>
            <span>📋</span>
            <span style={styles.roleText}>Course Management</span>
          </div>
          <div style={styles.avatar}>DA</div>
        </div>
      </div>

      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(activeTab === 'chat' ? styles.tabActive : {}) }} onClick={() => setActiveTab('chat')}>💬 Chat</button>
        <button style={{ ...styles.tab, ...(activeTab === 'overview' ? styles.tabActive : {}) }} onClick={() => setActiveTab('overview')}>📊 Overview</button>
      </div>

      <div style={styles.mainContent}>
        {activeTab === 'chat' && (
          <div style={styles.chatContainer}>
            <div style={styles.messagesArea}>
              {messages.map((msg, i) => (
                <div key={i} style={{ ...styles.messageRow, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.role === 'bot' && <div style={styles.botAvatar}>AI</div>}
                  <div style={{
                    ...styles.messageBubble,
                    background: msg.role === 'user' ? '#185FA5' : msg.isError ? '#FEE2E2' : '#FFFFFF',
                    color: msg.role === 'user' ? '#FFFFFF' : msg.isError ? '#DC2626' : '#111827',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    border: msg.role === 'bot' ? '1px solid #E5E7EB' : 'none',
                  }}>
                    <p style={{ ...styles.messageText, margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                    <div style={styles.messageFooter}>
                      <span style={styles.timestamp}>{msg.timestamp}</span>
                    </div>
                  </div>
                  {msg.role === 'user' && <div style={styles.userAvatar}>DA</div>}
                </div>
              ))}
              {loading && (
                <div style={styles.typingIndicator}>
                  <div style={styles.botAvatar}>AI</div>
                  <div style={styles.typingBubble}>
                    <span style={styles.typingDot}></span>
                    <span style={{ ...styles.typingDot, animationDelay: '0.2s' }}></span>
                    <span style={{ ...styles.typingDot, animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && !loading && (
              <div style={styles.suggestionsArea}>
                <p style={styles.suggestionsTitle}>Quick Actions:</p>
                <div style={styles.suggestionsGrid}>
                  {suggestions.map((sug, i) => (
                    <button key={i} style={styles.suggestionChip} onClick={() => handleSend(sug.command)}>{sug.text}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.inputArea}>
              <input
                type="text"
                name="message"
                id="message"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about your department, courses, applications..."
                style={{ ...styles.input, color: '#374151' }}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                disabled={loading}
              />
              <button
                style={{ ...styles.sendBtn, background: input.trim() ? '#185FA5' : '#E5E7EB', cursor: input.trim() ? 'pointer' : 'default' }}
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div style={styles.overviewContainer}>
            <div style={styles.overviewHeader}>
              <h2 style={styles.overviewTitle}>Department Overview</h2>
              <p style={styles.overviewSubtitle}>{stats?.department}</p>
            </div>
            
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, backgroundColor: '#D1FAE5' }}>📚</div>
                <div style={styles.statInfo}>
                  <span style={{ ...styles.statNumber, color: '#059669' }}>{stats?.course_count || 0}</span>
                  <span style={styles.statLabel}>Courses</span>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, backgroundColor: '#DBEAFE' }}>📋</div>
                <div style={styles.statInfo}>
                  <span style={{ ...styles.statNumber, color: '#185FA5' }}>{stats?.application_count || 0}</span>
                  <span style={styles.statLabel}>Applications</span>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, backgroundColor: '#FEF3C7' }}>💺</div>
                <div style={styles.statInfo}>
                  <span style={{ ...styles.statNumber, color: '#D97706' }}>{stats?.available_seats || 0}</span>
                  <span style={styles.statLabel}>Seats Available</span>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, backgroundColor: '#EDE9FE' }}>📊</div>
                <div style={styles.statInfo}>
                  <span style={{ ...styles.statNumber, color: '#7C3AED' }}>
                    {stats?.total_seats > 0 ? Math.round((stats.filled_seats / stats.total_seats) * 100) : 0}%
                  </span>
                  <span style={styles.statLabel}>Fill Rate</span>
                </div>
              </div>
            </div>

            {stats?.status_counts && (
              <div style={styles.statusSection}>
                <h3 style={styles.statusTitle}>Application Breakdown</h3>
                <div style={styles.statusGrid}>
                  <div style={styles.statusItem}>
                    <span style={styles.statusValue}>{stats.status_counts.applied || 0}</span>
                    <span style={styles.statusLabel}>Applied</span>
                  </div>
                  <div style={styles.statusItem}>
                    <span style={styles.statusValue}>{stats.status_counts.under_review || 0}</span>
                    <span style={styles.statusLabel}>Under Review</span>
                  </div>
                  <div style={styles.statusItem}>
                    <span style={styles.statusValue}>{stats.status_counts.shortlisted || 0}</span>
                    <span style={styles.statusLabel}>Shortlisted</span>
                  </div>
                  <div style={styles.statusItem}>
                    <span style={styles.statusValue}>{stats.status_counts.confirmed || 0}</span>
                    <span style={styles.statusLabel}>Confirmed</span>
                  </div>
                </div>
              </div>
            )}

            <div style={styles.quickLinks}>
              <h3 style={styles.quickLinksTitle}>Quick Actions</h3>
              <div style={styles.quickLinksGrid}>
                <Link to="/course-admin/courses" style={styles.quickLinkCard}>
                  <span style={styles.quickLinkIcon}>📚</span>
                  <span style={styles.quickLinkText}>My Courses</span>
                </Link>
                <Link to="/course-admin/applications" style={styles.quickLinkCard}>
                  <span style={styles.quickLinkIcon}>📋</span>
                  <span style={styles.quickLinkText}>Applications</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { fontFamily: "'DM Sans', sans-serif", backgroundColor: '#F3F4F6', minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  headerIcon: { fontSize: '32px' },
  headerTitle: { fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 },
  headerSubtitle: { fontSize: '12px', color: '#6B7280', margin: 0 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  roleBadge: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#D1FAE5', borderRadius: '20px', padding: '6px 14px' },
  roleText: { fontSize: '13px', fontWeight: '500', color: '#059669' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#185FA5', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600' },
  tabs: { display: 'flex', gap: '4px', padding: '0.5rem 2rem', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' },
  tab: { padding: '8px 16px', border: 'none', backgroundColor: 'transparent', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: '#6B7280', cursor: 'pointer' },
  tabActive: { backgroundColor: '#D1FAE5', color: '#059669' },
  mainContent: { flex: 1, padding: '1.5rem 2rem' },
  chatContainer: { backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', minHeight: '500px' },
  messagesArea: { flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' },
  messageRow: { display: 'flex', alignItems: 'flex-end', gap: '10px' },
  botAvatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#185FA5', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', flexShrink: 0 },
  userAvatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#6B7280', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', flexShrink: 0 },
  messageBubble: { maxWidth: '70%', padding: '12px 16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
  messageText: { fontSize: '14px', lineHeight: '1.6' },
  messageFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', gap: '12px' },
  timestamp: { fontSize: '10px', color: '#9CA3AF' },
  typingIndicator: { display: 'flex', alignItems: 'flex-end', gap: '10px' },
  typingBubble: { backgroundColor: '#F3F4F6', borderRadius: '12px', padding: '12px 16px', display: 'flex', gap: '4px' },
  typingDot: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#9CA3AF', animation: 'bounce 1.2s ease-in-out infinite' },
  suggestionsArea: { padding: '1rem 1.5rem', borderTop: '1px solid #F3F4F6' },
  suggestionsTitle: { fontSize: '12px', fontWeight: '600', color: '#6B7280', margin: '0 0 8px 0' },
  suggestionsGrid: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  suggestionChip: { padding: '6px 14px', border: '1px solid #E5E7EB', borderRadius: '20px', backgroundColor: '#FFFFFF', fontSize: '13px', color: '#374151', cursor: 'pointer' },
  inputArea: { display: 'flex', gap: '10px', padding: '1rem 1.5rem', borderTop: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' },
  input: { flex: 1, padding: '12px 16px', fontSize: '14px', border: '1px solid #D1D5DB', borderRadius: '10px', outline: 'none', fontFamily: "'DM Sans', sans-serif", backgroundColor: '#FFFFFF', color: '#111111' },
  sendBtn: { width: '44px', height: '44px', border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  overviewContainer: { backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '1.5rem' },
  overviewHeader: { marginBottom: '1.5rem' },
  overviewTitle: { fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 },
  overviewSubtitle: { fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '1.5rem' },
  statCard: { backgroundColor: '#F9FAFB', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' },
  statIcon: { width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' },
  statInfo: { display: 'flex', flexDirection: 'column' },
  statNumber: { fontSize: '24px', fontWeight: '600', color: '#111827' },
  statLabel: { fontSize: '12px', color: '#6B7280' },
  statusSection: { marginBottom: '1.5rem' },
  statusTitle: { fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '12px' },
  statusGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  statusItem: { backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '12px', textAlign: 'center' },
  statusValue: { display: 'block', fontSize: '20px', fontWeight: '600', color: '#111827' },
  statusLabel: { display: 'block', fontSize: '11px', color: '#6B7280', marginTop: '4px' },
  quickLinks: { marginTop: '1.5rem' },
  quickLinksTitle: { fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '12px' },
  quickLinksGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
  quickLinkCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB', textDecoration: 'none' },
  quickLinkIcon: { fontSize: '24px' },
  quickLinkText: { fontSize: '12px', color: '#374151', textAlign: 'center' },
};

export default CourseAdminAIAgent;
