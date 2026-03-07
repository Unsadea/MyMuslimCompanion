// ===========================
// BOOKMARKS PAGE — bookmarks.js
// ===========================

document.addEventListener('DOMContentLoaded', () => {
  // Wait for auth.js to check session first, then load bookmarks
  setTimeout(initBookmarksPage, 500);
});

async function initBookmarksPage() {
  const res = await fetch('/MyMuslimCompanion/php/session_check.php');
  const data = await res.json();

  if (!data.loggedIn) {
    showState('login');
    return;
  }

  showState('loading');
  loadBookmarksPage();
}

// ===========================
// LOAD BOOKMARKS FROM SERVER
// ===========================
async function loadBookmarksPage() {
  try {
    const formData = new FormData();
    formData.append('action', 'get');

    const res  = await fetch('/MyMuslimCompanion/php/bookmark.php', { method: 'POST', body: formData });
    const data = await res.json();

    if (!data.success) {
      showState('login');
      return;
    }

    const surahBookmarks = data.bookmarks.filter(b => !b.verse_number);
    const verseBookmarks = data.bookmarks.filter(b => b.verse_number);

    if (surahBookmarks.length === 0 && verseBookmarks.length === 0) {
      showState('empty');
      return;
    }

    showState('content');
    renderSurahBookmarks(surahBookmarks);
    renderVerseBookmarks(verseBookmarks);

  } catch (err) {
    showState('empty');
  }
}

// ===========================
// RENDER SURAH BOOKMARKS
// ===========================
function renderSurahBookmarks(bookmarks) {
  const grid    = document.getElementById('surahBookmarksGrid');
  const section = document.getElementById('surahBookmarksSection');
  const count   = document.getElementById('surahCount');

  count.textContent = bookmarks.length;

  if (bookmarks.length === 0) {
    section.style.display = 'none';
    return;
  }

  grid.innerHTML = bookmarks.map(b => `
    <div class="surah-bookmark-card" onclick="goToSurah(${b.surah_number})">
      <button class="surah-bookmark-remove" title="Remove bookmark"
        onclick="removeSurahBookmark(event, ${b.surah_number})">✕</button>
      <div class="surah-bookmark-number">Surah ${b.surah_number}</div>
      <div class="surah-bookmark-name">${b.surah_name}</div>
      <div class="surah-bookmark-arabic">${getSurahArabicName(b.surah_number)}</div>
    </div>
  `).join('');
}

// ===========================
// RENDER VERSE BOOKMARKS
// ===========================
function renderVerseBookmarks(bookmarks) {
  const list    = document.getElementById('verseBookmarksList');
  const section = document.getElementById('verseBookmarksSection');
  const count   = document.getElementById('verseCount');

  count.textContent = bookmarks.length;

  if (bookmarks.length === 0) {
    section.style.display = 'none';
    return;
  }

  list.innerHTML = bookmarks.map(b => `
    <div class="verse-bookmark-card">
      <div class="verse-bookmark-meta">
        ${b.surah_name} · Verse ${b.verse_number}
      </div>
      ${b.verse_text ? `<div class="verse-bookmark-arabic">${b.verse_text}</div>` : ''}
      <div class="verse-bookmark-actions">
        <button class="verse-bookmark-open" onclick="goToSurah(${b.surah_number}, ${b.verse_number})">
          Open Surah →
        </button>
        <button class="verse-bookmark-remove"
          onclick="removeVerseBookmark(${b.surah_number}, ${b.verse_number})">
          🗑 Remove
        </button>
      </div>
    </div>
  `).join('');
}

// ===========================
// REMOVE SURAH BOOKMARK
// ===========================
async function removeSurahBookmark(event, surahNumber) {
  event.stopPropagation(); // prevent card click

  try {
    const formData = new FormData();
    formData.append('action', 'remove');
    formData.append('surah_number', surahNumber);

    await fetch('/MyMuslimCompanion/php/bookmark.php', { method: 'POST', body: formData });
    loadBookmarksPage(); // reload page
  } catch (err) {}
}

// ===========================
// REMOVE VERSE BOOKMARK
// ===========================
async function removeVerseBookmark(surahNumber, verseNumber) {
  try {
    const formData = new FormData();
    formData.append('action', 'remove');
    formData.append('surah_number', surahNumber);
    formData.append('verse_number', verseNumber);

    await fetch('/MyMuslimCompanion/php/bookmark.php', { method: 'POST', body: formData });
    loadBookmarksPage(); // reload page
  } catch (err) {}
}

// ===========================
// GO TO SURAH IN QURAN PAGE
// ===========================
function goToSurah(surahNumber, verseNumber = null) {
  let url = `/MyMuslimCompanion/quran.html?surah=${surahNumber}`;
  if (verseNumber) url += `&verse=${verseNumber}`;
  window.location.href = url;
}

// ===========================
// SHOW/HIDE STATES
// ===========================
function showState(state) {
  document.getElementById('bookmarksLoginPrompt').style.display = state === 'login'   ? 'block' : 'none';
  document.getElementById('bookmarksLoading').style.display     = state === 'loading' ? 'block' : 'none';
  document.getElementById('bookmarksEmpty').style.display       = state === 'empty'   ? 'block' : 'none';
  document.getElementById('bookmarksContent').style.display     = state === 'content' ? 'block' : 'none';
}

// ===========================
// ARABIC SURAH NAMES LOOKUP
// ===========================
function getSurahArabicName(num) {
  const names = {
    1:'ٱلْفَاتِحَة',2:'ٱلْبَقَرَة',3:'آلْ عِمْرَان',4:'ٱلنِّسَاء',5:'ٱلْمَائِدَة',
    6:'ٱلْأَنْعَام',7:'ٱلْأَعْرَاف',8:'ٱلْأَنْفَال',9:'ٱلتَّوْبَة',10:'يُونُس',
    11:'هُود',12:'يُوسُف',13:'ٱلرَّعْد',14:'إِبْرَاهِيم',15:'ٱلْحِجْر',
    16:'ٱلنَّحْل',17:'ٱلْإِسْرَاء',18:'ٱلْكَهْف',19:'مَرْيَم',20:'طه',
    21:'ٱلْأَنْبِيَاء',22:'ٱلْحَجّ',23:'ٱلْمُؤْمِنُون',24:'ٱلنُّور',25:'ٱلْفُرْقَان',
    26:'ٱلشُّعَرَاء',27:'ٱلنَّمْل',28:'ٱلْقَصَص',29:'ٱلْعَنْكَبُوت',30:'ٱلرُّوم',
    31:'لُقْمَان',32:'ٱلسَّجْدَة',33:'ٱلْأَحْزَاب',34:'سَبَأ',35:'فَاطِر',
    36:'يس',37:'ٱلصَّافَّات',38:'ص',39:'ٱلزُّمَر',40:'غَافِر',
    41:'فُصِّلَت',42:'ٱلشُّورَىٰ',43:'ٱلْزُّخْرُف',44:'ٱلدُّخَان',45:'ٱلْجَاثِيَة',
    46:'ٱلْأَحْقَاف',47:'مُحَمَّد',48:'ٱلْفَتْح',49:'ٱلْحُجُرَات',50:'ق',
    51:'ٱلذَّارِيَات',52:'ٱلطُّور',53:'ٱلنَّجْم',54:'ٱلْقَمَر',55:'ٱلرَّحْمَٰن',
    56:'ٱلْوَاقِعَة',57:'ٱلْحَدِيد',58:'ٱلْمُجَادَلَة',59:'ٱلْحَشْر',60:'ٱلْمُمْتَحَنَة',
    61:'ٱلصَّفّ',62:'ٱلْجُمُعَة',63:'ٱلْمُنَافِقُون',64:'ٱلتَّغَابُن',65:'ٱلطَّلَاق',
    66:'ٱلتَّحْرِيم',67:'ٱلْمُلْك',68:'ٱلْقَلَم',69:'ٱلْحَاقَّة',70:'ٱلْمَعَارِج',
    71:'نُوح',72:'ٱلْجِنّ',73:'ٱلْمُزَّمِّل',74:'ٱلْمُدَّثِّر',75:'ٱلْقِيَامَة',
    76:'ٱلْإِنْسَان',77:'ٱلْمُرْسَلَات',78:'ٱلنَّبَأ',79:'ٱلنَّازِعَات',80:'عَبَسَ',
    81:'ٱلتَّكْوِير',82:'ٱلْإِنْفِطَار',83:'ٱلْمُطَفِّفِين',84:'ٱلْإِنْشِقَاق',85:'ٱلْبُرُوج',
    86:'ٱلطَّارِق',87:'ٱلْأَعْلَىٰ',88:'ٱلْغَاشِيَة',89:'ٱلْفَجْر',90:'ٱلْبَلَد',
    91:'ٱلشَّمْس',92:'ٱللَّيْل',93:'ٱلضُّحَىٰ',94:'ٱلشَّرْح',95:'ٱلتِّين',
    96:'ٱلْعَلَق',97:'ٱلْقَدْر',98:'ٱلْبَيِّنَة',99:'ٱلزَّلْزَلَة',100:'ٱلْعَادِيَات',
    101:'ٱلْقَارِعَة',102:'ٱلتَّكَاثُر',103:'ٱلْعَصْر',104:'ٱلْهُمَزَة',105:'ٱلْفِيل',
    106:'قُرَيْش',107:'ٱلْمَاعُون',108:'ٱلْكَوْثَر',109:'ٱلْكَافِرُون',110:'ٱلنَّصْر',
    111:'ٱلْمَسَد',112:'ٱلْإِخْلَاص',113:'ٱلْفَلَق',114:'ٱلنَّاس'
  };
  return names[num] || '';
}
