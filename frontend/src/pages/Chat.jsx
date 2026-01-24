import React, { useEffect, useRef, useState } from 'react';
import { askQuery, fetchChatHistory } from '../api/tenant';


export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, from: 'system', text: 'Ask me anything about your documents.' },
  ]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [visibleSources, setVisibleSources] = useState({});
  const [expandedSourceText, setExpandedSourceText] = useState({});
  const [sessionId, setSessionId] = useState(null);
  const containerRef = useRef(null);

  // Load session and message history on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('chatSessionId');
    if (savedSessionId) {
      setSessionId(savedSessionId);
      loadChatHistory(savedSessionId);
    }
  }, []);

  async function loadChatHistory(sessId) {
    try {
      const history = await fetchChatHistory(sessId);
      if (Array.isArray(history) && history.length > 0) {
        const formattedMessages = history.map((msg, idx) => ({
          id: idx,
          from: msg.role === 'assistant' ? 'bot' : 'user',
          text: msg.content,
          created_at: msg.created_at,
          sources: [],
        }));
        setMessages(formattedMessages);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  }

  async function send() {
    if (!text.trim()) return;
    const msg = { id: Date.now(), from: 'user', text, created_at: new Date().toISOString() };
    setMessages((m) => [...m, msg]);
    setText('');
    setLoading(true);

    const botMsgId = Date.now() + 1;
    const botMsg = {
      id: botMsgId,
      from: 'bot',
      text: '',
      created_at: new Date().toISOString(),
      sources: [],
    };
    setMessages((m) => [...m, botMsg]);

    try {
      await askQuery(
        text,
        sessionId,
        // onToken callback - update message text as tokens arrive
        (token) => {
          setMessages((m) => {
            const updated = [...m];
            const idx = updated.findIndex((msg) => msg.id === botMsgId);
            if (idx !== -1) {
              updated[idx] = { ...updated[idx], text: updated[idx].text + token };
            }
            return updated;
          });
        },
        // onSources callback - update message sources when they arrive
        (sourcesData) => {
          setMessages((m) => {
            const updated = [...m];
            const idx = updated.findIndex((msg) => msg.id === botMsgId);
            if (idx !== -1) {
              updated[idx] = { ...updated[idx], sources: Array.isArray(sourcesData) ? sourcesData : [] };
            }
            return updated;
          });
        },
        // onSessionId callback - save session_id from start event
        (newSessionId) => {
          setSessionId(newSessionId);
          localStorage.setItem('chatSessionId', newSessionId);
        }
      );
    } catch (err) {
      setMessages((m) => {
        const updated = [...m];
        const idx = updated.findIndex((msg) => msg.id === botMsgId);
        if (idx !== -1) {
          updated[idx] = { ...updated[idx], text: 'Error: ' + (err?.message ?? 'Request failed') };
        }
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function startNewChat() {
    localStorage.removeItem('chatSessionId');
    setSessionId(null);
    setMessages([
      { id: 1, from: 'system', text: 'Ask me anything about your documents.' },
    ]);
  }

  function toggleSources(msgId) {
    setVisibleSources((s) => ({ ...s, [msgId]: !s[msgId] }));
  }

  function toggleExpand(msgId, idx) {
    setExpandedSourceText((s) => ({ ...s, [msgId + ':' + idx]: !s[msgId + ':' + idx] }));
  }

  function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString();
  }

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h2>Chat</h2>
        <button className="new-chat-btn" onClick={startNewChat}>New Chat</button>
      </div>
      <div className="chat-window">
        <div className="chat-messages" ref={containerRef} aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={`chat-message ${m.from}`}>
              <div className="meta">
                <span className="from">{m.from}</span>
                {m.created_at && <span className="timestamp">{formatDate(m.created_at)}</span>}
              </div>
              <div className="bubble">
                <div className="message-text" dangerouslySetInnerHTML={{ __html: (m.text || '').replace(/\n/g, '<br/>') }} />

                {m.from === 'bot' && Array.isArray(m.sources) && m.sources.length > 0 && (
                  <div className="sources">
                    <button className="show-sources" onClick={() => toggleSources(m.id)}>
                      {visibleSources[m.id] ? 'Hide sources' : `Show sources (${m.sources.length})`}
                    </button>

                    {visibleSources[m.id] && (
                      <div className="source-list">
                        {m.sources.map((s, idx) => (
                          <div key={idx} className="source-item">
                            <div className="source-meta">
                              <strong className="filename">Doc: {s?.doc_name || "Unknown"}</strong>
                              {s?.source?.page !== undefined && <span className="page">Page: {s.source.page}</span>}
                              {s?.source?.slide !== undefined && <span className="slide">Slide: {s.source.slide}</span>}
                            </div>

                            <div className="source-text">
                              <div className={`snippet ${expandedSourceText[m.id + ':' + idx] ? 'expanded' : ''}`}>
                                { (expandedSourceText[m.id + ':' + idx] ? (s?.text ?? '') : ((s?.text ?? '').slice(0, 220) + ((s?.text ?? '').length > 220 ? '...' : ''))) }
                              </div>
                              { (s?.text ?? '').length > 220 && (
                                <button className="expand" onClick={() => toggleExpand(m.id, idx)}>{expandedSourceText[m.id + ':' + idx] ? 'Show less' : 'Show more'}</button>
                              ) }
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          ))}

          {loading && <div className="small-muted">Waiting for response...</div>}
        </div>

        <div className="chat-input">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask a question..."
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            rows={2}
            disabled={loading}
          />
          <button className="send-btn" onClick={send} disabled={loading || !text.trim()}>{loading ? '...' : 'Send'}</button>
        </div>
      </div>
    </div>
  );
}
