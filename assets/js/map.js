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

  function displayName(loc) {
    var sedeClean = (loc.sede || '').replace(/\u00a0/g, '').trim();
    return sedeClean ? loc.name + ' — ' + sedeClean : loc.name;
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
    var html = '';
    var nameHtml = escapeHtml(displayName(loc));
    html += loc.page_url
      ? '<p class="name"><a href="' + loc.page_url + '" style="color:var(--mar-profundo);text-decoration:none;">' + nameHtml + '</a></p>'
      : '<p class="name">' + nameHtml + '</p>';
    if (loc.type) html += '<p class="type">' + escapeHtml(loc.type) + '</p>';
    if (loc.description) html += '<p class="desc">' + escapeHtml(loc.description) + '</p>';
    if (loc.address) html += '<p class="detail">' + escapeHtml(loc.address) + '</p>';
    if (loc.hours) html += '<p class="detail">' + escapeHtml(loc.hours) + '</p>';
    if (loc.phone) html += '<p class="detail">' + escapeHtml(loc.phone) + '</p>';
    if (loc.website) html += '<a href="' + loc.website + '" target="_blank" rel="noopener">' + escapeHtml(loc.website.replace(/^https?:\/\//, '').replace(/\/$/, '')) + '</a>';
    if (loc.redes && loc.redes.length) {
      html += '<p class="detail" style="margin-top:6px;">';
      html += loc.redes.map(function (r) {
        var isUrl = /^https?:\/\//.test(r.url);
        var label = escapeHtml(r.label) + (r.label && r.url ? ': ' : '') + escapeHtml(r.url);
        return isUrl
          ? '<a href="' + r.url + '" target="_blank" rel="noopener" style="margin-right:8px;">' + escapeHtml(r.label) + '</a>'
          : '<span style="margin-right:8px;">' + label + '</span>';
      }).join('');
      html += '</p>';
    }
    if (loc.page_url) html += '<p style="margin-top:8px;"><a href="' + loc.page_url + '">Más info →</a></p>';
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

  // Group entries that share the same "name" (multi-location bookstores/editorials)
  // so they appear as one labeled group in the sidebar instead of scattered separately.
  function groupByName(list) {
    var groups = [];
    var byName = {};
    list.forEach(function (loc) {
      if (!byName[loc.name]) {
        byName[loc.name] = { name: loc.name, items: [] };
        groups.push(byName[loc.name]);
      }
      byName[loc.name].items.push(loc);
    });
    groups.sort(function (a, b) { return a.name.localeCompare(b.name, 'es'); });
    groups.forEach(function (g) {
      g.items.sort(function (a, b) { return (a.sede || '').localeCompare(b.sede || '', 'es'); });
    });
    return groups;
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
    var groups = groupByName(filtered);
    list.innerHTML = '';
    groups.forEach(function (group) {
      if (group.items.length > 1) {
        var groupLabel = document.createElement('div');
        groupLabel.style.cssText = 'padding:10px 20px 2px;font-family:var(--font-mono);font-size:0.66rem;letter-spacing:0.05em;text-transform:uppercase;color:rgba(242,236,220,0.5);';
        groupLabel.textContent = group.name + ' · ' + group.items.length + ' sedes';
        list.appendChild(groupLabel);
      }
      group.items.forEach(function (loc) {
        var card = document.createElement('div');
        card.className = 'place-card' + (loc._id === activeId ? ' active' : '');
        card.dataset.id = loc._id;
        card.innerHTML = '<p class="name">' + (loc.page_url ? '<a href="' + loc.page_url + '" style="color:inherit;text-decoration:none;">' + escapeHtml(displayName(loc)) + '</a>' : escapeHtml(displayName(loc))) + '</p>' +
          '<p class="type">' + escapeHtml(loc.type) + '</p>' +
          '<p class="desc">' + escapeHtml(loc.description || '') + '</p>';
        card.addEventListener('click', function () {
          map.setView([loc.lat, loc.lng], 13, { animate: true });
          openPopup(loc, markers[loc._id]);
        });
        list.appendChild(card);
      });
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
