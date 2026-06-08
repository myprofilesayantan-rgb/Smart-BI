/**
 * smart-bi.js — Orchestrator
 *
 * Initializes all Smart BI component modules after DOM is ready.
 * Individual component logic lives in components/<name>/<name>.js
 */

document.addEventListener('DOMContentLoaded', () => {
  window.SmartBI_Nav.init();
  window.SmartBI_Hero.init();
  window.SmartBI_Discover.init();
  window.SmartBI_Goal.init();
  window.SmartBI_Process.init();
});
