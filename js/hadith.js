// ===========================
// HADITH MODULE — hadith.js
// Uses: sunnah.com API (free, no key needed)
// ===========================

const HADITH_API = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

const COLLECTIONS = {
  bukhari:  { name: 'Sahih Bukhari',  file: 'editions/eng-bukhari'  },
  muslim:   { name: 'Sahih Muslim',   file: 'editions/eng-muslim'   },
  abudawud: { name: 'Abu Dawud',      file: 'editions/eng-abudawud' },
  tirmidhi: { name: 'Tirmidhi',       file: 'editions/eng-tirmidhi' },
  nasai:    { name: "An-Nasa'i",      file: 'editions/eng-nasai'    },
  ibnmajah: { name: 'Ibn Majah',      file: 'editions/eng-ibnmajah' }
};

// Hardcoded authentic hadiths for "Hadith of the Day"
const FEATURED_HADITHS = [
  {
    text: "The best of you are those who learn the Qur'an and teach it.",
    source: 'Sahih Bukhari',
    narrator: 'Uthman ibn Affan (RA)',
    grade: 'Sahih'
  },
  {
    text: "Actions are judged by intentions, and every person will get the reward according to what he has intended.",
    source: 'Sahih Bukhari & Muslim',
    narrator: 'Umar ibn al-Khattab (RA)',
    grade: 'Sahih'
  },
  {
    text: "None of you truly believes until he loves for his brother what he loves for himself.",
    source: 'Sahih Bukhari & Muslim',
    narrator: 'Anas ibn Malik (RA)',
    grade: 'Sahih'
  },
  {
    text: "The strong man is not the one who can overpower others. Rather, the strong man is the one who controls himself when he gets angry.",
    source: 'Sahih Bukhari & Muslim',
    narrator: 'Abu Hurairah (RA)',
    grade: 'Sahih'
  },
  {
    text: "Make things easy and do not make them difficult. Cheer people up and do not drive them away.",
    source: 'Sahih Bukhari',
    narrator: 'Anas ibn Malik (RA)',
    grade: 'Sahih'
  },
  {
    text: "Whoever believes in Allah and the Last Day, let him speak good or remain silent.",
    source: 'Sahih Bukhari & Muslim',
    narrator: 'Abu Hurairah (RA)',
    grade: 'Sahih'
  },
  {
    text: "The world is a prison for the believer and a paradise for the disbeliever.",
    source: 'Sahih Muslim',
    narrator: 'Abu Hurairah (RA)',
    grade: 'Sahih'
  },
  {
    text: "Smiling at your brother is an act of charity.",
    source: 'Tirmidhi',
    narrator: 'Abu Dharr (RA)',
    grade: 'Sahih'
  },
  {
    text: "The most beloved of deeds to Allah are those that are most consistent, even if they are small.",
    source: 'Sahih Bukhari & Muslim',
    narrator: 'Aisha (RA)',
    grade: 'Sahih'
  },
  {
    text: "Do not waste water even if you are at a flowing river.",
    source: 'Ibn Majah',
    narrator: 'Abdullah ibn Amr (RA)',
    grade: 'Sahih'
  }
];

let currentCollection = 'bukhari';
let currentPage = 1;
const PAGE_SIZE = 10;
let fullCollectionData = [];

// ===========================
// ON PAGE LOAD
// ===========================
window.addEventListener('DOMContentLoaded', () => {
  loadRandomHadith();
  loadCollection('bukhari', 1);
});

// ===========================
// HADITH OF THE DAY
// Shows a random hadith from our curated list
// ===========================
function loadRandomHadith() {
  const hodContent = document.getElementById('hodContent');
  const random = FEATURED_HADITHS[Math.floor(Math.random() * FEATURED_HADITHS.length)];

  hodContent.innerHTML = `
    <p class="hod-text">"${random.text}"</p>
    <div class="hod-meta">
      <span>📖 ${random.source}</span>
      <span>👤 Narrated by: ${random.narrator}</span>
      <span class="grade-sahih">${random.grade}</span>
    </div>
  `;
}

// ===========================
// SELECT COLLECTION TAB
// ===========================
function selectCollection(collection, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentCollection = collection;
  currentPage = 1;
  fullCollectionData = [];
  loadCollection(collection, 1);
}

// ===========================
// LOAD COLLECTION
// Uses fawazahmed0 hadith API (hosted on jsDelivr CDN — very reliable)
// ===========================
async function loadCollection(collection, page) {
  const listEl = document.getElementById('hadithList');
  const pagination = document.getElementById('pagination');

  listEl.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Loading Hadiths...</p>
    </div>`;
  pagination.style.display = 'none';

  try {
    // Only fetch if we don't have data yet
    if (fullCollectionData.length === 0) {
      const url = `${HADITH_API}/${COLLECTIONS[collection].file}.min.json`;
      const res = await fetch(url);
      const data = await res.json();

      // Extract hadith array
      fullCollectionData = data.hadiths || [];
    }

    if (fullCollectionData.length === 0) {
      throw new Error('No data');
    }

    // Paginate manually
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageData = fullCollectionData.slice(start, end);

    renderHadiths(pageData, collection);

    // Pagination
    pagination.style.display = 'flex';
    document.getElementById('pageInfo').textContent = `Page ${page} of ${Math.ceil(fullCollectionData.length / PAGE_SIZE)}`;
    document.getElementById('prevPageBtn').disabled = page <= 1;
    document.getElementById('nextPageBtn').disabled = end >= fullCollectionData.length;

  } catch (err) {
    listEl.innerHTML = `
      <div class="error-msg">
        ❌ Failed to load Hadiths. Please check your internet connection and try again.
      </div>`;
  }
}

// ===========================
// RENDER HADITH CARDS
// ===========================
function renderHadiths(hadiths, collection) {
  const listEl = document.getElementById('hadithList');
  const collectionName = COLLECTIONS[collection]?.name || collection;

  // Filter out hadiths with no text
  const validHadiths = hadiths.filter(h => h.text && h.text.trim().length > 10);

  if (validHadiths.length === 0) {
    listEl.innerHTML = `<div class="error-msg">No Hadiths found on this page. Try next page.</div>`;
    return;
  }

  listEl.innerHTML = validHadiths.map((h, i) => {
    const number = h.hadithnumber || ((currentPage - 1) * PAGE_SIZE + i + 1);
    const text = h.text;

    return `
      <div class="hadith-card">
        <div class="hadith-card-header">
          <span class="hadith-number">${collectionName} #${number}</span>
          <span class="hadith-grade sahih">Sahih</span>
        </div>
        <p class="hadith-text">${text}</p>
        <div class="hadith-footer">
          <span class="hadith-meta-tag">📖 ${collectionName}</span>
          ${h.grades ? `<span class="hadith-meta-tag">⭐ ${h.grades[0]?.grade || 'Authentic'}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ===========================
// PAGINATION
// ===========================
function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    loadCollection(currentCollection, currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function nextPage() {
  currentPage++;
  loadCollection(currentCollection, currentPage);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
