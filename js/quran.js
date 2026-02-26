// ===========================
// QURAN MODULE — quran.js
// Uses: https://alquran.cloud/api
// ===========================

const API_BASE = 'https://api.alquran.cloud/v1';
let allSurahs = [];
let currentSurahNumber = 1;

// ===========================
// LOAD ALL SURAHS ON PAGE LOAD
// ===========================
window.addEventListener('DOMContentLoaded', () => {
  loadSurahList();
});

async function loadSurahList() {
  try {
    const res = await fetch(`${API_BASE}/surah`);
    const data = await res.json();
    allSurahs = data.data;
    renderSurahGrid(allSurahs);
  } catch (err) {
    document.getElementById('surahGrid').innerHTML = `
      <div class="no-results">
        ❌ Failed to load Surahs. Please check your internet connection and refresh.
      </div>`;
  }
}

// ===========================
// RENDER SURAH GRID
// ===========================
function renderSurahGrid(surahs) {
  const grid = document.getElementById('surahGrid');

  if (surahs.length === 0) {
    grid.innerHTML = `<div class="no-results">No Surah found. Try a different search.</div>`;
    return;
  }

  grid.innerHTML = surahs.map(s => `
    <div class="surah-card" onclick="openSurah(${s.number})">
      <div class="surah-number">${s.number}</div>
      <div class="surah-info">
        <div class="surah-name-en">${s.englishName}</div>
        <div class="surah-name-ar">${s.name}</div>
        <div class="surah-meta">${s.englishNameTranslation} · ${s.numberOfAyahs} verses · ${s.revelationType}</div>
      </div>
    </div>
  `).join('');
}

// ===========================
// SEARCH / FILTER SURAHS
// ===========================
function filterSurahs() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allSurahs.filter(s =>
    s.englishName.toLowerCase().includes(query) ||
    s.englishNameTranslation.toLowerCase().includes(query) ||
    s.number.toString().includes(query)
  );
  renderSurahGrid(filtered);
}

// ===========================
// OPEN A SURAH (load verses)
// ===========================
async function openSurah(surahNumber) {
  currentSurahNumber = surahNumber;

  // Switch views
  document.getElementById('surahListView').style.display = 'none';
  document.getElementById('surahReaderView').style.display = 'block';

  // Show loading
  document.getElementById('versesContainer').innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Loading verses...</p>
    </div>`;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  try {
    // Fetch Arabic + English in parallel
    const [arabicRes, englishRes] = await Promise.all([
      fetch(`${API_BASE}/surah/${surahNumber}`),
      fetch(`${API_BASE}/surah/${surahNumber}/en.sahih`)
    ]);

    const arabicData = await arabicRes.json();
    const englishData = await englishRes.json();

    const surah = arabicData.data;
    const englishAyahs = englishData.data.ayahs;

    // Update reader header
    document.getElementById('readerSurahName').textContent =
      `${surah.number}. ${surah.englishName} — ${surah.name}`;
    document.getElementById('readerSurahInfo').textContent =
      `${surah.englishNameTranslation} · ${surah.numberOfAyahs} verses · ${surah.revelationType}`;

    // Hide Bismillah for Surah At-Tawbah (no. 9)
    document.getElementById('bismillahDisplay').style.display =
      surahNumber === 9 ? 'none' : 'block';

    // Update prev/next buttons
    document.getElementById('prevBtn').disabled = surahNumber <= 1;
    document.getElementById('nextBtn').disabled = surahNumber >= 114;

    // Render verses
    document.getElementById('versesContainer').innerHTML = surah.ayahs.map((ayah, i) => `
      <div class="verse-card">
        <span class="verse-number-badge">Verse ${ayah.numberInSurah}</span>
        <div class="verse-arabic">${ayah.text}</div>
        <div class="verse-english">${englishAyahs[i]?.text || ''}</div>
      </div>
    `).join('');

  } catch (err) {
    document.getElementById('versesContainer').innerHTML = `
      <div class="no-results">❌ Failed to load verses. Please check your connection.</div>`;
  }
}

// ===========================
// NAVIGATION BETWEEN SURAHS
// ===========================
function prevSurah() {
  if (currentSurahNumber > 1) openSurah(currentSurahNumber - 1);
}

function nextSurah() {
  if (currentSurahNumber < 114) openSurah(currentSurahNumber + 1);
}

// ===========================
// BACK TO SURAH LIST
// ===========================
function showSurahList() {
  document.getElementById('surahReaderView').style.display = 'none';
  document.getElementById('surahListView').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
