document.addEventListener('DOMContentLoaded', function () {
  var el = document.getElementById('lit-map');
  if (!el || typeof L === 'undefined') return;

  var locations = (window.MAP_LOCATIONS || []).filter(function (l) {
    return l.lat && l.lng;
  });

  var center = locations.length
    ? [locations[0].lat, locations[0].lng]
    : [18.2208, -66.5901]; // Puerto Rico

  var map = L.map('lit-map').setView(center, 9);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);

  var bounds = [];
  locations.forEach(function (loc) {
    var marker = L.marker([loc.lat, loc.lng]).addTo(map);
    var popup = '<h4>' + loc.name + '</h4>';
    if (loc.type) popup += '<p style="margin:0 0 4px;font-family:var(--font-mono,monospace);font-size:0.72rem;text-transform:uppercase;">' + loc.type + '</p>';
    if (loc.description) popup += '<p style="margin:0;">' + loc.description + '</p>';
    if (loc.url) popup += '<p style="margin:4px 0 0;"><a href="' + loc.url + '" target="_blank" rel="noopener">Más info →</a></p>';
    marker.bindPopup(popup);
    bounds.push([loc.lat, loc.lng]);
  });

  if (bounds.length > 1) map.fitBounds(bounds, { padding: [30, 30] });
});
