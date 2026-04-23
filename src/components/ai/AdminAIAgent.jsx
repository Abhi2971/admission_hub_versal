import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getCollegeApplications, getCollegeCourses } from '../../services/admin';
import { useSubscription } from '../../context/SubscriptionContext';
import SubscriptionRequired from '../common/SubscriptionRequired';

const AdminAIAgentContent = () => {
  const { hasActive } = useSubscription();
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: "Welcome to College Admin AI Assistant! 🎓\n\nI can help you:\n\n✅ Review and manage applications\n✅ Analyze course performance\n✅ Generate insights from data\n✅ Optimize admission process\n\nWhat would you like to do?",
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [appsRes, coursesRes] = await Promise.all([
        getCollegeApplications({ page: 1, per_page: 50 }),
        getCollegeCourses(),
      ]);
      setApplications(appsRes.data.applications || []);
      setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, []);

  useEffect(() => {
    if (hasActive) {
      fetchData();
    }
  }, [fetchData, hasActive]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!hasActive) return <SubscriptionRequired feature="use AI Assistant" />;

  const analyzeApplications = () => {
    const total = applications.length;
    const byStatus = {
      applied: applications.filter(a => a.status === 'applied').length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      offered: applications.filter(a => a.status === 'offered').length,
      confirmed: applications.filter(a => a.status === 'confirmed').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
    };
    
    return { total, byStatus };
  };

  const analyzeCourses = () => {
    const courseStats = courses.map(course => {
      const courseApps = applications.filter(a => a.course_id === course._id);
      return {
        name: course.course_name,
        total: courseApps.length,
        pending: courseApps.filter(a => a.status === 'applied').length,
        accepted: courseApps.filter(a => ['shortlisted', 'offered', 'confirmed'].includes(a.status)).length,
      };
    });
    
    return courseStats.sort((a, b) => b.total - a.total);
  };

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
      if (lowerMsg.includes('application') && (lowerMsg.includes('review') || lowerMsg.includes('pending') || lowerMsg.includes('check'))) {
        intent = 'applications';
        const pending = applications.filter(a => a.status === 'applied');
        const { total, byStatus } = analyzeApplications();
        
        response = `📊 Application Overview:\n\n`;
        response += `Total Applications: ${total}\n\n`;
        response += `📋 By Status:\n`;
        response += `• Pending Review: ${byStatus.applied}\n`;
        response += `• Shortlisted: ${byStatus.shortlisted}\n`;
        response += `• Offered: ${byStatus.offered}\n`;
        response += `• Confirmed: ${byStatus.confirmed}\n`;
        response += `• Rejected: ${byStatus.rejected}\n\n`;
        
        if (pending.length > 0) {
          response += `⚠️ ${pending.length} applications need your review!\n`;
          response += `Go to Applications tab to review them.`;
        }
      }
      else if (lowerMsg.includes('course') && (lowerMsg.includes('performance') || lowerMsg.includes('analytics') || lowerMsg.includes('popular'))) {
        intent = 'course_analytics';
        const courseStats = analyzeCourses();
        
        response = `📚 Course Performance:\n\n`;
        
        if (courseStats.length > 0) {
          response += `Top Performing Courses:\n`;
          courseStats.slice(0, 5).forEach((course, i) => {
            response += `${i + 1}. ${course.name}\n   📥 ${course.total} applications | ✅ ${course.accepted} accepted\n`;
          });
        } else {
          response += `No courses found. Add courses to see analytics.`;
        }
      }
      else if (lowerMsg.includes('recommend') || lowerMsg.includes('suggestion') || lowerMsg.includes('tip')) {
        intent = 'recommendations';
        const { total, byStatus } = analyzeApplications();
        const courseStats = analyzeCourses();
        
        response = `💡 Recommendations:\n\n`;
        
        if (byStatus.applied > 10) {
          response += `1. ⚡ You have ${byStatus.applied} pending applications. Consider reviewing them daily.\n\n`;
        }
        
        if (courseStats.length > 0) {
          const lowPerforming = courseStats.filter(c => c.total < 5);
          if (lowPerforming.length > 0) {
            response += `2. 📉 Courses with low applications: ${lowPerforming.map(c => c.name).join(', ')}\n\n`;
          }
        }
        
        const avgConversion = total > 0 ? Math.round(((byStatus.shortlisted + byStatus.offered + byStatus.confirmed) / total) * 100) : 0;
        response += `3. 📈 Current conversion rate: ${avgConversion}%\n\n`;
        response += `4. 💰 Potential revenue from pending: ${byStatus.applied * 500} (assuming ₹500 per application)`;
      }
      else if (lowerMsg.includes('analytics') || lowerMsg.includes('report') || lowerMsg.includes('insight')) {
        intent = 'analytics';
        const { total, byStatus } = analyzeApplications();
        const avgConversion = total > 0 ? Math.round(((byStatus.shortlisted + byStatus.offered + byStatus.confirmed) / total) * 100) : 0;
        
        response = `📈 Platform Analytics:\n\n`;
        response += `Total Applications: ${total}\n`;
        response += `Success Rate: ${avgConversion}%\n\n`;
        response += `Conversion Funnel:\n`;
        response += `Applied → ${byStatus.applied}\n`;
        response += `Shortlisted → ${byStatus.shortlisted}\n`;
        response += `Offered → ${byStatus.offered}\n`;
        response += `Confirmed → ${byStatus.confirmed}\n\n`;
        response += `Check Analytics tab for detailed reports.`;
      }
      else if (lowerMsg.includes('add') && (lowerMsg.includes('course') || lowerMsg.includes('student'))) {
        intent = 'add';
        response = `To add new content:\n\n`;
        response += `📚 Add Course: Go to Manage Courses → Add New Course\n`;
        response += `👤 Add Student: Use Manual Entry feature\n\n`;
        response += `Would you like me to guide you through either process?`;
      }
      else if (lowerMsg.includes('help')) {
        intent = 'help';
        response = `Available Commands:\n\n`;
        response += `📋 'Review pending applications' - Check application status\n`;
        response += `📊 'Course performance' - See which courses are popular\n`;
        response += `💡 'Recommendations' - Get suggestions to improve admissions\n`;
        response += `📈 'Analytics report' - Get platform insights\n`;
        response += `➕ 'Add course/student' - Guidance on adding content\n`;
        response += `🎯 'Help me decide' - Get AI-powered decisions`;
      }
      else {
        intent = 'general';
        response = `I can help you with:\n\n`;
        response += `✅ Application review insights\n`;
        response += `✅ Course performance analysis\n`;
        response += `✅ Admission recommendations\n`;
        response += `✅ Platform analytics\n\n`;
        response += `Try: 'Review pending applications' or 'Course performance'`;
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
    { text: '📋 Review Applications', command: 'Review pending applications' },
    { text: '📊 Course Performance', command: 'Course performance analytics' },
    { text: '💡 Recommendations', command: 'Give me recommendations' },
    { text: '📈 Analytics Report', command: 'Analytics report' },
  ];

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>CA</div>
          <div>
            <h1 style={styles.headerTitle}>Admin AI Assistant</h1>
            <p style={styles.headerSubtitle}>Your admission management helper</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.statsBadge}>
            <span style={styles.statsIcon}>📋</span>
            <span style={styles.statsValue}>{applications.length}</span>
            <span style={styles.statsLabel}>Applications</span>
          </div>
          <div style={styles.avatar}>A</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(activeTab === 'chat' ? styles.tabActive : {}) }} onClick={() => setActiveTab('chat')}>💬 Chat</button>
        <button style={{ ...styles.tab, ...(activeTab === 'overview' ? styles.tabActive : {}) }} onClick={() => setActiveTab('overview')}>📊 Overview</button>
      </div>

      {/* Main Content */}
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
                  {msg.role === 'user' && <div style={styles.userAvatar}>A</div>}
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
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about applications, courses, or analytics..."
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
              <h2 style={styles.overviewTitle}>Quick Overview</h2>
            </div>
            
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, backgroundColor: '#DBEAFE' }}>📋</div>
                <div style={styles.statInfo}>
                  <span style={styles.statNumber}>{applications.length}</span>
                  <span style={styles.statLabel}>Total Applications</span>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, backgroundColor: '#FEF3C7' }}>⏳</div>
                <div style={styles.statInfo}>
                  <span style={{ ...styles.statNumber, color: '#B45309' }}>{applications.filter(a => a.status === 'applied').length}</span>
                  <span style={styles.statLabel}>Pending Review</span>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, backgroundColor: '#D1FAE5' }}>✅</div>
                <div style={styles.statInfo}>
                  <span style={{ ...styles.statNumber, color: '#047857' }}>{applications.filter(a => ['shortlisted', 'offered', 'confirmed'].includes(a.status)).length}</span>
                  <span style={styles.statLabel}>Processed</span>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, backgroundColor: '#E0E7FF' }}>📚</div>
                <div style={styles.statInfo}>
                  <span style={styles.statNumber}>{courses.length}</span>
                  <span style={styles.statLabel}>Courses</span>
                </div>
              </div>
            </div>

            <div style={styles.quickLinks}>
              <h3 style={styles.quickLinksTitle}>Quick Actions</h3>
              <div style={styles.quickLinksGrid}>
                <Link to="/admin/applications" style={styles.quickLinkCard}>
                  <span style={styles.quickLinkIcon}>📋</span>
                  <span style={styles.quickLinkText}>Review Applications</span>
                </Link>
                <Link to="/admin/courses" style={styles.quickLinkCard}>
                  <span style={styles.quickLinkIcon}>📚</span>
                  <span style={styles.quickLinkText}>Manage Courses</span>
                </Link>
                <Link to="/admin/analytics" style={styles.quickLinkCard}>
                  <span style={styles.quickLinkIcon}>📊</span>
                  <span style={styles.quickLinkText}>View Analytics</span>
                </Link>
                <Link to="/admin/manual-entry" style={styles.quickLinkCard}>
                  <span style={styles.quickLinkIcon}>➕</span>
                  <span style={styles.quickLinkText}>Add Student</span>
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
  headerIcon: { width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#185FA5', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600' },
  headerTitle: { fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 },
  headerSubtitle: { fontSize: '12px', color: '#6B7280', margin: 0 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  statsBadge: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F3F4F6', borderRadius: '20px', padding: '6px 14px' },
  statsIcon: { fontSize: '14px' },
  statsValue: { fontSize: '14px', fontWeight: '600', color: '#185FA5' },
  statsLabel: { fontSize: '12px', color: '#6B7280' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#185FA5', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600' },
  tabs: { display: 'flex', gap: '4px', padding: '0.5rem 2rem', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' },
  tab: { padding: '8px 16px', border: 'none', backgroundColor: 'transparent', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: '#6B7280', cursor: 'pointer' },
  tabActive: { backgroundColor: '#EFF6FF', color: '#185FA5' },
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
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '1.5rem' },
  statCard: { backgroundColor: '#F9FAFB', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' },
  statIcon: { width: '48px', height: '48px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' },
  statInfo: { display: 'flex', flexDirection: 'column' },
  statNumber: { fontSize: '24px', fontWeight: '600', color: '#111827' },
  statLabel: { fontSize: '12px', color: '#6B7280' },
  quickLinks: { marginTop: '1.5rem' },
  quickLinksTitle: { fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '12px' },
  quickLinksGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  quickLinkCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB', textDecoration: 'none' },
  quickLinkIcon: { fontSize: '24px' },
  quickLinkText: { fontSize: '12px', color: '#374151', textAlign: 'center' },
};

export default AdminAIAgentContent;
