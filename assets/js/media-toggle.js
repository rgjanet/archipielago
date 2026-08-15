document.querySelectorAll('.media-toggle').forEach(function (toggle) {
  var id = toggle.dataset.toggle;
  var buttons = toggle.querySelectorAll('button');
  var panes = document.querySelectorAll('[data-toggle-target="' + id + '"]');

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var mode = btn.dataset.mode;

      buttons.forEach(function (b) { b.classList.toggle('active', b === btn); });
      panes.forEach(function (pane) {
        var isActive = pane.dataset.pane === mode;
        pane.classList.toggle('active', isActive);
        // pause whichever pane just got hidden so audio/video don't play under each other
        if (!isActive) {
          var media = pane.querySelector('audio, video');
          if (media) media.pause();
        }
      });
    });
  });
});
