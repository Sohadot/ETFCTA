const states = {
  confirmed: 'A direct statement located in a verified primary document.',
  derived: 'A result produced by applying an identified, versioned ECS rule.',
  undisclosed: 'The reviewed evidence does not disclose this information.',
  na: 'The dimension does not apply under the governing ECS rule.',
  conflict: 'Reviewed sources disagree; no silent resolution is permitted.'
};
document.querySelectorAll('.legend button').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.legend button').forEach((item) => item.classList.toggle('active', item === button));
  document.querySelector('.state-note').textContent = states[button.dataset.state];
}));

const tools = {
  daily: [['Review Queue', 'Records approaching or beyond their evidence-review date.'], ['Evidence Watch', 'New primary filings awaiting verification and extraction.']],
  weekly: [['Release Digest', 'A concise record of admitted evidence, decisions, and corrections.'], ['Decision Diff', 'A field-level view of what changed and why.']],
  reference: [['ECS Rulebook', 'Versioned classification definitions and testable rules.'], ['Citation Builder', 'Stable citations for sources, evidence, and decisions.']]
};
const list = document.querySelector('.tool-list');
function renderTools(tab) { list.innerHTML = tools[tab].map(([name, text]) => `<article><div><span>Planned</span><h3>${name}</h3></div><p>${text}</p><b aria-hidden="true">→</b></article>`).join(''); }
document.querySelectorAll('[role="tab"]').forEach((tab) => tab.addEventListener('click', () => {
  document.querySelectorAll('[role="tab"]').forEach((item) => item.setAttribute('aria-selected', item === tab)); renderTools(tab.dataset.tab);
}));
renderTools('daily');

const menu = document.querySelector('.menu');
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') === 'true'; menu.setAttribute('aria-expanded', String(!open)); document.querySelector('#nav').classList.toggle('open', !open); });
