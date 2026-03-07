// ===========================
// FEEDBACK MODAL — feedback.js
// ===========================

// ===========================
// INJECT MODAL + BUTTON INTO PAGE
// ===========================
document.addEventListener('DOMContentLoaded', () => {

  // Inject floating button
  const floatBtn = document.createElement('button');
  floatBtn.className = 'feedback-float-btn';
  floatBtn.innerHTML = `💬 <span class="btn-text">Feedback</span>`;
  floatBtn.onclick = openFeedbackModal;
  document.body.appendChild(floatBtn);

  // Inject modal HTML
  const modalHTML = `
    <div class="feedback-overlay" id="feedbackOverlay" onclick="closeFeedbackOnOverlay(event)">
      <div class="feedback-modal">

        <!-- Header -->
        <div class="feedback-modal-header">
          <h3>💬 Send Feedback</h3>
          <button class="feedback-close-btn" onclick="closeFeedbackModal()">✕</button>
        </div>

        <!-- Error message -->
        <div class="feedback-error" id="feedbackError"></div>

        <!-- Form -->
        <div id="feedbackFormWrapper">
          <div class="feedback-form">
            <div class="feedback-field">
              <label>Your Name</label>
              <input type="text" id="fbName" placeholder="e.g. Ahmad" maxlength="100" />
            </div>
            <div class="feedback-field">
              <label>Email Address</label>
              <input type="email" id="fbEmail" placeholder="e.g. ahmad@email.com" />
            </div>
            <div class="feedback-field">
              <label>Message</label>
              <textarea id="fbMessage" placeholder="Share your thoughts, suggestions or report an issue..." maxlength="1000" oninput="updateCharCount()"></textarea>
              <span class="char-counter"><span id="charCount">0</span>/1000</span>
            </div>
            <button class="feedback-submit-btn" id="fbSubmitBtn" onclick="submitFeedback()">
              Send Feedback ✉️
            </button>
          </div>
        </div>

        <!-- Success message (hidden by default) -->
        <div class="feedback-success" id="feedbackSuccess">
          <div class="success-icon">✅</div>
          <h4>JazakAllahu Khayran!</h4>
          <p>Your feedback has been received. We appreciate your time!</p>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHTML);
});

// ===========================
// OPEN / CLOSE MODAL
// ===========================
function openFeedbackModal() {
  document.getElementById('feedbackOverlay').classList.add('open');
  document.getElementById('fbName').focus();
}

function closeFeedbackModal() {
  document.getElementById('feedbackOverlay').classList.remove('open');
  // Reset form after closing
  setTimeout(resetFeedbackForm, 300);
}

function closeFeedbackOnOverlay(e) {
  if (e.target.id === 'feedbackOverlay') closeFeedbackModal();
}

// ===========================
// CHARACTER COUNTER
// ===========================
function updateCharCount() {
  const len = document.getElementById('fbMessage').value.length;
  document.getElementById('charCount').textContent = len;
}

// ===========================
// SUBMIT FEEDBACK
// ===========================
async function submitFeedback() {
  const name    = document.getElementById('fbName').value.trim();
  const email   = document.getElementById('fbEmail').value.trim();
  const message = document.getElementById('fbMessage').value.trim();
  const errorEl = document.getElementById('feedbackError');
  const submitBtn = document.getElementById('fbSubmitBtn');

  // Hide previous errors
  errorEl.style.display = 'none';

  // Client-side validation
  if (!name || !email || !message) {
    showFeedbackError('Please fill in all fields.');
    return;
  }

  if (!isValidEmail(email)) {
    showFeedbackError('Please enter a valid email address.');
    return;
  }

  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Sending...';

  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('message', message);

    const res = await fetch('/MyMuslimCompanion/php/feedback.php', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      // Show success
      document.getElementById('feedbackFormWrapper').style.display = 'none';
      document.getElementById('feedbackSuccess').style.display = 'block';

      // Auto close after 3 seconds
      setTimeout(closeFeedbackModal, 3000);
    } else {
      showFeedbackError(data.message || 'Something went wrong. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Feedback ✉️';
    }

  } catch (err) {
    showFeedbackError('Failed to send feedback. Please check your connection.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Feedback ✉️';
  }
}

// ===========================
// HELPERS
// ===========================
function showFeedbackError(msg) {
  const errorEl = document.getElementById('feedbackError');
  errorEl.textContent = '❌ ' + msg;
  errorEl.style.display = 'block';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function resetFeedbackForm() {
  document.getElementById('fbName').value = '';
  document.getElementById('fbEmail').value = '';
  document.getElementById('fbMessage').value = '';
  document.getElementById('charCount').textContent = '0';
  document.getElementById('feedbackError').style.display = 'none';
  document.getElementById('feedbackFormWrapper').style.display = 'block';
  document.getElementById('feedbackSuccess').style.display = 'none';
  const btn = document.getElementById('fbSubmitBtn');
  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Send Feedback ✉️';
  }
}
