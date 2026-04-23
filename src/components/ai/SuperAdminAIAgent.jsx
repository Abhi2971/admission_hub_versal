import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getPlatformAnalytics } from '../../services/superadmin';

const SuperAdminAIAgent = () => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: "Welcome to Super Admin AI Assistant! 👑\n\nI can help you:\n\n✅ Platform-wide analytics\n✅ College performance insights\n✅ Revenue optimization\n✅ User management tips\n✅ Plan performance analysis\n\nWhat would you like to do?",
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await getPlatformAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
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
      if (lowerMsg.includes('platform') && (lowerMsg.includes('overview') || lowerMsg.includes('status') || lowerMsg.includes('summary'))) {
        intent = 'platform_overview';
        response = `👑 Platform Overview:\n\n`;
        response += `📊 Total Colleges: ${analytics?.total_colleges || 0}\n`;
        response += `👥 Total Students: ${analytics?.total_students || 0}\n`;
        response += `📋 Total Applications: ${analytics?.total_applications || 0}\n`;
        response += `💰 Total Revenue: ₹${((analytics?.total_revenue || 0) / 100).toLocaleString()}\n\n`;
        
        const avgAppsPerCollege = analytics?.total_colleges > 0 
          ? Math.round(analytics.total_applications / analytics.total_colleges) 
          : 0;
        response += `📈 Average applications per college: ${avgAppsPerCollege}`;
      }
      else if (lowerMsg.includes('revenue') || lowerMsg.includes('earnings') || lowerMsg.includes('money')) {
        intent = 'revenue';
        const revenue = (analytics?.total_revenue || 0) / 100;
        response = `💰 Revenue Analysis:\n\n`;
        response += `Total Revenue: ₹${revenue.toLocaleString()}\n\n`;
        
        if (analytics?.revenue_by_plan) {
          response += `Revenue by Plan:\n`;
          Object.entries(analytics.revenue_by_plan).forEach(([plan, amount]) => {
            response += `• ${plan}: ₹${(amount / 100).toLocaleString()}\n`;
          });
        }
        
        response += `\nCheck Analytics tab for detailed revenue reports.`;
      }
      else if (lowerMsg.includes('college') && (lowerMsg.includes('performance') || lowerMsg.includes('top') || lowerMsg.includes('best'))) {
        intent = 'college_performance';
        response = `🏛️ College Performance:\n\n`;
        
        if (analytics?.top_colleges && analytics.top_colleges.length > 0) {
          response += `Top Performing Colleges:\n`;
          analytics.top_colleges.slice(0, 5).forEach((college, i) => {
            response += `${i + 1}. ${college.name}\n   📋 ${college.applications} applications\n`;
          });
        } else {
          response += `No college data available yet.\n`;
        }
        
        response += `\n📍 Go to Manage Colleges for detailed analytics.`;
      }
      else if (lowerMsg.includes('student') && (lowerMsg.includes('growth') || lowerMsg.includes('new') || lowerMsg.includes('signup'))) {
        intent = 'student_growth';
        const students = analytics?.total_students || 0;
        const applications = analytics?.total_applications || 0;
        const avgApps = students > 0 ? (applications / students).toFixed(1) : 0;
        
        response = `📈 Student Insights:\n\n`;
        response += `Total Students: ${students}\n`;
        response += `Total Applications: ${applications}\n`;
        response += `Avg applications per student: ${avgApps}\n\n`;
        
        if (students < 100) {
          response += `💡 Tip: Consider promoting the platform to increase student signups.`;
        } else if (students > 500) {
          response += `🎉 Great growth! Platform is gaining traction.`;
        }
      }
      else if (lowerMsg.includes('plan') && (lowerMsg.includes('performance') || lowerMsg.includes('popular') || lowerMsg.includes('subscription'))) {
        intent = 'plan_performance';
        response = `📋 Plan Performance:\n\n`;
        
        if (analytics?.plans) {
          response += `Top Plans:\n`;
          analytics.plans.forEach((plan, i) => {
            response += `${i + 1}. ${plan.name}: ${plan.subscribers} subscribers\n`;
          });
        } else {
          response += `No plan data available.\n`;
        }
        
        response += `\n📍 Go to College Plans or Student Plans for details.`;
      }
      else if (lowerMsg.includes('recommend') || lowerMsg.includes('suggest') || lowerMsg.includes('tip')) {
        intent = 'recommendations';
        response = `💡 Strategic Recommendations:\n\n`;
        
        const colleges = analytics?.total_colleges || 0;
        const students = analytics?.total_students || 0;
        const revenue = (analytics?.total_revenue || 0) / 100;
        
        if (colleges < 10) {
          response += `1. 🏛️ Add more colleges to increase platform value\n\n`;
        }
        
        if (students < colleges * 10) {
          response += `2. 📢 Focus on student acquisition - ratio seems low\n\n`;
        }
        
        if (revenue < 10000) {
          response += `3. 💰 Consider introducing premium plans or increasing prices\n\n`;
        }
        
        if (analytics?.top_colleges?.length < 5) {
          response += `4. 🎯 Encourage inactive colleges to post more courses`;
        }
      }
      else if (lowerMsg.includes('help')) {
        intent = 'help';
        response = `Available Commands:\n\n`;
        response += `👑 'Platform overview' - Get platform summary\n`;
        response += `💰 'Revenue analysis' - Check earnings\n`;
        response += `🏛️ 'Top colleges' - See best performing colleges\n`;
        response += `📈 'Student growth' - Student insights\n`;
        response += `📋 'Plan performance' - Popular subscription plans\n`;
        response += `💡 'Recommendations' - Get strategic tips`;
      }
      else {
        intent = 'general';
        response = `I can help you with:\n\n`;
        response += `✅ Platform analytics\n`;
        response += `✅ Revenue insights\n`;
        response += `✅ College performance\n`;
        response += `✅ Student growth metrics\n`;
        response += `✅ Strategic recommendations\n\n`;
        response += `Try: 'Platform overview' or 'Revenue analysis'`;
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
    { text: '👑 Platform Overview', command: 'Platform overview' },
    { text: '💰 Revenue Analysis', command: 'Revenue analysis' },
    { text: '🏛️ Top Colleges', command: 'Top colleges' },
    { text: '💡 Recommendations', command: 'Give me recommendations' },
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
          <div style={styles.headerIcon}>SA</div>
          <div>
            <h1 style={styles.headerTitle}>Super Admin AI</h1>
            <p style={styles.headerSubtitle}>Platform management assistant</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.creditsBadge}>
            <span style={styles.creditsIcon}>👑</span>
            <span style={styles.creditsText}>Platform Admin</span>
          </div>
          <div style={styles.avatar}>SA</div>
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
                    background: msg.role === 'user' ? '#7C3AED' : msg.isError ? '#FEE2E2' : '#FFFFFF',
                    color: msg.role === 'user' ? '#FFFFFF' : msg.isError ? '#DC2626' : '#111827',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    border: msg.role === 'bot' ? '1px solid #E5E7EB' : 'none',
                  }}>
                    <p style={{ ...styles.messageText, margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                    <div style={styles.messageFooter}>
                      <span style={styles.timestamp}>{msg.timestamp}</span>
                    </div>
                  </div>
                  {msg.role === 'user' && <div style={styles.userAvatar}>SA</div>}
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
                placeholder="Ask about platform analytics, revenue, colleges..."
                style={{ ...styles.input, color: '#374151' }}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
                disabled={loading}
              />
              <button
                style={{ ...styles.sendBtn, background: input.trim() ? '#7C3AED' : '#E5E7EB', cursor: input.trim() ? 'pointer' : 'default' }}
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
              <h2 style={styles.overviewTitle}>Platform Overview</h2>
            </div>
            
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, backgroundColor: '#EDE9FE' }}>🏛️</div>
                <div style={styles.statInfo}>
                  <span style={{ ...styles.statNumber, color: '#7C3AED' }}>{analytics?.total_colleges || 0}</span>
                  <span style={styles.statLabel}>Colleges</span>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, backgroundColor: '#DBEAFE' }}>👥</div>
                <div style={styles.statInfo}>
                  <span style={{ ...styles.statNumber, color: '#1D4ED8' }}>{analytics?.total_students || 0}</span>
                  <span style={styles.statLabel}>Students</span>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, backgroundColor: '#FEF3C7' }}>📋</div>
                <div style={styles.statInfo}>
                  <span style={{ ...styles.statNumber, color: '#B45309' }}>{analytics?.total_applications || 0}</span>
                  <span style={styles.statLabel}>Applications</span>
                </div>
              </div>
              <div style={styles.statCard}>
                <div style={{ ...styles.statIcon, backgroundColor: '#D1FAE5' }}>💰</div>
                <div style={styles.statInfo}>
                  <span style={{ ...styles.statNumber, color: '#047857' }}>₹{((analytics?.total_revenue || 0) / 100).toLocaleString()}</span>
                  <span style={styles.statLabel}>Revenue</span>
                </div>
              </div>
            </div>

            <div style={styles.quickLinks}>
              <h3 style={styles.quickLinksTitle}>Management Links</h3>
              <div style={styles.quickLinksGrid}>
                <Link to="/superadmin/colleges" style={styles.quickLinkCard}>
                  <span style={styles.quickLinkIcon}>🏛️</span>
                  <span style={styles.quickLinkText}>Colleges</span>
                </Link>
                <Link to="/superadmin/admins" style={styles.quickLinkCard}>
                  <span style={styles.quickLinkIcon}>👥</span>
                  <span style={styles.quickLinkText}>Admins</span>
                </Link>
                <Link to="/superadmin/analytics" style={styles.quickLinkCard}>
                  <span style={styles.quickLinkIcon}>📊</span>
                  <span style={styles.quickLinkText}>Analytics</span>
                </Link>
                <Link to="/superadmin/plans/college" style={styles.quickLinkCard}>
                  <span style={styles.quickLinkIcon}>📋</span>
                  <span style={styles.quickLinkText}>Plans</span>
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
  headerIcon: { width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#7C3AED', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600' },
  headerTitle: { fontSize: '18px', fontWeight: '600', color: '#111827', margin: 0 },
  headerSubtitle: { fontSize: '12px', color: '#6B7280', margin: 0 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  creditsBadge: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#EDE9FE', borderRadius: '20px', padding: '6px 14px' },
  creditsIcon: { fontSize: '14px' },
  creditsText: { fontSize: '13px', fontWeight: '500', color: '#7C3AED' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#7C3AED', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600' },
  tabs: { display: 'flex', gap: '4px', padding: '0.5rem 2rem', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' },
  tab: { padding: '8px 16px', border: 'none', backgroundColor: 'transparent', borderRadius: '8px', fontSize: '14px', fontWeight: '500', color: '#6B7280', cursor: 'pointer' },
  tabActive: { backgroundColor: '#EDE9FE', color: '#7C3AED' },
  mainContent: { flex: 1, padding: '1.5rem 2rem' },
  chatContainer: { backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', minHeight: '500px' },
  messagesArea: { flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' },
  messageRow: { display: 'flex', alignItems: 'flex-end', gap: '10px' },
  botAvatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#7C3AED', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', flexShrink: 0 },
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

export default SuperAdminAIAgent;
