import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '../../services/ai';
import Alert from '../common/Alert';

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const S = {
  page: {
    fontFamily: "'DM Sans', sans-serif",
    padding: '1.5rem',
    backgroundColor: '#f4f5f7',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  wrap: {
    width: '100%',
    maxWidth: 680,
    paddingTop: '1rem',
  },

  /* Header */
  header: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px 12px 0 0',
    borderBottom: 'none',
    padding: '1rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 36, height: 36,
    borderRadius: 10,
    background: '#185FA5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, color: '#E6F1FB', flexShrink: 0,
  },
  headerTitle: { fontSize: 15, fontWeight: 500, color: '#111', margin: 0 },
  headerSub:   { fontSize: 12, color: '#6b7280', marginTop: 1 },
  onlineDot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#3B6D11', marginLeft: 'auto', flexShrink: 0,
  },

  /* Messages area */
  messagesWrap: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderTop: 'none',
    borderBottom: 'none',
    height: 440,
    overflowY: 'auto',
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },

  /* Message rows */
  rowUser: { display: 'flex', justifyContent: 'flex-end' },
  rowBot:  { display: 'flex', justifyContent: 'flex-start', gap: 8, alignItems: 'flex-end' },

  botAvatar: {
    width: 28, height: 28, borderRadius: '50%',
    background: '#185FA5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 600, color: '#E6F1FB',
    flexShrink: 0,
  },
  bubbleUser: {
    maxWidth: '72%',
    background: '#185FA5',
    color: '#E6F1FB',
    fontSize: 13,
    lineHeight: 1.6,
    padding: '8px 14px',
    borderRadius: '12px 12px 4px 12px',
  },
  bubbleBot: {
    maxWidth: '72%',
    background: '#f3f4f6',
    color: '#111',
    fontSize: 13,
    lineHeight: 1.6,
    padding: '8px 14px',
    borderRadius: '12px 12px 12px 4px',
  },
  timestamp: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'right',
  },

  /* Typing indicator */
  typingBubble: {
    background: '#f3f4f6',
    borderRadius: '12px 12px 12px 4px',
    padding: '10px 14px',
    display: 'flex',
    gap: 4,
    alignItems: 'center',
  },
  dot: (delay) => ({
    width: 6, height: 6, borderRadius: '50%',
    background: '#9ca3af',
    animation: `bounce 1.2s ease-in-out ${delay}s infinite`,
  }),

  /* Suggestions */
  suggestRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 4,
  },
  suggestChip: {
    fontSize: 12, fontWeight: 500,
    padding: '5px 12px',
    borderRadius: 100,
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },

  /* Input bar */
  inputBar: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderTop: '1px solid #f3f4f6',
    borderRadius: '0 0 12px 12px',
    padding: '0.875rem 1.25rem',
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    fontSize: 13,
    border: '1px solid #d1d5db',
    borderRadius: 8,
    background: '#fff',
    color: '#111',
    outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.15s',
  },
  btnSend: (disabled) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36, height: 36,
    borderRadius: 8,
    border: 'none',
    background: disabled ? '#e5e7eb' : '#185FA5',
    color: disabled ? '#9ca3af' : '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 16,
    flexShrink: 0,
    transition: 'background 0.15s',
  }),
};

/* ─── Suggestion prompts ──────────────────────────────────────────────────── */
const SUGGESTIONS = [
  'I like programming and maths',
  'What are the best engineering courses?',
  'I want to work in data science',
  'Help me choose between CS and IT',
];

/* ─── Timestamp helper ────────────────────────────────────────────────────── */
const now = () =>
  new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

/* ─── Typing dots animation ───────────────────────────────────────────────── */
const TypingDots = () => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
    <div style={S.botAvatar}>AI</div>
    <div style={S.typingBubble}>
      {[0, 0.2, 0.4].map((d, i) => (
        <div key={i} style={S.dot(d)} />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  </div>
);

/* ─── Main ────────────────────────────────────────────────────────────────── */
const CareerChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: "Hi! I'm your AI career assistant. Tell me about your interests, skills, or career goals, and I'll help you find suitable courses.",
      time: now(),
    },
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [focused, setFocused] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = { role: 'user', content: trimmed, time: now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await sendChatMessage({ message: trimmed });
      setMessages(prev => [
        ...prev,
        { role: 'bot', content: response.data.reply, time: now() },
      ]);
    } catch {
      setError('Failed to get a response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); send(input); };
  const handleSuggestion = (text) => { setInput(text); send(text); };

  const showSuggestions = messages.length === 1 && !loading;

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        {error && (
          <div style={{ marginBottom: 10 }}>
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}

        {/* ── Header ── */}
        <div style={S.header}>
          <div style={S.headerIcon}>AI</div>
          <div>
            <p style={S.headerTitle}>AI Career Assistant</p>
            <p style={S.headerSub}>Powered by your admission platform</p>
          </div>
          <div style={S.onlineDot} title="Online" />
        </div>

        {/* ── Messages ── */}
        <div style={S.messagesWrap}>
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === 'user' ? (
                <div style={S.rowUser}>
                  <div>
                    <div style={S.bubbleUser}>{msg.content}</div>
                    <div style={S.timestamp}>{msg.time}</div>
                  </div>
                </div>
              ) : (
                <div style={S.rowBot}>
                  <div style={S.botAvatar}>AI</div>
                  <div>
                    <div style={S.bubbleBot}>{msg.content}</div>
                    <div style={{ ...S.timestamp, textAlign: 'left' }}>{msg.time}</div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && <TypingDots />}

          {/* Suggestion chips — shown only on first load */}
          {showSuggestions && (
            <div style={{ marginTop: 4 }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>
                Try asking:
              </div>
              <div style={S.suggestRow}>
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    style={S.suggestChip}
                    onClick={() => handleSuggestion(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input bar ── */}
        <form onSubmit={handleSubmit} style={S.inputBar}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about courses, careers, or colleges…"
            disabled={loading}
            style={{
              ...S.input,
              borderColor: focused ? '#185FA5' : '#d1d5db',
              opacity: loading ? 0.6 : 1,
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            style={S.btnSend(loading || !input.trim())}
            title="Send"
          >
            ↑
          </button>
        </form>
      </div>
    </div>
  );
};

export default CareerChat;