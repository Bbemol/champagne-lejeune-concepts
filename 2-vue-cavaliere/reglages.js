'use strict';
/* Bandeau de réglages : masqué par défaut, il sert à essayer des variantes en direct (retours client du 14/11).
   Chaque réglage s'enregistre avec REGLAGES.option({ id, titre, choix, defaut, appliquer }).
   Choix gardés dans le navigateur ; ?<id>=<valeur> dans l'adresse l'emporte (ex. ?carte=b).
   « Copier ma configuration » donne la combinaison retenue, à fixer ensuite dans le site. */
window.REGLAGES = (() => {
  const CLE = 'lejeune-vue-cavaliere-reglages';
  const options = [];
  let valeurs = {};
  try { valeurs = JSON.parse(localStorage.getItem(CLE)) || {}; } catch (e) { /* stockage indisponible */ }
  const params = new URLSearchParams(location.search);
  const sauver = () => { try { localStorage.setItem(CLE, JSON.stringify(valeurs)); } catch (e) { /* rien */ } };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const ICONE = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h8M15 6h2M3 14h2M9 14h8"/><circle cx="13" cy="6" r="2"/><circle cx="7" cy="14" r="2"/></svg>';
  const FERMER = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15"/></svg>';

  document.body.insertAdjacentHTML('beforeend', `
    <button class="reglages-ouvrir" type="button" aria-expanded="false" aria-controls="reglages">${ICONE}<span>Réglages</span></button>
    <section class="reglages" id="reglages" aria-label="Réglages d'essai" hidden>
      <div class="reglages-groupes" id="reglages-groupes"></div>
      <div class="reglages-pied">
        <button class="reglages-copier" type="button">Copier ma configuration</button>
        <span class="reglages-statut" role="status" aria-live="polite"></span>
        <button class="reglages-fermer" type="button" aria-label="Fermer les réglages">${FERMER}</button>
      </div>
    </section>`);
  const bouton = document.querySelector('.reglages-ouvrir');
  const bandeau = document.getElementById('reglages');
  const groupes = document.getElementById('reglages-groupes');
  const statut = bandeau.querySelector('.reglages-statut');

  function ouvrir(on) {
    bandeau.hidden = !on;
    bouton.setAttribute('aria-expanded', String(on));
    document.body.classList.toggle('is-reglages', on);
    if (on) { const b = bandeau.querySelector('[aria-pressed="true"]'); if (b) b.focus({ preventScroll: true }); }
  }
  bouton.addEventListener('click', () => ouvrir(bandeau.hidden));
  bandeau.querySelector('.reglages-fermer').addEventListener('click', () => { ouvrir(false); bouton.focus(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !bandeau.hidden) { e.stopImmediatePropagation(); ouvrir(false); bouton.focus(); }
  }, true);

  function rendre(o) {
    const v = valeurs[o.id];
    let g = groupes.querySelector(`[data-reglage="${o.id}"]`);
    if (!g) {
      g = document.createElement('div');
      g.className = 'reglages-groupe'; g.dataset.reglage = o.id;
      g.setAttribute('role', 'group'); g.setAttribute('aria-label', o.titre);
      groupes.appendChild(g);
    }
    g.innerHTML = `<span class="reglages-titre">${esc(o.titre)}</span><span class="reglages-choix">${o.choix.map((c) =>
      `<button type="button" data-v="${esc(c.v)}" aria-pressed="${c.v === v}">${esc(c.label)}</button>`).join('')}</span>`;
    g.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => choisir(o, b.dataset.v)));
  }
  function choisir(o, v) {
    if (valeurs[o.id] === v) return;
    valeurs[o.id] = v; sauver();
    groupes.querySelectorAll(`[data-reglage="${o.id}"] button`).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
    o.appliquer(v);
  }

  bandeau.querySelector('.reglages-copier').addEventListener('click', async () => {
    const lignes = options.map((o) => {
      const c = o.choix.find((x) => x.v === valeurs[o.id]);
      return `${o.titre} : ${c ? c.label : valeurs[o.id]} (${o.id}=${valeurs[o.id]})`;
    });
    const texte = `Champagne Lejeune, concept 2 : ma configuration\n${lignes.join('\n')}`;
    let ok = false;
    try { await navigator.clipboard.writeText(texte); ok = true; } catch (e) {
      const t = document.createElement('textarea'); t.value = texte; t.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(t); t.select();
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      t.remove();
    }
    statut.textContent = ok ? 'Configuration copiée.' : 'Copie impossible : ' + lignes.join(' · ');
    clearTimeout(statut._t); statut._t = setTimeout(() => { statut.textContent = ''; }, ok ? 2600 : 8000);
  });

  return {
    /* Enregistre un réglage et l'applique tout de suite avec la valeur retenue. */
    option(o) {
      const valide = (v) => o.choix.some((c) => c.v === v);
      const demande = params.get(o.id);
      valeurs[o.id] = valide(demande) ? demande : valide(valeurs[o.id]) ? valeurs[o.id] : o.defaut;
      options.push(o);
      rendre(o);
      o.appliquer(valeurs[o.id], true);
      return valeurs[o.id];
    },
    valeur: (id) => valeurs[id],
    ouvrir
  };
})();
