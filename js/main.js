// ===========================
// DARK / LIGHT MODE TOGGLE
// ===========================
function toggleTheme() {
  const html = document.documentElement;
  const icon = document.querySelector('.theme-icon');
  const current = html.getAttribute('data-theme');

  if (current === 'dark') {
    html.setAttribute('data-theme', 'light');
    icon.textContent = '🌙';
    localStorage.setItem('theme', 'light');
  } else {
    html.setAttribute('data-theme', 'dark');
    icon.textContent = '☀️';
    localStorage.setItem('theme', 'dark');
  }
}

// Load saved theme on page load
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  const icon = document.querySelector('.theme-icon');
  if (icon) icon.textContent = saved === 'dark' ? '☀️' : '🌙';
});

// ===========================
// MOBILE HAMBURGER MENU
// ===========================
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  menu.classList.toggle('open');
}
