import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Trash2,
  Sparkles,
  Bot,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
import { chatbotAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function ChatbotWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialSuggestions, setInitialSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isRecruiter = ['recruiter', 'hr_lead', 'admin', 'compliance'].includes(user?.role);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  // Load or initialize active session when opened
  useEffect(() => {
    if (isOpen && !session) {
      (async () => {
        try {
          const res = await chatbotAPI.getSession();
          setSession(res.data.session);
          setMessages(res.data.session.messages || []);
        } catch (e) {
          console.error('Failed to initialize chatbot session:', e);
        }
      })();
    }
  }, [isOpen, session]);

  // Configure initial suggested pills based on role
  useEffect(() => {
    if (isRecruiter) {
      setInitialSuggestions([
        'How does the JD bias scanner work?',
        'How do I review borderline candidates?',
        'What is recorded in the audit log?',
        'How are aptitude tests generated?',
      ]);
    } else {
      setInitialSuggestions([
        'How does blind screening work?',
        'What is the aptitude test format?',
        'How is my eligibility calculated?',
        'What do application statuses mean?',
      ]);
    }
  }, [isRecruiter]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMsg).trim();
    if (!text || loading) return;

    setInputMsg('');
    setLoading(true);

    // Optimistically add user message to list
    const tempUserMsg = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      let currentSessionId = session?.id;
      if (!currentSessionId) {
        const sessRes = await chatbotAPI.getSession();
        currentSessionId = sessRes.data.session.id;
        setSession(sessRes.data.session);
      }

      const res = await chatbotAPI.sendMessage(currentSessionId, {
        message: text,
        context: {
          userRole: user?.role,
          userName: user?.firstName,
        },
      });

      // Replace with confirmed messages
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        res.data.userMessage,
        res.data.assistantMessage,
      ]);
    } catch (e) {
      const errorMsg = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSession = async () => {
    if (!session?.id) return;
    try {
      await chatbotAPI.clearSession(session.id);
      setMessages([]);
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render formatted markdown text (bolding & bullet lines)
  const formatContent = (content) => {
    if (!content) return '';
    return content.split('\n').map((line, i) => {
      let formattedLine = line;
      // Handle bold **text**
      const parts = formattedLine.split(/(\*\*.*?\*\*)/g);
      return (
        <span key={i} style={{ display: 'block', minHeight: line.trim() ? 'auto' : 8 }}>
          {parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={idx} style={{ color: 'var(--color-text-primary)' }}>{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </span>
      );
    });
  };

  return (
    <>
      {/* ── Floating Action Button ────────────────────────────────────────── */}
      {!isOpen && (
        <button
          id="open-chatbot-btn"
          className="chatbot-fab"
          onClick={() => setIsOpen(true)}
          title="Open AI Hiring Assistant"
        >
          <Sparkles size={16} />
          <span>FairHire AI</span>
        </button>
      )}

      {/* ── Chatbot Window ────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              }}>
                <Bot size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)' }}>
                  FairHire AI
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }} />
                  {isRecruiter ? 'Recruiter Assistant' : 'Candidate Assistant'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {messages.length > 0 && (
                <button
                  id="clear-chat-btn"
                  onClick={handleClearSession}
                  title="Clear conversation"
                  style={{
                    background: 'none', border: 'none', color: 'var(--color-text-muted)',
                    cursor: 'pointer', padding: 4, borderRadius: 'var(--radius-sm)',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <Trash2 size={15} />
                </button>
              )}
              <button
                id="close-chatbot-btn"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                style={{
                  background: 'none', border: 'none', color: 'var(--color-text-muted)',
                  cursor: 'pointer', padding: 4, borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="chatbot-messages">
            {/* Welcome message */}
            <div className="chat-msg assistant">
              <div className="chat-bubble">
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  👋 Hi {user?.firstName || 'there'}!
                </p>
                <p style={{ margin: '6px 0 0', color: 'var(--color-text-secondary)', fontSize: 12.5 }}>
                  {isRecruiter
                    ? 'I can help you review JD bias scores, clarify review queue standards, and understand fair hiring rules.'
                    : 'I can answer questions about your application status, blind screening, aptitude tests, and fair eligibility.'}
                </p>
              </div>

              {messages.length === 0 && (
                <div className="chat-suggestions">
                  {initialSuggestions.map((pill, i) => (
                    <button
                      key={i}
                      className="chat-pill"
                      onClick={() => handleSendMessage(pill)}
                    >
                      {pill}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Conversation History */}
            {messages.map((m, idx) => (
              <div key={m.id || idx} className={`chat-msg ${m.role}`}>
                <div className="chat-bubble">
                  {formatContent(m.content)}
                </div>

                {/* Suggestion pills attached to assistant reply */}
                {m.role === 'assistant' && m.suggestions && m.suggestions.length > 0 && (
                  <div className="chat-suggestions">
                    {m.suggestions.map((pill, pIdx) => (
                      <button
                        key={pIdx}
                        className="chat-pill"
                        onClick={() => handleSendMessage(pill)}
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Loading / Typing Indicator */}
            {loading && (
              <div className="chat-msg assistant">
                <div className="chat-bubble typing-dots">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="chatbot-input-bar">
            <input
              ref={inputRef}
              id="chatbot-msg-input"
              type="text"
              className="chatbot-input"
              placeholder="Ask about fair hiring, tests, status…"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              id="send-chat-msg-btn"
              className="btn btn-primary btn-sm"
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMsg.trim()}
              style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', height: 38 }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
