// ===========================
// PRAYER TIMES — prayer.js
// Uses: Aladhan API (free, no key needed)
//       Browser Geolocation API
// ===========================

const PRAYERS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
let countdownInterval = null;
let prayerTimesData = {};

// ===========================
// ON PAGE LOAD
// ===========================
window.addEventListener('DOMContentLoaded', () => {
  showDate();
  loadPrayerTimes();
});

// ===========================
// SHOW TODAY'S DATE
// ===========================
function showDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('dateText').textContent = now.toLocaleDateString('en-MY', options);
}

// ===========================
// LOAD PRAYER TIMES
// ===========================
function loadPrayerTimes() {
  document.getElementById('loadingSpinner').style.display = 'block';
  document.getElementById('prayerGrid').style.display = 'none';
  document.getElementById('nextPrayerBanner').style.display = 'none';
  document.getElementById('errorBox').style.display = 'none';
  document.getElementById('locationText').textContent = 'Detecting your location...';

  if (!navigator.geolocation) {
    showError('❌ Your browser does not support GPS location.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      try {
        // Get city name from coordinates
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const geoData = await geoRes.json();
        const city = geoData.address?.city || geoData.address?.town ||
                     geoData.address?.village || 'Your Location';
        const country = geoData.address?.country || '';
        document.getElementById('locationText').textContent = `${city}, ${country}`;

        // Fetch prayer times from Aladhan API
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();

        const prayerRes = await fetch(
          `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}?latitude=${lat}&longitude=${lng}&method=3`
        );
        const prayerData = await prayerRes.json();
        const timings = prayerData.data.timings;

        // Store timings
        prayerTimesData = {
          Fajr: timings.Fajr,
          Sunrise: timings.Sunrise,
          Dhuhr: timings.Dhuhr,
          Asr: timings.Asr,
          Maghrib: timings.Maghrib,
          Isha: timings.Isha
        };

        // Render
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('prayerGrid').style.display = 'grid';
        document.getElementById('nextPrayerBanner').style.display = 'block';

        renderPrayerTimes();
        highlightNextPrayer();

        // Update countdown every second
        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = setInterval(highlightNextPrayer, 1000);

      } catch (err) {
        showError('❌ Failed to load prayer times. Please check your internet connection.');
      }
    },
    (err) => {
      showError('❌ Location access denied. Please allow location access and try again.');
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

// ===========================
// RENDER PRAYER TIME CARDS
// ===========================
function renderPrayerTimes() {
  PRAYERS.forEach(prayer => {
    const timeEl = document.getElementById(`time-${prayer}`);
    if (timeEl && prayerTimesData[prayer]) {
      timeEl.textContent = formatTime(prayerTimesData[prayer]);
    }
  });
}

// ===========================
// HIGHLIGHT NEXT PRAYER
// ===========================
function highlightNextPrayer() {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  let nextPrayer = null;
  let nextMinutes = null;

  // Remove all active/passed classes first
  PRAYERS.forEach(p => {
    const card = document.getElementById(`card-${p}`);
    if (card) {
      card.classList.remove('active', 'passed');
    }
  });

  // Find next prayer and mark passed ones
  for (let i = 0; i < PRAYERS.length; i++) {
    const prayer = PRAYERS[i];
    const time = prayerTimesData[prayer];
    if (!time) continue;

    const [h, m] = time.split(':').map(Number);
    const prayerMinutes = h * 60 + m;

    if (prayerMinutes > nowMinutes) {
      if (!nextPrayer) {
        nextPrayer = prayer;
        nextMinutes = prayerMinutes;
        document.getElementById(`card-${prayer}`)?.classList.add('active');
      }
    } else {
      document.getElementById(`card-${prayer}`)?.classList.add('passed');
    }
  }

  // If all prayers passed, next is Fajr tomorrow
  if (!nextPrayer) {
    nextPrayer = 'Fajr';
    const [h, m] = prayerTimesData['Fajr'].split(':').map(Number);
    nextMinutes = h * 60 + m + 24 * 60; // tomorrow
    document.getElementById('card-Fajr')?.classList.remove('passed');
    document.getElementById('card-Fajr')?.classList.add('active');
  }

  // Update banner
  document.getElementById('nextPrayerName').textContent = nextPrayer;
  document.getElementById('nextPrayerTime').textContent = formatTime(prayerTimesData[nextPrayer]);

  // Countdown
  let diffMinutes = nextMinutes - nowMinutes;
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  const secs = 59 - now.getSeconds();

  let countdownText = '';
  if (hours > 0) countdownText += `${hours}h `;
  countdownText += `${mins}m ${String(secs).padStart(2, '0')}s remaining`;
  document.getElementById('nextCountdown').textContent = countdownText;
}

// ===========================
// HELPERS
// ===========================
function formatTime(time24) {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function showError(msg) {
  document.getElementById('loadingSpinner').style.display = 'none';
  document.getElementById('errorBox').style.display = 'block';
  document.getElementById('errorText').textContent = msg;
}
