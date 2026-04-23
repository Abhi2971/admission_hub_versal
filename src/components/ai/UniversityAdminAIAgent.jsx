import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const UniversityAdminAIAgent = () => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: "Welcome to University Admin AI Assistant! 🏛️\n\nI can help you:\n\n✅ University overview and statistics\n✅ College management insights\n✅ Admission performance analysis\n✅ Student enrollment trends\n✅ Admin management tips\n\nWhat would you like to do?",
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, collegesRes] = await Promise.all([
        api.get('/university-admin/stats'),
        api.get('/university-admin/colleges')
      ]);
      setAnalytics(statsRes.data);
      setColleges(collegesRes.data.colleges || []);
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
      if (lowerMsg.includes('university') && (lowerMsg.includes('overview') || lowerMsg.includes('summary') || lowerMsg.includes('status'))) {
        intent = 'university_overview';
        response = `🏛️ University Overview:\n\n`;
        response += `📊 Total Colleges: ${analytics?.college_count || 0}\n`;
        response += `👥 College Admins: ${analytics?.college_admin_count || 0}\n`;
        response += `📚 Department Admins: ${analytics?.department_admin_count || 0}\n`;
        response += `📋 Total Applications: ${analytics?.application_count || 0}\n\n`;
        
        const appsPerCollege = analytics?.college_count > 0 
          ? Math.round(analytics.application_count / analytics.college_count) 
          : 0;
        response += `📈 Average applications per college: ${appsPerCollege}`;
      }
      else if (lowerMsg.includes('college') && (lowerMsg.includes('list') || lowerMsg.includes('all') || lowerMsg.includes('view'))) {
        intent = 'college_list';
        response = `🏛️ Colleges Under Your University:\n\n`;
        
        if (colleges.length > 0) {
          colleges.forEach((college, i) => {
            response += `${i + 1}. ${college.name} (${college.code})\n`;
            response += `   📍 ${college.city}, ${college.state}\n`;
          });
        } else {
          response += `No colleges registered yet.\n`;
        }
        
        response += `\n📍 Go to Colleges page to add new colleges.`;
      }
      else if (lowerMsg.includes('admin') && (lowerMsg.includes('college') || lowerMsg.includes('manage'))) {
        intent = 'college_admin_status';
        const count = analytics?.college_admin_count || 0;
        response = `👥 College Admin Status:\n\n`;
        response += `Total College Admins: ${count}\n\n`;
        
        if (count < colleges.length) {
          response += `⚠️ Some colleges may not have admins assigned.\n`;
          response += `📍 Create college admins from College Admins page.`;
        } else if (count === colleges.length) {
          response += `✅ All colleges have admins assigned!`;
        }
      }
      else if (lowerMsg.includes('application') && (lowerMsg.includes('overview') || lowerMsg.includes('total'))) {
        intent = 'application_stats';
        const apps = analytics?.application_count || 0;
        response = `📋 Admission Overview:\n\n`;
        response += `Total Applications: ${apps}\n`;
        response += `Colleges: ${analytics?.college_count || 0}\n\n`;
        
        if (apps > 100) {
          response += `🎉 Good admission activity across your university!`;
        } else if (apps > 0) {
          response += `📢 Consider promoting your colleges to increase applications.`;
        } else {
          response += `📢 No applications yet. Make sure courses are published.`;
        }
      }
      else if (lowerMsg.includes('department') || lowerMsg.includes('faculty')) {
        intent = 'department_status';
        response = `📚 Department Admins:\n\n`;
        response += `Total Department Admins: ${analytics?.department_admin_count || 0}\n\n`;
        
        if (analytics?.department_admin_count === 0) {
          response += `⚠️ No department admins created yet.\n`;
          response += `💡 College admins should create department admins to manage courses.`;
        } else {
          response += `✅ Department structure is in place.`;
        }
      }
      else if (lowerMsg.includes('recommend') || lowerMsg.includes('suggest') || lowerMsg.includes('tip')) {
        intent = 'recommendations';
        response = `💡 Strategic Recommendations:\n\n`;
        
        const colleges_count = analytics?.college_count || 0;
        const apps = analytics?.application_count || 0;
        
        if (colleges_count === 0) {
          response += `1. 🏛️ Add colleges to your university\n\n`;
        }
        
        if (analytics?.college_admin_count < colleges_count && colleges_count > 0) {
          response += `2. 👥 Assign college admins to all colleges\n\n`;
        }
        
        if (apps < colleges_count * 5 && colleges_count > 0) {
          response += `3. 📢 Promote your universities to increase applications\n\n`;
        }
        
        if (analytics?.department_admin_count < 3) {
          response += `4. 📚 Create department admins for better course management`;
        }
      }
      else if (lowerMsg.includes('help')) {
        intent = 'help';
        response = `Available Commands:\n\n`;
        response += `🏛️ 'University overview' - Get university summary\n`;
        response += `📋 'List colleges' - See all colleges\n`;
        response += `👥 'College admin status' - Check admin assignments\n`;
        response += `📚 'Department status' - Check department admins\n`;
        response += `💡 'Recommendations' - Get strategic tips`;
      }
      else {
        intent = 'general';
        response = `I can help you with:\n\n`;
        response += `✅ University statistics\n`;
        response += `✅ College management\n`;
        response += `✅ Admin assignments\n`;
        response += `✅ Admission insights\n`;
        response += `✅ Strategic recommendations\n\n`;
        response += `Try: 'University overview' or 'List colleges'`;
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
    { text: '🏛️ University Overview', command: 'University overview' },
    { text: '📋 List Colleges', command: 'List all colleges' },
    { text: '👥 Admin Status', command: 'College admin status' },
    { text: '💡 Recommendations', command: 'Give me recommendations' },
  ];

  return (
    <div style={styles.container}>
      <style>{`@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }`}</style>

      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>🏛️</div>
          <div>
            <h1 style={styles.headerTitle}>University Admin AI</h1>
            <p style={styles.headerSubtitle}>University management assistant</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.roleBadge}>
            <span>🎓</span>
            <span style={styles.roleText}>University Level</span>
          </div>
          <div style={styles.avatar}>UA</div>
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
                  {msg.role === 'user' && <div style={styles.userAvatar}>UA</div>}
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
                placeholder="Ask about your university, colleges, admins..."
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
              <h2 style={styles.overviewTitle}>University Overview</h2>
            </div>
            
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, backgroundColor: '#DBEAFE' }}>🏛️</div>
                <div style={styles.statInfo}>
                  <span style={{ ...styles.statNumber, color: '#185FA5' }}>{analytics?.college_count || 0}</span>
                  <span style={styles.statLabel}>Colleges</span>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, backgroundColor: '#FEF3C7' }}>👥</div>
                <div style={styles.statInfo}>
                  <span style={{ ...styles.statNumber, color: '#D97706' }}>{analytics?.college_admin_count || 0}</span>
                  <span style={styles.statLabel}>College Admins</span>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, backgroundColor: '#D1FAE5' }}>📚</div>
                <div style={styles.statInfo}>
                  <span style={{ ...styles.statNumber, color: '#059669' }}>{analytics?.department_admin_count || 0}</span>
                  <span style={styles.statLabel}>Dept Admins</span>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, backgroundColor: '#EDE9FE' }}>📋</div>
                <div style={styles.statInfo}>
                  <span style={{ ...styles.statNumber, color: '#7C3AED' }}>{analytics?.application_count || 0}</span>
                  <span style={styles.statLabel}>Applications</span>
                </div>
              </div>
            </div>

            <div style={styles.quickLinks}>
              <h3 style={styles.quickLinksTitle}>Management Links</h3>
              <div style={styles.quickLinksGrid}>
                <Link to="/university-admin/colleges" style={styles.quickLinkCard}>
                  <span style={styles.quickLinkIcon}>🏛️</span>
                  <span style={styles.quickLinkText}>Colleges</span>
                </Link>
                <Link to="/university-admin/college-admins" style={styles.quickLinkCard}>
                  <span style={styles.quickLinkIcon}>👥</span>
                  <span style={styles.quickLinkText}>College Admins</span>
                </Link>
                <Link to="/university-admin/analytics" style={styles.quickLinkCard}>
                  <span style={styles.quickLinkIcon}>📊</span>
                  <span style={styles.quickLinkText}>Analytics</span>
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
  roleBadge: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#DBEAFE', borderRadius: '20px', padding: '6px 14px' },
  roleText: { fontSize: '13px', fontWeight: '500', color: '#185FA5' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#185FA5', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600' },
  tabs: { display: 'flex', gap: '4px', padding: '0.5rem 2rem', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' },
  tab: { padding: '8px 16px', border: 'none', backgroundColor: 'transparent', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: '#6B7280', cursor: 'pointer' },
  tabActive: { backgroundColor: '#DBEAFE', color: '#185FA5' },
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
  quickLinksGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' },
  quickLinkCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB', textDecoration: 'none' },
  quickLinkIcon: { fontSize: '24px' },
  quickLinkText: { fontSize: '12px', color: '#374151', textAlign: 'center' },
};

export default UniversityAdminAIAgent;
