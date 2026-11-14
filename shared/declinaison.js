'use strict';
/* Passerelle de déclinaison : html[data-declinaison] = base | illustration | pop.
   Source : ?d= dans l'adresse, puis les messages de la coquille (concepts/index.html).
   Chaque concept écoute l'événement 'declinaison' sur document s'il doit réagir en JS. */
(() => {
  const VALUES = ['base', 'illustration', 'pop'];
  const root = document.documentElement;

  function apply(value) {
    const v = VALUES.includes(value) ? value : 'base';
    if (root.dataset.declinaison === v) return;
    root.dataset.declinaison = v;
    const u = new URL(location.href);
    if (v === 'base') u.searchParams.delete('d'); else u.searchParams.set('d', v);
    history.replaceState(history.state, '', u);
    document.dispatchEvent(new CustomEvent('declinaison', { detail: v }));
  }

  apply(new URLSearchParams(location.search).get('d'));

  window.addEventListener('message', (e) => {
    if (e.source !== window.parent || !e.data || e.data.type !== 'lejeune:declinaison') return;
    apply(e.data.value);
  });

  // La coquille veut savoir quand la page est prête (et suit les ancres internes).
  const tell = () => {
    if (window.parent !== window) window.parent.postMessage({ type: 'lejeune:etat', hash: location.hash }, '*');
  };
  window.addEventListener('hashchange', tell);
  window.addEventListener('DOMContentLoaded', tell);

  window.LEJEUNE_DECLINAISON = { get: () => root.dataset.declinaison, set: apply };
})();
