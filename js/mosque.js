// ===========================
// MOSQUE FINDER — mosque.js
// Uses: Browser Geolocation API
//       Overpass API (OpenStreetMap) for mosque data
//       Leaflet.js for the map
// ===========================

let map = null;
let userMarker = null;
let mosqueMarkers = [];

// ===========================
// MAIN FUNCTION — FIND MOSQUES
// ===========================
function findMosques() {
  const btn = document.getElementById('locateBtn');
  const statusBar = document.getElementById('statusBar');
  const statusText = document.getElementById('statusText');

  // Check if browser supports geolocation
  if (!navigator.geolocation) {
    setStatus('error', '❌ Your browser does not support GPS location.');
    return;
  }

  // Update UI to loading state
  btn.disabled = true;
  btn.textContent = '⏳ Detecting your location...';
  setStatus('loading', '⏳ Getting your GPS location, please wait...');

  // Get user's GPS coordinates
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setStatus('loading', '🔍 Location found! Searching for nearby mosques...');
      btn.textContent = '🔄 Refreshing...';

      // Show map and fetch mosques
      showMap(lat, lng);
      fetchNearbyMosques(lat, lng);
    },
    (error) => {
      btn.disabled = false;
      btn.textContent = '📍 Find Mosques Near Me';

      switch (error.code) {
        case error.PERMISSION_DENIED:
          setStatus('error', '❌ Location access denied. Please allow location access in your browser and try again.');
          break;
        case error.POSITION_UNAVAILABLE:
          setStatus('error', '❌ Location unavailable. Please check your GPS settings.');
          break;
        case error.TIMEOUT:
          setStatus('error', '❌ Location request timed out. Please try again.');
          break;
        default:
          setStatus('error', '❌ An unknown error occurred. Please try again.');
      }
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

// ===========================
// SHOW MAP
// ===========================
function showMap(lat, lng) {
  document.getElementById('mapLayout').style.display = 'grid';

  // Scroll to map
  document.getElementById('mapLayout').scrollIntoView({ behavior: 'smooth' });

  // Init map if not already created
  if (!map) {
    map = L.map('map').setView([lat, lng], 14);

    // OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);
  } else {
    map.setView([lat, lng], 14);
  }

  // Remove old user marker
  if (userMarker) map.removeLayer(userMarker);

  // Add user location marker (blue)
  const userIcon = L.divIcon({
    html: `<div style="
      background:#3b82f6;
      width:16px;height:16px;
      border-radius:50%;
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    className: ''
  });

  userMarker = L.marker([lat, lng], { icon: userIcon })
    .addTo(map)
    .bindPopup('<div class="popup-name">📍 You are here</div>')
    .openPopup();
}

// ===========================
// FETCH NEARBY MOSQUES
// Uses Overpass API (free, no key needed)
// ===========================
async function fetchNearbyMosques(lat, lng) {
  const radius = 3000; // 3km radius

  // Overpass query — finds all mosques within radius
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});
    );
    out center;
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const mosques = data.elements;

    if (mosques.length === 0) {
      setStatus('error', '🕌 No mosques found within 3km. Try in a more populated area.');
      document.getElementById('locateBtn').disabled = false;
      document.getElementById('locateBtn').textContent = '📍 Find Mosques Near Me';
      return;
    }

    // Clear old mosque markers
    mosqueMarkers.forEach(m => map.removeLayer(m));
    mosqueMarkers = [];

    // Mosque icon (green)
    const mosqueIcon = L.divIcon({
      html: `<div style="
        background:#1b6b3a;
        color:white;
        width:32px;height:32px;
        border-radius:50%;
        border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
        font-size:14px;
      ">🕌</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      className: ''
    });

    // Add markers + build list
    const listEl = document.getElementById('mosqueList');
    listEl.innerHTML = '';

    mosques.forEach((mosque, index) => {
      const mLat = mosque.lat || mosque.center?.lat;
      const mLng = mosque.lon || mosque.center?.lon;
      if (!mLat || !mLng) return;

      const name = mosque.tags?.name || mosque.tags?.['name:en'] || 'Unnamed Mosque';
      const address = buildAddress(mosque.tags);
      const distance = getDistance(lat, lng, mLat, mLng);

      // Add map marker
      const marker = L.marker([mLat, mLng], { icon: mosqueIcon })
        .addTo(map)
        .bindPopup(`
          <div class="popup-name">🕌 ${name}</div>
          <div class="popup-address">${address || 'Address not available'}</div>
        `);

      mosqueMarkers.push(marker);

      // Add list item
      const item = document.createElement('div');
      item.className = 'mosque-item';
      item.innerHTML = `
        <div class="mosque-item-name">🕌 ${name}</div>
        ${address ? `<div class="mosque-item-address">${address}</div>` : ''}
        <span class="mosque-item-distance">${distance} km away</span>
      `;

      // Click list item → open map popup
      item.addEventListener('click', () => {
        map.setView([mLat, mLng], 17);
        marker.openPopup();
      });

      listEl.appendChild(item);
    });

    setStatus('success', `✅ Found ${mosques.length} mosque(s) within 3km of your location`);
    document.getElementById('locateBtn').disabled = false;
    document.getElementById('locateBtn').textContent = '🔄 Refresh Location';

  } catch (err) {
    setStatus('error', '❌ Failed to fetch mosque data. Please check your connection and try again.');
    document.getElementById('locateBtn').disabled = false;
    document.getElementById('locateBtn').textContent = '📍 Find Mosques Near Me';
  }
}

// ===========================
// HELPERS
// ===========================

// Build a readable address from OSM tags
function buildAddress(tags) {
  if (!tags) return '';
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:city'] || tags['addr:town'],
    tags['addr:postcode']
  ].filter(Boolean);
  return parts.join(', ');
}

// Calculate distance between two coordinates (km)
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

// Update status bar
function setStatus(type, message) {
  const bar = document.getElementById('statusBar');
  const text = document.getElementById('statusText');
  bar.className = `status-bar ${type}`;
  text.textContent = message;
}
