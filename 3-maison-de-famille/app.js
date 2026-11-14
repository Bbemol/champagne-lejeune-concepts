'use strict';
/* Concept 3 — La Maison de famille : one page, menu à ancres, fiche en panneau latéral. */
(() => {
  const L = window.LEJEUNE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const root = document.documentElement;
  const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 900px)');
  if (motion) root.classList.add('anim');

  // Feuille ou grappe derrière chaque bouteille (déclinaison Illustration).
  const LAVIS = { 'brut-reserve': 'feuille', 'demi-sec': 'grappe', rose: 'feuille', 'grande-reserve': 'grappe', millesime: 'feuille' };
  const lavis = (id) => `../shared/illustrations/${LAVIS[id] || 'feuille'}-${id}.png`;

  const state = { fiche: null, objet: 'Commande', cuvee: L.CUVEES[0].id };

  /* ---------- Contenus tirés des données communes ---------- */

  $('#communes').innerHTML = L.MAISON.communes.map((c) => `
    <li><span class="commune-nom">${esc(c.nom)}</span><span class="commune-cru">${esc(c.cru)}</span>
      <span class="commune-car">${esc(c.caractere)}</span></li>`).join('');
  $('#labels').innerHTML = L.MAISON.labels.map((l) => `<li>${esc(l.nom)}</li>`).join('');

  $('#rangee').innerHTML = L.CUVEES.map((c) => `
    <li>
      <button class="carte-cuvee" type="button" data-cuvee="${c.id}" aria-haspopup="dialog" aria-controls="fiche">
        <span class="bouteille-zone">
          <img class="lavis illus" src="${lavis(c.id)}" alt="" loading="lazy" decoding="async">
          <img class="bouteille" src="${c.bouteille}" alt="" loading="lazy" decoding="async" width="390" height="1350">
          ${c.id === 'millesime' ? '<span class="a-confirmer carte-provisoire">visuel provisoire : étiquette 2016, à remplacer</span>' : ''}
        </span>
        <span class="carte-nom"><span>${esc(c.name)}</span></span>
        <span class="carte-court">${esc(c.short)}</span>
        <span class="carte-cru">${esc(c.cru)}</span>
      </button>
    </li>`).join('');

  // Les trois dernières nouvelles, la plus récente d'abord (la René Louis, de saison, en tête).
  const NOUVELLES = ['rene-louis', 'recrutement', 'medaille'].map((id) => L.ACTUALITES.find((a) => a.id === id)).filter(Boolean);
  $('#liste-nouvelles').innerHTML = NOUVELLES.map((a) => `
    <li>
      <div class="nouvelle-tete"><h3>${esc(a.titre)}</h3><p class="nouvelle-meta">${esc(a.date)} · ${esc(a.tag)}</p></div>
      <p class="nouvelle-texte">${esc(a.texte)}${a.aConfirmer ? ' <span class="a-confirmer">à confirmer</span>' : ''}</p>
    </li>`).join('');

  $('#objets').innerHTML = L.CONTACT.objets.map((o, i) => `
    <label class="objet"><input type="radio" name="objet" value="${esc(o)}"${i === 0 ? ' checked' : ''}><span>${esc(o)}</span></label>`).join('');
  $('#f-cuvee').innerHTML = L.CUVEES.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('');

  /* ---------- En-tête : filet de section, masquage au défilement ---------- */

  const top = $('#top');
  const filet = $('.nav-filet');
  const navLinks = $$('.nav a');
  const sections = $$('[data-section]');
  const cta = $('#cta-bas');
  let courant = null;
  let lastY = window.scrollY;
  let ticking = false;
  let geste = 0;
  ['wheel', 'touchmove', 'keydown'].forEach((ev) => window.addEventListener(ev, () => { geste = Date.now(); }, { passive: true }));

  function placerFilet() {
    const a = navLinks.find((l) => l.dataset.nav === courant);
    if (!a) { filet.style.setProperty('--o', 0); return; }
    filet.style.setProperty('--x', a.offsetLeft + 'px');
    filet.style.setProperty('--w', a.offsetWidth + 'px');
    filet.style.setProperty('--o', 1);
    navLinks.forEach((l) => (l === a ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current')));
  }

  function surDefilement() {
    ticking = false;
    const y = window.scrollY;
    const ligne = window.innerHeight * 0.38;
    let actif = null;
    for (const s of sections) if (s.getBoundingClientRect().top <= ligne) actif = s.dataset.section;
    if (y < 40) actif = null; // en haut de page, l'accueil n'est pas une rubrique soulignée
    if (actif !== courant) { courant = actif; placerFilet(); }

    const menuOuvert = !$('#menu').hidden;
    top.classList.toggle('is-sol', y > 8);
    // Masqué seulement quand c'est la personne qui descend (pas un saut d'ancre).
    if (!window.matchMedia('(max-width: 1020px)').matches && !menuOuvert && !state.fiche && Date.now() - geste < 900 && y > lastY + 2 && y > 160) top.classList.add('is-cache');
    if (y < lastY - 2) top.classList.remove('is-cache');

    // Règle fixe : le bouton n'accompagne que le premier écran (la photo de famille),
    // il ne passe jamais sur un texte, une fiche ou un formulaire.
    const hero = $('#famille').getBoundingClientRect();
    cta.classList.toggle('is-cache', menuOuvert || !!state.fiche || hero.bottom < window.innerHeight * 0.98);
    tracerFil();
    lastY = y;
    noterAncre();
    if (root.dataset.declinaison === 'illustration') pousserSarment();
  }

  // Repère de lecture : la première ligne de texte entièrement visible sous l'en-tête,
  // pour garder la place quand la déclinaison ajoute ou retire des dessins.
  const reperes = $$('.titre-ligne, main h3, .etape, main figure, .liste-nouvelles li, .rangee li, .formulaire, .coord, .pied p')
    .filter((el) => !el.closest('.histoire-tete, .illus')); // ni colonne collante, ni dessin qui peut disparaître
  let ancre = null;
  function noterAncre() {
    const h = top.getBoundingClientRect().bottom;
    for (const el of reperes) {
      const r = el.getBoundingClientRect();
      if (r.height && r.top >= h && r.top < window.innerHeight) { ancre = { el, top: r.top }; return; }
    }
  }
  function garderAncre(a = ancre) {
    if (!a || window.scrollY < 4) return;
    const r = a.el.getBoundingClientRect();
    if (Math.abs(r.top - a.top) > 1) window.scrollBy({ top: r.top - a.top, behavior: 'instant' });
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(surDefilement); } }, { passive: true });
  window.addEventListener('resize', () => { placerFilet(); surDefilement(); });
  document.fonts && document.fonts.ready.then(placerFilet);

  // Un lien du menu ramène l'en-tête (on vient de demander à naviguer).
  navLinks.forEach((a) => a.addEventListener('click', () => setTimeout(() => top.classList.remove('is-cache'), 900)));

  /* ---------- Menu mobile ---------- */

  const burger = $('.burger');
  const menu = $('#menu');
  function ouvrirMenu(ouvert) {
    burger.setAttribute('aria-expanded', String(ouvert));
    burger.setAttribute('aria-label', ouvert ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.hidden = !ouvert;
    menu.classList.toggle('is-ouvert', ouvert);
    document.body.classList.toggle('is-fige', ouvert);
    top.classList.remove('is-cache');
    surDefilement();
    if (ouvert) $('a', menu).focus({ preventScroll: true });
  }
  burger.addEventListener('click', () => ouvrirMenu(menu.hidden));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => ouvrirMenu(false)));
  mobile.addEventListener('change', () => { if (!menu.hidden) ouvrirMenu(false); });

  /* ---------- Langue ---------- */

  const toast = $('#toast');
  let toastTimer = 0;
  $$('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.lang === 'en') {
      toast.textContent = L.CONTACT.langueNote;
      toast.hidden = false;
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => { toast.hidden = true; }, 3600);
    } else toast.hidden = true;
  }));

  /* ---------- Apparitions : titres qui montent, tirages qui se posent ---------- */

  if (motion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add(e.target.matches('[data-monte]') ? 'is-monte' : 'is-pose');
        io.unobserve(e.target);
      }
    }, { rootMargin: '0px 0px -12% 0px' });
    $$('[data-monte], .tirage, .dessin-pressoir').forEach((el) => io.observe(el));
  } else {
    $$('[data-monte]').forEach((el) => el.classList.add('is-monte'));
    $$('.tirage, .dessin-pressoir').forEach((el) => el.classList.add('is-pose'));
  }

  /* ---------- Le sarment pousse le long de la frise (Illustration) ---------- */

  const etapes = $$('[data-etape]');
  const frise = $('#frise');
  const annees = etapes.map((e) => $('.annee span', e));

  // Chaque sarment (et le fil) va du bas d'une date au haut de la suivante.
  function placerFil() {
    const f = frise.getBoundingClientRect();
    const a = annees.map((s) => s.getBoundingClientRect());
    frise.style.setProperty('--fil-debut', (a[0].bottom - f.top + 6) + 'px');
    frise.style.setProperty('--fil-long', Math.max(0, a[a.length - 1].top - a[0].bottom - 12) + 'px');
    etapes.forEach((e, i) => {
      const v = $('.vigne', e);
      if (!v || !a[i + 1]) return;
      const t = e.getBoundingClientRect().top;
      v.style.setProperty('--v-haut', (a[i].bottom - t + 8) + 'px');
      v.style.setProperty('--v-long', Math.max(0, a[i + 1].top - a[i].bottom - 16) + 'px');
    });
  }

  function tracerFil() {
    if (!motion) { frise.style.setProperty('--trace', 1); return; }
    const r = frise.getBoundingClientRect();
    const debut = parseFloat(frise.style.getPropertyValue('--fil-debut')) || 0;
    const long = parseFloat(frise.style.getPropertyValue('--fil-long')) || 1;
    const p = (window.innerHeight * 0.62 - (r.top + debut)) / long;
    frise.style.setProperty('--trace', Math.max(0, Math.min(1, p)).toFixed(3));
  }

  function pousserSarment() {
    const h = window.innerHeight;
    for (const e of etapes) {
      const v = $('.vigne', e);
      if (!v) continue;
      if (!motion) { v.style.setProperty('--pousse', 1); continue; }
      const r = v.getBoundingClientRect();
      // 0 quand le haut du sarment passe aux deux tiers de l'écran, 1 quand son bas y arrive.
      const p = (h * 0.66 - r.top) / Math.max(1, r.height);
      v.style.setProperty('--pousse', Math.max(0, Math.min(1, p)).toFixed(3));
    }
  }
  placerFil();
  window.addEventListener('resize', () => { placerFil(); tracerFil(); pousserSarment(); });
  // Changement de déclinaison : la lecture ne bouge pas.
  // 1. Juste avant la bascule (écoute en capture, donc avant declinaison.js), on mémorise
  //    le premier bloc dont le haut passe sous l'en-tête.
  const blocsAncre = $$('.titre-ligne, main h3, .etape, main figure, .liste-nouvelles li, .rangee li, .formulaire, .coord')
    .filter((el) => !el.closest('.illus, .histoire-tete'));
  let avantBascule = null;
  window.addEventListener('message', (e) => {
    if (!e.data || e.data.type !== 'lejeune:declinaison' || e.data.value === root.dataset.declinaison) return;
    const h = top.getBoundingClientRect().bottom;
    const el = blocsAncre.find((b) => { const r = b.getBoundingClientRect(); return r.height && r.top >= h - 1 && r.top < window.innerHeight; });
    avantBascule = el && window.scrollY > 4 ? { el, top: el.getBoundingClientRect().top } : null;
  }, true);

  // 2. Après la bascule, on recale à chaque changement de taille pendant 1,5 s
  //    (dessins qui arrivent, fil et sarments replacés).
  document.addEventListener('declinaison', () => {
    const a = avantBascule || ancre;
    avantBascule = null;
    const recale = () => {
      if (!a) return;
      const d = a.el.getBoundingClientRect().top - a.top;
      if (Math.abs(d) > 0.5) window.scrollBy({ top: d, behavior: 'instant' });
    };
    placerFil(); recale(); pousserSarment();
    const ro = 'ResizeObserver' in window ? new ResizeObserver(() => { placerFil(); recale(); }) : null;
    if (ro) ro.observe(document.body);
    $$('.illus img, img.illus').forEach((im) => im.addEventListener('load', recale, { once: true }));
    setTimeout(() => { if (ro) ro.disconnect(); recale(); pousserSarment(); noterAncre(); }, 1500);
  });

  /* ---------- Carrousel mobile : barre de progression ---------- */

  const rangee = $('#rangee');
  const progres = $('#rangee-progres');
  function majProgres() {
    const max = rangee.scrollWidth - rangee.clientWidth;
    const part = rangee.clientWidth / rangee.scrollWidth;
    progres.style.width = (part * 100) + '%';
    progres.style.transform = `translateX(${max > 0 ? (rangee.scrollLeft / max) * ((1 / part) - 1) * 100 : 0}%)`;
  }
  rangee.addEventListener('scroll', () => requestAnimationFrame(majProgres), { passive: true });
  window.addEventListener('resize', majProgres);

  /* ---------- Fiche cuvée ---------- */

  const fiche = $('#fiche');
  const voile = $('#voile');
  let ficheTimer = 0;
  let retourFocus = null;

  function remplirFiche(id) {
    const i = L.CUVEES.findIndex((c) => c.id === id);
    const c = L.CUVEES[i];
    const prec = L.CUVEES[(i - 1 + L.CUVEES.length) % L.CUVEES.length];
    const suiv = L.CUVEES[(i + 1) % L.CUVEES.length];
    const b = $('#fiche-bouteille');
    b.src = c.bouteille; b.alt = `Bouteille de ${c.name}`;
    $('#fiche-lavis').src = lavis(c.id);
    $('#fiche-provisoire').hidden = c.id !== 'millesime';
    $('#fiche-nom').textContent = c.name;
    $('#fiche-meta').textContent = `${c.cru} · ${c.mots}`;
    $('#fiche-court').textContent = c.short;
    $('#fiche-desc').textContent = c.desc;
    const d = $('#fiche-distinction');
    d.hidden = !c.distinction;
    d.innerHTML = c.distinction
      ? `<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="8" r="5.2"/><path d="M6.6 12.2 5 18.5l5-2.4 5 2.4-1.6-6.3"/></svg>${esc(c.distinction)}` : '';
    const ac = $('#fiche-a-confirmer');
    ac.hidden = !c.aConfirmer;
    ac.innerHTML = c.aConfirmer ? `<span class="a-confirmer">à confirmer par la famille</span> ${esc(c.aConfirmer)}` : '';
    $('#fiche-faits').innerHTML = c.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
    $('#fiche-degust').innerHTML = c.tasting.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
    $('#fiche-accords').textContent = c.accords;
    $('#fiche-prec').textContent = prec.name;
    $('#fiche-suiv').textContent = suiv.name;
    $('#fiche-texte').scrollTop = 0;
    fiche.scrollTop = 0;
    // La bouteille remonte doucement à chaque cuvée.
    b.style.animation = 'none'; void b.offsetWidth; b.style.animation = '';
  }

  function ouvrirFiche(id, { pousser = true } = {}) {
    if (!L.CUVEES.some((c) => c.id === id)) return;
    clearTimeout(ficheTimer);
    if (!state.fiche) retourFocus = document.activeElement;
    remplirFiche(id);
    state.fiche = id;
    fiche.hidden = false; voile.hidden = false;
    document.body.classList.add('is-fige');
    $('#contenu').inert = true; top.inert = true;
    requestAnimationFrame(() => requestAnimationFrame(() => { fiche.classList.add('is-ouvert'); voile.classList.add('is-ouvert'); }));
    $('[data-fermer]', fiche).focus({ preventScroll: true });
    if (pousser) history.replaceState(null, '', '#cuvees/' + id);
    surDefilement();
  }

  function fermerFiche({ pousser = true, rendreFocus = true } = {}) {
    if (!state.fiche) return;
    state.fiche = null;
    fiche.classList.remove('is-ouvert'); voile.classList.remove('is-ouvert');
    document.body.classList.remove('is-fige');
    $('#contenu').inert = false; top.inert = false;
    ficheTimer = setTimeout(() => { fiche.hidden = true; voile.hidden = true; }, motion ? 700 : 0);
    if (pousser) history.replaceState(null, '', '#cuvees');
    if (rendreFocus && retourFocus) retourFocus.focus({ preventScroll: true });
    surDefilement();
  }

  rangee.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cuvee]');
    if (b) ouvrirFiche(b.dataset.cuvee);
  });
  $('[data-fermer]', fiche).addEventListener('click', () => fermerFiche());
  voile.addEventListener('click', () => fermerFiche());
  $$('[data-pas]', fiche).forEach((b) => b.addEventListener('click', () => {
    const i = L.CUVEES.findIndex((c) => c.id === state.fiche);
    const n = L.CUVEES[(i + Number(b.dataset.pas) + L.CUVEES.length) % L.CUVEES.length];
    remplirFiche(n.id); state.fiche = n.id;
    history.replaceState(null, '', '#cuvees/' + n.id);
  }));
  $('[data-commander]', fiche).addEventListener('click', () => {
    const id = state.fiche;
    fermerFiche({ rendreFocus: false });
    choisirObjet('Commande', id);
    allerVers('#visite', '#f-nom');
  });

  // Focus gardé dans le panneau ; Échap ferme.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (state.fiche) fermerFiche();
      else if (!menu.hidden) { ouvrirMenu(false); burger.focus(); }
      return;
    }
    if (e.key === 'Tab' && state.fiche) {
      const f = $$('button, a[href], select, input, textarea', fiche).filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------- Formulaire ---------- */

  const form = $('#form');
  function choisirObjet(objet, cuvee) {
    state.objet = objet;
    if (cuvee) state.cuvee = cuvee;
    $$('input[name="objet"]', form).forEach((r) => { r.checked = r.value === objet; });
    $('#champ-cuvee').hidden = objet !== 'Commande';
    $('#f-cuvee').value = state.cuvee;
    $('#f-msg').placeholder = L.CONTACT.placeholders[objet] || '';
    form.hidden = false; $('#merci').hidden = true;
  }
  form.addEventListener('change', (e) => {
    if (e.target.name === 'objet') choisirObjet(e.target.value);
    if (e.target.id === 'f-cuvee') state.cuvee = e.target.value;
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nom = $('#f-nom');
    const mail = $('#f-email');
    const manque = [];
    nom.setAttribute('aria-invalid', String(!nom.value.trim()));
    mail.setAttribute('aria-invalid', String(!mail.validity.valid || !mail.value.trim()));
    if (!nom.value.trim()) manque.push('votre nom');
    if (!mail.value.trim() || !mail.validity.valid) manque.push('un courriel valide');
    const err = $('#form-erreur');
    if (manque.length) {
      err.textContent = `Il nous manque ${manque.join(' et ')} pour vous répondre.`;
      err.hidden = false;
      (nom.value.trim() ? mail : nom).focus();
      return;
    }
    err.hidden = true;
    // Pas encore d'envoi : la confirmation s'affiche seulement.
    form.hidden = true;
    const merci = $('#merci');
    merci.hidden = false; merci.focus();
  });
  $('#nouveau-message').addEventListener('click', () => { form.reset(); choisirObjet('Commande'); $('#f-nom').focus(); });

  // Liens qui préchoisissent l'objet (« Proposer sa venue » → Vendanges).
  $$('[data-objet]').forEach((a) => a.addEventListener('click', () => choisirObjet(a.dataset.objet)));

  function allerVers(sel, focusSel) {
    const el = $(sel);
    history.replaceState(null, '', sel);
    el.scrollIntoView({ behavior: motion ? 'smooth' : 'auto', block: 'start' });
    if (focusSel) setTimeout(() => $(focusSel).focus({ preventScroll: true }), motion ? 900 : 0);
  }

  /* ---------- Adresses : #cuvees/<id> ouvre la fiche ---------- */

  function lireAdresse(initial) {
    const m = location.hash.match(/^#cuvees\/([\w-]+)/);
    if (initial && location.hash.length > 1) {
      // Arrivée par une adresse : on se place tout de suite, sans défilement animé.
      const cible = document.getElementById(location.hash.slice(1).split('/')[0]);
      if (cible) cible.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
    if (m) ouvrirFiche(m[1], { pousser: false });
    else if (state.fiche) fermerFiche({ pousser: false, rendreFocus: false });
  }
  window.addEventListener('hashchange', () => lireAdresse(false));

  choisirObjet('Commande');
  majProgres();
  lireAdresse(true);
  surDefilement();
  // Les images et polices peuvent décaler la page : on se recale une fois tout chargé.
  // Tant que la personne n'a pas bougé, on se recale sur l'adresse quand polices et images arrivent.
  const recaler = () => { placerFil(); if (!geste) lireAdresse(true); surDefilement(); majProgres(); };
  window.addEventListener('load', () => {
    recaler();
    requestAnimationFrame(() => root.classList.add('lisse'));
  });
  if (document.fonts) document.fonts.ready.then(recaler);
})();
