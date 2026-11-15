// Play the logo's tonearm intro once per visit, not on every page load.
// The CSS only animates under .spinning-logo--play and never with reduced motion.
(function () {
  var key = "earthchestra-logo-played";
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch (e) {
    return; // storage blocked: stay still
  }
  document.querySelectorAll(".spinning-logo").forEach(function (logo) {
    logo.classList.add("spinning-logo--play");
  });
})();
