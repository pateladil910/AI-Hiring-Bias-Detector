// Interactive EquiHire AI Chatbot Assistant Widget — Circular FAB & Pop-up Drawer
document.addEventListener('DOMContentLoaded', () => {
  renderChatbotWidget();
});

function renderChatbotWidget() {
  if (document.getElementById('chatbot-widget-wrap')) return;

  const wrap = document.createElement('div');
  wrap.id = 'chatbot-widget-wrap';
  wrap.innerHTML = `
    <!-- Floating Circular Pop-up FAB Button -->
    <div class="chatbot-fab-container">
      <div class="chatbot-tooltip-pop" id="chatbot-tooltip">
        💬 AI Assistant Online — Ask anything!
      </div>

      <button id="chatbot-fab" class="chatbot-circle-fab" onclick="toggleChatbotWindow()" aria-label="Open AI Assistant">
        <div class="fab-avatar-circle">EQ</div>
        <span class="online-indicator-dot" title="AI Assistant Online"></span>
      </button>
    </div>

    <!-- Chatbot Window Drawer -->
    <div id="chatbot-window" class="chatbot-window" style="display:none;">
      <div class="chatbot-header">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:34px;height:34px;border-radius:10px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;box-shadow:0 4px 10px rgba(17,100,70,0.3);">EQ</div>
          <div>
            <strong style="color:var(--text);font-size:14px;display:block;line-height:1.2;">EquiHire AI Assistant</strong>
            <span style="font-size:11px;color:var(--primary);font-weight:600;">● Online · EEOC Neutrality Engine</span>
          </div>
        </div>
        <button onclick="toggleChatbotWindow()" style="background:none;border:none;font-size:18px;color:var(--text-muted);cursor:pointer;padding:4px;" title="Close Chat">✕</button>
      </div>

      <div class="chatbot-messages" id="chat-messages-list">
        <div class="chat-msg assistant">
          <div class="chat-bubble">
            👋 Hello! I am your <strong>EquiHire AI Assistant</strong>. How can I help you explore our demographic-blind talent screening platform today?
          </div>
          <div class="chat-suggestions">
            <button class="chat-pill" onclick="sendQuickChat('How does resume anonymization work?')">🛡️ How does anonymization work?</button>
            <button class="chat-pill" onclick="sendQuickChat('What job domains are supported?')">🎯 What domains are supported?</button>
            <button class="chat-pill" onclick="sendQuickChat('Is EquiHire EEOC compliant?')">⚖️ Is EquiHire EEOC compliant?</button>
            <button class="chat-pill" onclick="sendQuickChat('How are candidate scores calculated?')">📊 How are scores calculated?</button>
          </div>
        </div>
      </div>

      <div class="chatbot-input-bar">
        <input type="text" id="chat-user-input" class="chatbot-input" placeholder="Ask about bias detection, domain tests..." onkeypress="handleChatKeyPress(event)"/>
        <button class="btn btn-primary" onclick="submitUserChat()" style="height:36px;padding:0 14px;font-size:13px;">Send</button>
      </div>
    </div>
  `;

  document.body.appendChild(wrap);

  // Auto-hide tooltip after 6 seconds
  setTimeout(() => {
    const tip = document.getElementById('chatbot-tooltip');
    if (tip) tip.style.opacity = '0';
  }, 6000);
}

function toggleChatbotWindow() {
  const win = document.getElementById('chatbot-window');
  if (win) {
    const isHidden = (win.style.display === 'none' || !win.style.display);
    win.style.display = isHidden ? 'flex' : 'none';
  }
}

function sendQuickChat(text) {
  const input = document.getElementById('chat-user-input');
  if (input) {
    input.value = text;
    submitUserChat();
  }
}

function handleChatKeyPress(e) {
  if (e.key === 'Enter') {
    submitUserChat();
  }
}

function submitUserChat() {
  const input = document.getElementById('chat-user-input');
  const messagesList = document.getElementById('chat-messages-list');
  if (!input || !messagesList) return;

  const text = input.value.trim();
  if (!text) return;

  // Add User Message
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-msg user';
  userMsg.innerHTML = `<div class="chat-bubble">${escapeHtml(text)}</div>`;
  messagesList.appendChild(userMsg);

  input.value = '';
  messagesList.scrollTop = messagesList.scrollHeight;

  // Typing Indicator
  const typingMsg = document.createElement('div');
  typingMsg.className = 'chat-msg assistant';
  typingMsg.id = 'typing-indicator-msg';
  typingMsg.innerHTML = `
    <div class="chat-bubble">
      <div class="typing-dots">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    </div>
  `;
  messagesList.appendChild(typingMsg);
  messagesList.scrollTop = messagesList.scrollHeight;

  // Generate Assistant Reply
  setTimeout(() => {
    const indicator = document.getElementById('typing-indicator-msg');
    if (indicator) indicator.remove();

    const replyText = getAIResponse(text);
    const replyMsg = document.createElement('div');
    replyMsg.className = 'chat-msg assistant';
    replyMsg.innerHTML = `<div class="chat-bubble">${replyText}</div>`;
    messagesList.appendChild(replyMsg);

    messagesList.scrollTop = messagesList.scrollHeight;
  }, 700);
}

function getAIResponse(query) {
  const q = query.toLowerCase();

  if (q.includes('anonymiz') || q.includes('resume') || q.includes('redact') || q.includes('cloak')) {
    return '🛡️ <strong>Demographic Anonymization Engine:</strong> When a candidate uploads a resume, our parser automatically redacts candidate Name, Gender pronouns, Age, Address, Photo, and University brand names. Only technical skill proficiencies and project depth are extracted for evaluation.';
  }
  if (q.includes('domain') || q.includes('stack') || q.includes('language')) {
    return '🎯 <strong>Supported Tech Domains:</strong> EquiHire AI supports 10+ calibrated domains including Frontend, Backend, Full Stack Engineering, Python, Java, Data Science, DevOps, Cybersecurity, UI/UX, and Cloud Architecture.';
  }
  if (q.includes('eeoc') || q.includes('compliance') || q.includes('gdpr') || q.includes('legal')) {
    return '⚖️ <strong>100% EEOC &amp; GDPR Compliant:</strong> Our system continuously audits test questions and scoring pipelines for linguistic neutrality. Every candidate evaluation produces a verifiable audit trail proving zero demographic bias leakage.';
  }
  if (q.includes('score') || q.includes('calculate') || q.includes('merit') || q.includes('rating')) {
    return '📊 <strong>Explainable Merit Matrix:</strong> Candidate scores are computed deterministically across 4 objective parameters: MCQ Accuracy (25%), Hands-On Coding AST Output (35%), Logical Aptitude (20%), and Resume Skill Vector Alignment (20%).';
  }
  if (q.includes('test') || q.includes('assessment') || q.includes('coding')) {
    return '⏱️ <strong>Timed AI Assessments:</strong> Candidates complete timed domain MCQs and an interactive monospace coding sandbox with automated test-case verification.';
  }

  return '✨ <strong>EquiHire AI Platform:</strong> I am trained on our demographic-blind screening engine, EEOC compliance rules, and skill graph vectorization. Feel free to ask about resume parsing, domain tests, or recruiter portal features!';
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
