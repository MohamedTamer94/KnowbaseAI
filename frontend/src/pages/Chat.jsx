import React, { useEffect, useRef, useState } from 'react';
import { askQuery } from '../api/tenant';


export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, from: 'system', text: 'Ask me anything about your documents.' },
  ]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [visibleSources, setVisibleSources] = useState({});
  const [expandedSourceText, setExpandedSourceText] = useState({});
  const containerRef = useRef(null);

  async function send() {
    if (!text.trim()) return;
    const msg = { id: Date.now(), from: 'user', text };
    setMessages((m) => [...m, msg]);
    setText('');
    setLoading(true);

    try {
      const res = await askQuery(text);
      const botMsg = {
        id: Date.now() + 1,
        from: 'bot',
        text: res?.response ?? 'No response from server',
        sources: Array.isArray(res?.sources) ? res.sources : [],
      };
      setMessages((m) => [...m, botMsg]);
    } catch (err) {
      setMessages((m) => [...m, { id: Date.now() + 2, from: 'bot', text: 'Error: ' + (err?.message ?? 'Request failed'), sources: [] }]);
    } finally {
      setLoading(false);
    }
  }

  function toggleSources(msgId) {
    setVisibleSources((s) => ({ ...s, [msgId]: !s[msgId] }));
  }

  function toggleExpand(msgId, idx) {
    setExpandedSourceText((s) => ({ ...s, [msgId + ':' + idx]: !s[msgId + ':' + idx] }));
  }

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div className="chat-page">
      <h2>Chat</h2>
      <div className="chat-window">
        <div className="chat-messages" ref={containerRef} aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={`chat-message ${m.from}`}>
              <div className="meta">
                <span className="from">{m.from}</span>
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
                              <strong className="filename">{s?.document?.filename ?? 'Unknown document'}</strong>
                              <span className="page">Page: {s?.page_no ?? 'N/A'}</span>
                              <span className="chunk">Chunk: {s?.chunk_id ?? 'N/A'}</span>
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
