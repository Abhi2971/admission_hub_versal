import React, { useState, useRef, useEffect } from 'react';
import { sendAgentMessage } from '../../services/ai';
import Alert from '../common/Alert';
import Loader from '../common/Loader';

const AIAgent = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hi! I\'m your AI career assistant. I can help you find courses, answer questions about colleges, and guide your career. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const response = await sendAgentMessage(input);
      const botMessage = { role: 'bot', content: response.data.response };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      if (err.response?.status === 402) {
        setError('Insufficient credits. Please purchase more.');
      } else {
        setError('Failed to get response from AI');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: 'linear-gradient(135deg, #ffffff, #f8fafc)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', border: '1px solid rgba(226,232,240,0.8)' }}>
      <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', padding: '24px 28px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', margin: 0 }}>AI Career Assistant</h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', margin: '6px 0 0 0' }}>Your personal admission guide</p>
      </div>
      <div className="h-96 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '500px' }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2">
              <Loader size="sm" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      <form onSubmit={handleSend} className="border-t p-4 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about courses, colleges, or career paths..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-r hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default AIAgent;