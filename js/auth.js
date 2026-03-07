// ===========================
// AUTH + BOOKMARK — auth.js
// Handles login, register, logout, bookmarks
// Supports Surah + Verse bookmarks
// ===========================

let currentUser = null;
let userBookmarks = []; // stores objects {surah_number, verse_number}

// ===========================
// INIT ON PAGE LOAD
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  injectAuthModal();
  injectNavAuthButtons();
  checkSession();
});

// ===========================
// CHECK IF USER IS LOGGED IN
// ===========================
async function checkSession() {
  try {
    const res = await fetch('/MyMuslimCompanion/php/session_check.php');
    const data = await res.json();

    if (data.loggedIn) {
      currentUser = data.username;
      updateNavForLoggedIn(data.username);
      loadBookmarks();
    } else {
      updateNavForLoggedOut();
    }
  } catch (err) {
    updateNavForLoggedOut();
  }
}

// ===========================
// INJECT NAV AUTH BUTTONS
// ===========================
function injectNavAuthButtons() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const authDiv = document.createElement('div');
  authDiv.className = 'nav-auth';
  authDiv.id = 'navAuth';
  authDiv.innerHTML = `
    <button class="btn-login" onclick="openAuthModal('login')">Login</button>
    <button class="btn-register" onclick="openAuthModal('register')">Register</button>
  `;

  const themeBtn = navbar.querySelector('.theme-toggle');
  if (themeBtn) {
    navbar.insertBefore(authDiv, themeBtn);
  } else {
    navbar.appendChild(authDiv);
  }
}

// ===========================
// UPDATE NAVBAR
// ===========================
function updateNavForLoggedIn(username) {
  const navAuth = document.getElementById('navAuth');
  if (navAuth) {
    navAuth.innerHTML = `
      <div class="nav-user-info">👤 ${username}</div>
      <button class="btn-logout" onclick="logoutUser()">Logout</button>
    `;
  }
}

function updateNavForLoggedOut() {
  const navAuth = document.getElementById('navAuth');
  if (navAuth) {
    navAuth.innerHTML = `
      <button class="btn-login" onclick="openAuthModal('login')">Login</button>
      <button class="btn-register" onclick="openAuthModal('register')">Register</button>
    `;
  }
}

// ===========================
// INJECT AUTH MODAL
// ===========================
function injectAuthModal() {
  const modalHTML = `
    <div class="auth-overlay" id="authOverlay" onclick="closeAuthOnOverlay(event)">
      <div class="auth-modal">
        <div class="auth-modal-header">
          <h3 id="authModalTitle">☽ Welcome Back</h3>
          <button class="auth-close-btn" onclick="closeAuthModal()">✕</button>
        </div>
        <div class="auth-tabs">
          <button class="auth-tab active" id="loginTab" onclick="switchTab('login')">Login</button>
          <button class="auth-tab" id="registerTab" onclick="switchTab('register')">Register</button>
        </div>
        <div class="auth-error" id="authError"></div>
        <div class="auth-success" id="authSuccessMsg"></div>
        <div id="loginForm">
          <div class="auth-form">
            <div class="auth-field">
              <label>Username</label>
              <input type="text" id="loginUsername" placeholder="Enter your username" />
            </div>
            <div class="auth-field">
              <label>Password</label>
              <input type="password" id="loginPassword" placeholder="Enter your password"
                onkeydown="if(event.key==='Enter') submitLogin()" />
            </div>
            <button class="auth-submit-btn" id="loginBtn" onclick="submitLogin()">Login</button>
          </div>
        </div>
        <div id="registerForm" style="display:none;">
          <div class="auth-form">
            <div class="auth-field">
              <label>Username</label>
              <input type="text" id="regUsername" placeholder="Choose a username" />
            </div>
            <div class="auth-field">
              <label>Password</label>
              <input type="password" id="regPassword" placeholder="Create a password (min 6 characters)" />
            </div>
            <div class="auth-field">
              <label>Confirm Password</label>
              <input type="password" id="regConfirm" placeholder="Repeat your password"
                onkeydown="if(event.key==='Enter') submitRegister()" />
            </div>
            <button class="auth-submit-btn" id="registerBtn" onclick="submitRegister()">Create Account</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ===========================
// OPEN / CLOSE MODAL
// ===========================
function openAuthModal(tab = 'login') {
  document.getElementById('authOverlay').classList.add('open');
  switchTab(tab);
  clearAuthMessages();
}

function closeAuthModal() {
  document.getElementById('authOverlay').classList.remove('open');
  clearAuthMessages();
}

function closeAuthOnOverlay(e) {
  if (e.target.id === 'authOverlay') closeAuthModal();
}

function switchTab(tab) {
  document.getElementById('loginForm').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('loginTab').classList.toggle('active', tab === 'login');
  document.getElementById('registerTab').classList.toggle('active', tab === 'register');
  document.getElementById('authModalTitle').textContent =
    tab === 'login' ? '☽ Welcome Back' : '☽ Create Account';
  clearAuthMessages();
}

// ===========================
// LOGIN
// ===========================
async function submitLogin() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  const btn = document.getElementById('loginBtn');

  clearAuthMessages();

  if (!username || !password) {
    showAuthError('Please enter your username and password.');
    return;
  }

  btn.disabled = true;
  btn.textContent = '⏳ Logging in...';

  try {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const res  = await fetch('/MyMuslimCompanion/php/login.php', { method: 'POST', body: formData });
    const data = await res.json();

    if (data.success) {
      currentUser = data.username;
      showAuthSuccess('Login successful! Welcome back, ' + data.username + '!');
      updateNavForLoggedIn(data.username);
      loadBookmarks();
      setTimeout(closeAuthModal, 1500);
    } else {
      showAuthError(data.message);
    }
  } catch (err) {
    showAuthError('Connection failed. Please try again.');
  }

  btn.disabled = false;
  btn.textContent = 'Login';
}

// ===========================
// REGISTER
// ===========================
async function submitRegister() {
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const confirm  = document.getElementById('regConfirm').value.trim();
  const btn = document.getElementById('registerBtn');

  clearAuthMessages();

  if (!username || !password || !confirm) {
    showAuthError('Please fill in all fields.');
    return;
  }

  btn.disabled = true;
  btn.textContent = '⏳ Creating account...';

  try {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('confirm',  confirm);

    const res  = await fetch('/MyMuslimCompanion/php/register.php', { method: 'POST', body: formData });
    const data = await res.json();

    if (data.success) {
      currentUser = data.username;
      showAuthSuccess('Account created! Welcome, ' + data.username + '!');
      updateNavForLoggedIn(data.username);
      loadBookmarks();
      setTimeout(closeAuthModal, 1500);
    } else {
      showAuthError(data.message);
    }
  } catch (err) {
    showAuthError('Connection failed. Please try again.');
  }

  btn.disabled = false;
  btn.textContent = 'Create Account';
}

// ===========================
// LOGOUT
// ===========================
async function logoutUser() {
  try {
    await fetch('/MyMuslimCompanion/php/logout.php');
  } catch (err) {}

  currentUser = null;
  userBookmarks = [];
  updateNavForLoggedOut();
  refreshBookmarkUI();
}

// ===========================
// BOOKMARKS — LOAD
// ===========================
async function loadBookmarks() {
  try {
    const formData = new FormData();
    formData.append('action', 'get');

    const res  = await fetch('/MyMuslimCompanion/php/bookmark.php', { method: 'POST', body: formData });
    const data = await res.json();

    if (data.success) {
      userBookmarks = data.bookmarks.map(b => ({
        surah_number: parseInt(b.surah_number),
        verse_number: b.verse_number ? parseInt(b.verse_number) : null
      }));
      refreshBookmarkUI();
    }
  } catch (err) {}
}

// ===========================
// TOGGLE BOOKMARK
// Works for both Surah and Verse
// ===========================
async function toggleBookmark(surahNumber, surahName, verseNumber = null, verseText = null) {
  if (!currentUser) {
    openAuthModal('login');
    return;
  }

  const alreadyBookmarked = isBookmarked(surahNumber, verseNumber);
  const action = alreadyBookmarked ? 'remove' : 'save';

  try {
    const formData = new FormData();
    formData.append('action', action);
    formData.append('surah_number', surahNumber);
    formData.append('surah_name', surahName);
    if (verseNumber) {
      formData.append('verse_number', verseNumber);
      if (verseText) formData.append('verse_text', verseText.substring(0, 500));
    }

    const res  = await fetch('/MyMuslimCompanion/php/bookmark.php', { method: 'POST', body: formData });
    const data = await res.json();

    if (data.success) {
      if (action === 'save') {
        userBookmarks.push({ surah_number: surahNumber, verse_number: verseNumber });
      } else {
        userBookmarks = userBookmarks.filter(b =>
          !(b.surah_number === surahNumber && b.verse_number === verseNumber)
        );
      }
      refreshBookmarkUI();
    }
  } catch (err) {}
}

// ===========================
// CHECK IF BOOKMARKED
// ===========================
function isBookmarked(surahNumber, verseNumber = null) {
  return userBookmarks.some(b =>
    b.surah_number === surahNumber &&
    (verseNumber ? b.verse_number === verseNumber : b.verse_number === null)
  );
}

// ===========================
// REFRESH ALL BOOKMARK BUTTONS
// ===========================
function refreshBookmarkUI() {
  // Surah bookmark buttons
  document.querySelectorAll('.bookmark-btn[data-surah-number]').forEach(btn => {
    const surahNum = parseInt(btn.dataset.surahNumber);
    const verseNum = btn.dataset.verseNumber ? parseInt(btn.dataset.verseNumber) : null;
    if (isBookmarked(surahNum, verseNum)) {
      btn.textContent = verseNum ? '⭐ Saved' : '⭐ Bookmarked';
      btn.classList.add('bookmarked');
    } else {
      btn.textContent = verseNum ? '☆ Save Verse' : '☆ Bookmark';
      btn.classList.remove('bookmarked');
    }
  });
}

// ===========================
// HELPERS
// ===========================
function showAuthError(msg) {
  const el = document.getElementById('authError');
  el.textContent = '❌ ' + msg;
  el.style.display = 'block';
}

function showAuthSuccess(msg) {
  const el = document.getElementById('authSuccessMsg');
  el.textContent = '✅ ' + msg;
  el.style.display = 'block';
}

function clearAuthMessages() {
  document.getElementById('authError').style.display = 'none';
  document.getElementById('authSuccessMsg').style.display = 'none';
}
