/* Runs before products.js. If products.js has a typo (a missing comma or
   quote), the browser stops reading it; this records that, and where when the
   browser says, so the page can explain it on screen instead of showing
   nothing. (Pages opened straight from a folder do not get the line number.) */
window.addEventListener("error", (event) => {
  if (window.HUG_ATELIER || event.target !== window) return;
  const file = event.filename || "";
  if (file && !/products\.js(?:[?#].*)?$/.test(file)) return;
  window.HUG_ATELIER_ERROR = { line: file ? event.lineno || 0 : 0 };
});
