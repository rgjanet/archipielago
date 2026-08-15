document.addEventListener('DOMContentLoaded', function () {
  var mapEl = document.getElementById('lit-map');
  if (!mapEl || typeof L === 'undefined') return;

  var locations = (window.MAP_LOCATIONS || []).filter(function (l) {
    return l.lat && l.lng;
  });

  var map = L.map('lit-map', { zoomControl: true }).setView([18.2208, -66.5901], 9);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19
  }).addTo(map);

  function pinIcon() {
    return L.divIcon({
      className: '',
      html: '<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M13 0C5.8 0 0 5.8 0 13c0 9.7 13 21 13 21s13-11.3 13-21C26 5.8 20.2 0 13 0z" fill="#0F3D3E" stroke="#E8603F" stroke-width="1.5"/>' +
        '<circle cx="13" cy="13" r="5.5" fill="#E8603F"/></svg>',
      iconSize: [26, 34],
      iconAnchor: [13, 34],
      popupAnchor: [0, -30]
    });
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s || '';
    return d.innerHTML;
  }

  var markers = {};
  var activeId = null;

  locations.forEach(function (loc, i) {
    loc._id = 'loc_' + i;
    var marker = L.marker([loc.lat, loc.lng], { icon: pinIcon() }).addTo(map);
    marker.on('click', function () { openPopup(loc, marker); });
    markers[loc._id] = marker;
  });

  function openPopup(loc, marker) {
    var container = document.createElement('div');
    container.className = 'pin-popup';
    var html = '<p class="name">' + escapeHtml(loc.name) + '</p>' +
      '<p class="type">' + escapeHtml(loc.type) + '</p>' +
      (loc.description ? '<p class="desc">' + escapeHtml(loc.description) + '</p>' : '');
    if (loc.url) html += '<a href="' + loc.url + '" target="_blank" rel="noopener">Más info →</a>';
    container.innerHTML = html;
    marker.bindPopup(container, { maxWidth: 260 }).openPopup();
    highlightCard(loc._id);
  }

  function highlightCard(id) {
    activeId = id;
    document.querySelectorAll('.place-card').forEach(function (el) {
      el.classList.toggle('active', el.dataset.id === id);
    });
  }

  function renderCount(n) {
    var el = document.getElementById('map-count');
    if (el) el.textContent = n === 1 ? '1 lugar' : n + ' lugares';
  }

  function renderList(filterType) {
    var list = document.getElementById('map-list');
    if (!list) return;
    var filtered = locations.filter(function (l) {
      return filterType === 'all' || l.type === filterType;
    });
    if (filtered.length === 0) {
      list.innerHTML = '<div style="padding:20px;font-size:0.82rem;color:rgba(242,236,220,0.6);">Sin resultados para este filtro.</div>';
      renderCount(0);
      return;
    }
    list.innerHTML = '';
    filtered.forEach(function (loc) {
      var card = document.createElement('div');
      card.className = 'place-card' + (loc._id === activeId ? ' active' : '');
      card.dataset.id = loc._id;
      card.innerHTML = '<p class="name">' + escapeHtml(loc.name) + '</p>' +
        '<p class="type">' + escapeHtml(loc.type) + '</p>' +
        '<p class="desc">' + escapeHtml(loc.description || '') + '</p>';
      card.addEventListener('click', function () {
        map.setView([loc.lat, loc.lng], 13, { animate: true });
        openPopup(loc, markers[loc._id]);
      });
      list.appendChild(card);
    });
    renderCount(filtered.length);
  }

  function renderFilters() {
    var bar = document.getElementById('map-filter');
    if (!bar) return;
    var types = Array.from(new Set(locations.map(function (l) { return l.type; }))).sort();
    var buttons = ['all'].concat(types);
    bar.innerHTML = '';
    buttons.forEach(function (type) {
      var btn = document.createElement('button');
      btn.textContent = type === 'all' ? 'Todos' : type;
      btn.dataset.type = type;
      if (type === 'all') btn.classList.add('active');
      btn.addEventListener('click', function () {
        bar.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderList(type);
      });
      bar.appendChild(btn);
    });
  }

  var bounds = locations.map(function (l) { return [l.lat, l.lng]; });
  if (bounds.length > 1) map.fitBounds(bounds, { padding: [30, 30] });

  renderFilters();
  renderList('all');
});
