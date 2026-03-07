// ===========================
// AI CHATBOT — chatbot.js
// Uses: Groq API (free, fast)
// ===========================

// Paste your Groq API key below
const GROQ_API_KEY = 'Place api key';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// System prompt — keeps AI focused on Islamic topics only
const SYSTEM_PROMPT = `You are an Islamic AI assistant called "MyMuslimCompanion AI". 
You only answer questions related to Islam, including:
- Quran and its interpretation
- Hadith and Sunnah
- Islamic history and prophets
- Prayer, Zakat, Fasting, Hajj
- Islamic ethics and daily life
- Halal and Haram matters
- Islamic scholars and their teachings

If a question is not related to Islam, politely say:
"I can only answer Islamic questions. Please ask me something related to Islam."

Always be respectful, accurate, and cite Islamic sources when possible.
Keep responses clear and easy to understand.`;

// ===========================
// SEND MESSAGE
// ===========================
async function sendMessage() {
  const input = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const message = input.value.trim();

  if (!message) return;

  // Clear input
  input.value = '';

  // Remove welcome message if first chat
  const welcome = document.querySelector('.chat-welcome');
  if (welcome) welcome.remove();

  // Add user message bubble
  addMessage('user', message);

  // Disable input while waiting
  input.disabled = true;
  sendBtn.disabled = true;

  // Show typing indicator
  const typingEl = showTyping();

  try {
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ],
        max_tokens: 1024
      })
    });

    const data = await res.json();

    // Remove typing indicator
    typingEl.remove();

    if (data.choices && data.choices[0]) {
      const reply = data.choices[0].message.content;
      addMessage('bot', reply);
    } else if (data.error) {
      addMessage('bot', '❌ Error: ' + data.error.message);
    } else {
      addMessage('bot', '❌ No response received. Please try again.');
    }

  } catch (err) {
    typingEl.remove();
    addMessage('bot', '❌ Failed to connect. Please check your internet connection and try again.');
  }

  // Re-enable input
  input.disabled = false;
  sendBtn.disabled = false;
  input.focus();
}

// ===========================
// SUGGESTED QUESTION
// ===========================
function askSuggested(btn) {
  document.getElementById('userInput').value = btn.textContent;
  sendMessage();
}

// ===========================
// ADD MESSAGE BUBBLE
// ===========================
function addMessage(type, text) {
  const chatWindow = document.getElementById('chatWindow');

  const msgEl = document.createElement('div');
  msgEl.className = `message ${type}`;

  const label = type === 'user' ? 'You' : '🤖 AI Assistant';

  msgEl.innerHTML = `
    <div class="message-label">${label}</div>
    <div class="message-bubble">${formatText(text)}</div>
  `;

  chatWindow.appendChild(msgEl);

  // Auto scroll to bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// ===========================
// TYPING INDICATOR
// ===========================
function showTyping() {
  const chatWindow = document.getElementById('chatWindow');

  const typingEl = document.createElement('div');
  typingEl.className = 'message bot';
  typingEl.innerHTML = `
    <div class="message-label">🤖 AI Assistant</div>
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;

  chatWindow.appendChild(typingEl);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  return typingEl;
}

// ===========================
// FORMAT TEXT
// Converts **bold** and newlines to HTML
// ===========================
function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}
