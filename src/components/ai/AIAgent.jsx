import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudentProfile } from '../../services/student';
import { getCreditBalance } from '../../services/credits';
import { getCourses } from '../../services/courses';
import { submitApplication } from '../../services/applications';
import { useAccess } from '../../context/AccessContext';
import api from '../../services/api';

const AIAgent = () => {
  const navigate = useNavigate();
  const { refreshAccess } = useAccess();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(null);
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const inputRef = useRef(null);

  const CHAT_HISTORY_KEY = 'ai_advisor_history';

  const loadChatHistory = useCallback(() => {
    const saved = localStorage.getItem(CHAT_HISTORY_KEY);
    if (saved) {
      try {
        const history = JSON.parse(saved);
        if (history.length > 0) {
          setMessages(history);
        } else {
          initWelcomeMessage();
        }
      } catch {
        initWelcomeMessage();
      }
    } else {
      initWelcomeMessage();
    }
  }, []);

  const initWelcomeMessage = () => {
    setMessages([{
      role: 'bot',
      content: "Hello! I'm your College Admission AI Advisor 🎓\n\nI can help you find the perfect course and college. Tell me:\n\n• What course are you interested in?\n• Where would you like to study?\n• What's your career goal?\n\nTry asking:\n\"What are the best B.Tech colleges in Pune?\"\n\"Suggest MBA programs with good placement\"\n\"What are the eligibility criteria for MBBS?\"",
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const saveChatHistory = useCallback((msgs) => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(msgs));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [creditRes, profileRes, coursesRes] = await Promise.all([
        getCreditBalance(),
        getStudentProfile(),
        getCourses({ per_page: 100 })
      ]);
      setCredits(creditRes.data.balance);
      setProfile(profileRes.data);
      
      if (coursesRes.data.courses) {
        setCourses(coursesRes.data.courses);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, []);

  useEffect(() => {
    loadChatHistory();
    fetchData();
    inputRef.current?.focus();
  }, [loadChatHistory, fetchData]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';
      
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        setTimeout(() => handleSend(transcript), 300);
      };
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error('Recognition error:', e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const stripMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/^#+\s*/gm, '')
      .replace(/^\d+\.\s*/gm, '')
      .replace(/^[-*]\s*/gm, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const speak = useCallback((text) => {
    if (!autoSpeak) return;
    if (!synthRef.current) return;
    
    synthRef.current.cancel();
    
    const cleanText = stripMarkdown(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  }, [autoSpeak]);

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const applyForCourse = async (course) => {
    try {
      await submitApplication({
        course_id: course._id,
        college_id: course.college_id,
        application_type: 'new'
      });
      
      const successMsg = {
        role: 'bot',
        content: `✅ Successfully applied for *${course.course_name}* at *${course.college_name}*!\n\nYour application has been submitted. You can track its status in the Applications section.`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        isSuccess: true
      };
      
      setMessages(prev => [...prev, successMsg]);
      saveChatHistory([...messages, successMsg]);
    } catch (err) {
      let errorText = `❌ Failed to apply for *${course.course_name}*.`;
      if (err.response?.data?.error) {
        errorText = `❌ ${err.response.data.error}`;
      } else {
        errorText = `❌ Failed to apply. Please try again later.`;
      }
      const errorMsg = {
        role: 'bot',
        content: errorText,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleApplyToCourse = (course) => {
    applyForCourse(course);
  };

  const handleSend = useCallback(async (text = input) => {
    const trimmed = text?.trim();
    if (!trimmed) return;

    if (credits !== null && credits < 1) {
      return;
    }

    const userMsg = {
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);
    setInput('');
    setLoading(true);
    stopSpeaking();

    try {
      const response = await api.post('/ai-agent/chat', { message: trimmed });
      
      const { reply, credits_remaining, error: apiError } = response.data;
      
      if (apiError) {
        throw new Error(apiError);
      }

      setCredits(credits_remaining);

      let botMsg = {
        role: 'bot',
        content: reply,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        creditsRemaining: credits_remaining
      };

      const lowerMsg = trimmed.toLowerCase();
      if (lowerMsg.includes('apply') && (lowerMsg.includes('bca') || lowerMsg.includes('b.tech') || lowerMsg.includes('mba') || lowerMsg.includes('msc'))) {
        const courseType = lowerMsg.includes('bca') ? 'BCA' : 
                          lowerMsg.includes('b.tech') ? 'B.Tech' : 
                          lowerMsg.includes('mba') ? 'MBA' : 
                          lowerMsg.includes('msc') ? 'M.Sc' : '';
        
        const matchingCourses = courses.filter(c => 
          courseType ? c.course_name?.toLowerCase().includes(courseType.toLowerCase()) : true
        );

        if (matchingCourses.length > 0) {
          const coursesList = matchingCourses.slice(0, 5).map((c, i) => 
            `${i + 1}. ${c.course_name} at ${c.college_name} - ₹${c.fees?.toLocaleString()}`
          ).join('\n');

          botMsg = {
            ...botMsg,
            content: `🎓 Here are *${courseType}* courses available:\n\n${coursesList}\n\nClick on any course below to apply directly!`,
            coursesData: matchingCourses.slice(0, 5)
          };
        }
      }

      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
      speak(reply);
      refreshAccess();

    } catch (err) {
      console.error('Chat error:', err);
      
      let errorResponse = "I'm having trouble understanding. Could you please rephrase your question about college admissions?";
      
      if (err.response?.status === 402) {
        errorResponse = "You've run out of AI credits! To continue chatting, please purchase more credits.";
        setTimeout(() => navigate('/student/credits/purchase'), 2000);
      } else if (err.response?.data?.reply) {
        errorResponse = err.response.data.reply;
      }

      const botMsg = {
        role: 'bot',
        content: errorResponse,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      
      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    } finally {
      setLoading(false);
    }
  }, [input, credits, messages, navigate, saveChatHistory, speak, refreshAccess, courses]);

  const clearChatHistory = () => {
    localStorage.removeItem(CHAT_HISTORY_KEY);
    initWelcomeMessage();
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'S';

  const formatTimestamp = (ts) => {
    return ts || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const suggestions = [
    { text: 'Show BCA colleges', command: 'Show me BCA colleges in Pune' },
    { text: 'Apply for B.Tech', command: 'I want to apply for B.Tech' },
    { text: 'MBA eligibility', command: 'What is the eligibility for MBA?' },
    { text: 'Best Data Science', command: 'Best colleges for Data Science' },
    { text: 'Scholarships', command: 'Are there scholarships available?' },
    { text: 'Compare colleges', command: 'Compare colleges in Pune for Computer Science' },
  ];

  const renderMessageContent = (msg) => {
    if (msg.coursesData && msg.coursesData.length > 0) {
      return (
        <div>
          <div style={styles.messageText}>{msg.content}</div>
          <div style={styles.coursesGrid}>
            {msg.coursesData.map((course, i) => (
              <div key={i} style={styles.courseCard} onClick={() => handleApplyToCourse(course)}>
                <div style={styles.courseName}>{course.course_name}</div>
                <div style={styles.courseCollege}>{course.college_name}</div>
                <div style={styles.courseFees}>₹{course.fees?.toLocaleString()}</div>
                <button style={styles.applyBtn}>Apply Now</button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (msg.collegeData) {
      return (
        <div>
          <div style={styles.messageText}>{msg.content}</div>
          <div style={styles.collegeActions}>
            {msg.collegeData.courses.map((course, i) => (
              <button 
                key={i} 
                style={styles.courseApplyBtn}
                onClick={() => handleApplyToCourse(course)}
              >
                Apply for {course.course_name}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return <div style={styles.messageText}>{msg.content}</div>;
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.headerIcon}>🎓</div>
          <div>
            <h1 style={styles.headerTitle}>College Admission Advisor</h1>
            <p style={styles.headerSubtitle}>Your personal admission guide</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.creditsBadge}>
            <span style={styles.creditsEmoji}>⚡</span>
            <span style={styles.creditsValue}>{credits ?? '...'}</span>
            <span style={styles.creditsLabel}>credits</span>
          </div>
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            style={{ ...styles.voiceBtn, background: autoSpeak ? '#10B981' : '#6B7280' }}
            title={autoSpeak ? 'Voice On' : 'Voice Off'}
          >
            {autoSpeak ? '🔊' : '🔇'}
          </button>
          {messages.length > 1 && (
            <button onClick={clearChatHistory} style={styles.clearBtn}>
              🗑️ New Chat
            </button>
          )}
          <div style={styles.userAvatar}>{getInitials(profile?.name)}</div>
        </div>
      </div>

      {/* Chat Area */}
      <div style={styles.chatArea}>
        {messages.length <= 1 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🎓</div>
            <h2 style={styles.emptyTitle}>College Admission Advisor</h2>
            <p style={styles.emptySubtitle}>Ask me anything about courses, colleges, admissions, and career guidance</p>
            
            <div style={styles.suggestionsGrid}>
              {suggestions.map((sug, i) => (
                <button key={i} style={styles.suggestionCard} onClick={() => handleSend(sug.command)}>
                  {sug.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={styles.messagesList}>
            {messages.map((msg, i) => (
              <div key={i} style={{ ...styles.messageWrapper, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'bot' && (
                  <div style={styles.botAvatar}>🤖</div>
                )}
                <div style={{
                  ...styles.messageBubble,
                  background: msg.role === 'user' 
                    ? 'linear-gradient(135deg, #185FA5 0%, #0C447C 100%)'
                    : msg.isError 
                      ? '#FEE2E2' 
                      : msg.isSuccess
                        ? '#ECFDF5'
                        : '#FFFFFF',
                  color: msg.role === 'user' ? '#FFFFFF' : msg.isError ? '#DC2626' : msg.isSuccess ? '#047857' : '#1F2937',
                  border: msg.role === 'bot' ? '1px solid #E5E7EB' : 'none',
                  borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                }}>
                  {renderMessageContent(msg)}
                  <div style={styles.messageFooter}>
                    <span style={{ ...styles.timestamp, color: msg.role === 'user' ? 'rgba(255,255,255,0.6)' : '#9CA3AF' }}>
                      {formatTimestamp(msg.timestamp)}
                    </span>
                    {msg.creditsRemaining !== undefined && (
                      <span style={{ ...styles.creditsTag, background: msg.role === 'user' ? 'rgba(255,255,255,0.2)' : '#FEF3C7', color: msg.role === 'user' ? '#fff' : '#92400E' }}>
                        ⚡ {msg.creditsRemaining}
                      </span>
                    )}
                    {msg.role === 'bot' && !msg.isError && (
                      <button onClick={() => speak(msg.content)} style={styles.speakBtn}>🔊</button>
                    )}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div style={styles.userAvatarLarge}>{getInitials(profile?.name)}</div>
                )}
              </div>
            ))}
            
            {loading && (
              <div style={styles.messageWrapper}>
                <div style={styles.botAvatar}>🤖</div>
                <div style={styles.typingBubble}>
                  <span style={styles.typingDot}></span>
                  <span style={{ ...styles.typingDot, animationDelay: '0.2s' }}></span>
                  <span style={{ ...styles.typingDot, animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={styles.inputArea}>
        <div style={styles.inputWrapper}>
          {isSpeaking && (
            <button onClick={stopSpeaking} style={styles.stopSpeakingBtn}>
              ⏹️ Stop
            </button>
          )}
          {hasSpeechRecognition && !isSpeaking && (
            <button
              onClick={isListening ? stopListening : startListening}
              style={{ ...styles.micBtn, background: isListening ? '#EF4444' : 'transparent', color: isListening ? '#fff' : '#6B7280' }}
            >
              {isListening ? '🔴' : '🎤'}
            </button>
          )}
          <input
            ref={inputRef}
            type="text"
            name="message"
            id="message"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about colleges, courses, admissions..."
            style={styles.input}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            style={{ ...styles.sendBtn, opacity: loading || !input.trim() ? 0.5 : 1 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p style={styles.inputHint}>AI Advisor can make mistakes. Verify important information.</p>
      </div>

      {/* Low Credits Banner */}
      {credits !== null && credits < 5 && (
        <div style={styles.lowCreditsBanner}>
          <span>⚠️ Running low on credits!</span>
          <button onClick={() => navigate('/student/credits/purchase')} style={styles.buyCreditsBtn}>
            Buy Credits
          </button>
        </div>
      )}
    </div>
  );
};

const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#F9FAFB',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E5E7EB',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerIcon: {
    fontSize: '32px',
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  headerSubtitle: {
    fontSize: '13px',
    color: '#6B7280',
    margin: '2px 0 0 0',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  creditsBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#FEF3C7',
    padding: '8px 14px',
    borderRadius: '20px',
    border: '1px solid #FCD34D',
  },
  creditsEmoji: {
    fontSize: '16px',
  },
  creditsValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#92400E',
  },
  creditsLabel: {
    fontSize: '12px',
    color: '#92400E',
  },
  voiceBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtn: {
    padding: '8px 16px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#374151',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #185FA5 0%, #0C447C 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
  },
  userAvatarLarge: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6B7280 0%, #4B5563 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#FFFFFF',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '40px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '24px',
  },
  emptyTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 12px 0',
  },
  emptySubtitle: {
    fontSize: '16px',
    color: '#6B7280',
    margin: '0 0 32px 0',
    maxWidth: '500px',
  },
  suggestionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    maxWidth: '700px',
    width: '100%',
  },
  suggestionCard: {
    padding: '16px',
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#374151',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  messagesList: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
  },
  messageWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    width: '100%',
  },
  botAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#185FA5',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
  },
  messageBubble: {
    flex: 1,
    padding: '14px 18px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    maxWidth: '100%',
  },
  messageText: {
    fontSize: '15px',
    lineHeight: '1.7',
    whiteSpace: 'pre-wrap',
  },
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  courseCard: {
    padding: '16px',
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  courseName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px',
  },
  courseCollege: {
    fontSize: '12px',
    color: '#6B7280',
    marginBottom: '8px',
  },
  courseFees: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#059669',
    marginBottom: '12px',
  },
  applyBtn: {
    width: '100%',
    padding: '8px 16px',
    backgroundColor: '#185FA5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  collegeActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '12px',
  },
  courseApplyBtn: {
    padding: '10px 16px',
    backgroundColor: '#185FA5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    textAlign: 'left',
  },
  messageFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '10px',
  },
  timestamp: {
    fontSize: '11px',
  },
  creditsTag: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '10px',
    fontWeight: '600',
  },
  speakBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '2px',
  },
  typingBubble: {
    display: 'flex',
    gap: '6px',
    padding: '14px 18px',
    backgroundColor: '#F9FAFB',
    borderRadius: '20px 20px 20px 4px',
    border: '1px solid #E5E7EB',
  },
  typingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#185FA5',
    animation: 'pulse 1.4s ease-in-out infinite',
  },
  inputArea: {
    padding: '16px 24px 20px',
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #E5E7EB',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#F3F4F6',
    borderRadius: '24px',
    padding: '6px 6px 6px 20px',
    border: '1px solid #E5E7EB',
  },
  stopSpeakingBtn: {
    padding: '6px 12px',
    backgroundColor: '#FEE2E2',
    border: 'none',
    borderRadius: '16px',
    color: '#DC2626',
    cursor: 'pointer',
    fontSize: '12px',
    flexShrink: 0,
  },
  micBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    fontSize: '15px',
    outline: 'none',
    padding: '10px 0',
    color: '#111111',
  },
  sendBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: '#185FA5',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  inputHint: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#9CA3AF',
    margin: '10px 0 0 0',
  },
  lowCreditsBanner: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    padding: '12px',
    backgroundColor: '#FEF3C7',
    borderTop: '1px solid #FCD34D',
    fontSize: '14px',
    color: '#92400E',
  },
  buyCreditsBtn: {
    padding: '8px 16px',
    backgroundColor: '#185FA5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default AIAgent;
