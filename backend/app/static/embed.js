(function () {
  const config = window.KnowbaseChat;
  if (!config || !config.token) {
    console.error("Knowbase widget: missing token");
    return;
  }

  const sessionKey = "kb_session_id";
  let sessionId = localStorage.getItem(sessionKey);

  /* ---------- UI ---------- */
  const container = document.createElement("div");
  container.id = "kb-widget";
  document.body.appendChild(container);

  container.innerHTML = `
    <style>
      #kb-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 380px;
        height: 600px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,.15);
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        z-index: 999999;
        overflow: hidden;
      }

      #kb-header {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: white;
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
      }

      #kb-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
      }

      #kb-new-chat {
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        transition: all 0.2s ease;
      }

      #kb-new-chat:hover {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
      }

      #kb-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px 12px;
        background: linear-gradient(135deg, #f5f7fb 0%, #ffffff 100%);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      #kb-messages::-webkit-scrollbar {
        width: 6px;
      }

      #kb-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      #kb-messages::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }

      #kb-messages::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }

      .kb-message {
        display: flex;
        flex-direction: column;
        max-width: 85%;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .kb-message.user {
        align-self: flex-end;
        text-align: right;
      }

      .kb-message.bot {
        align-self: flex-start;
      }

      .kb-bubble {
        background: white;
        border: 1px solid #e6e9ef;
        padding: 12px 14px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
        font-size: 13px;
        line-height: 1.5;
        word-wrap: break-word;
        white-space: pre-wrap;
        color: #0f172a;
      }

      .kb-message.user .kb-bubble {
        background: linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(37, 99, 235, 0.06) 100%);
        border-color: rgba(37, 99, 235, 0.25);
        color: #0f172a;
      }

      .kb-loading {
        padding: 8px 12px;
        font-size: 12px;
        color: #6b7280;
        font-style: italic;
        align-self: center;
      }

      #kb-input-area {
        display: flex;
        gap: 8px;
        padding: 12px;
        border-top: 1px solid #e6e9ef;
        background: white;
      }

      #kb-input {
        flex: 1;
        border: 1px solid #e6e9ef;
        padding: 10px 12px;
        border-radius: 8px;
        outline: none;
        font-size: 13px;
        font-family: inherit;
        resize: none;
        max-height: 60px;
        transition: all 0.2s ease;
      }

      #kb-input:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }

      #kb-input::placeholder {
        color: #9ca3af;
      }

      #kb-send {
        padding: 10px 14px;
        background: #2563eb;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 12px;
        transition: all 0.2s ease;
        white-space: nowrap;
      }

      #kb-send:hover:not(:disabled) {
        background: #1d4ed8;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
      }

      #kb-send:disabled {
        background: #cbd5e1;
        cursor: not-allowed;
      }
    </style>

    <div id="kb-header">
      <h3>Knowbase</h3>
      <button id="kb-new-chat">New</button>
    </div>
    <div id="kb-messages"></div>
    <div id="kb-input-area">
      <textarea id="kb-input" placeholder="Ask something..." rows="1"></textarea>
      <button id="kb-send">Send</button>
    </div>
  `;

  const messagesEl = container.querySelector("#kb-messages");
  const inputEl = container.querySelector("#kb-input");
  const sendBtn = container.querySelector("#kb-send");
  const newChatBtn = container.querySelector("#kb-new-chat");

  // Auto-resize textarea
  inputEl.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 60) + "px";
  });

  function addMessage(role, text) {
    const div = document.createElement("div");
    div.className = `kb-message ${role}`;
    
    const bubble = document.createElement("div");
    bubble.className = "kb-bubble";
    bubble.textContent = text;
    
    div.appendChild(bubble);
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return bubble;
  }

  function showLoading() {
    const div = document.createElement("div");
    div.className = "kb-loading";
    div.textContent = "Thinking...";
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  async function sendMessage(text) {
    addMessage("user", text);
    inputEl.value = "";
    inputEl.style.height = "auto";
    sendBtn.disabled = true;
    inputEl.disabled = true;

    const loadingDiv = showLoading();
    const aiDiv = addMessage("bot", "");
    loadingDiv.remove();

    try {
      const res = await fetch(
        "http://localhost:3002/documents/widget/query",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: config.token,
            query: text,
            session_id: sessionId
          })
        }
      );

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const events = chunk.split("\n").filter(Boolean);

        for (const e of events) {
          try {
            const event = JSON.parse(e);

            if (event.type === "start" && event.session_id) {
              sessionId = event.session_id;
              localStorage.setItem(sessionKey, sessionId);
            }

            if (event.type === "token") {
              buffer += event.data;
              aiDiv.textContent = buffer;
              messagesEl.scrollTop = messagesEl.scrollHeight;
            }
          } catch (err) {
            // Skip invalid JSON
          }
        }
      }
    } catch (err) {
      aiDiv.textContent = "Error: " + (err.message || "Request failed");
    } finally {
      sendBtn.disabled = false;
      inputEl.disabled = false;
      inputEl.focus();
    }
  }

  function newChat() {
    localStorage.removeItem(sessionKey);
    sessionId = null;
    messagesEl.innerHTML = "";
    addMessage("bot", "Hi! How can I help you today?");
    inputEl.value = "";
    inputEl.style.height = "auto";
    inputEl.focus();
  }

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && inputEl.value.trim()) {
      e.preventDefault();
      sendMessage(inputEl.value.trim());
    }
  });

  sendBtn.addEventListener("click", () => {
    if (inputEl.value.trim()) {
      sendMessage(inputEl.value.trim());
    }
  });

  newChatBtn.addEventListener("click", newChat);

  // Initialize with greeting
  addMessage("bot", "Hi! How can I help you today?");
})();
