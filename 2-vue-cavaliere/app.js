'use strict';
/* Concept 2 — La Vue cavalière. La carte dessinée du domaine est le site :
   chaque lieu ouvre une page de carnet, la légende sert de menu, la carte garde la trace des lieux visités. */
(() => {
  const L = window.LEJEUNE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ILL = L.shared + 'illustrations/';
  const reduit = matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQ = matchMedia('(max-width: 900px)');
  const estMobile = () => mobileQ.matches;

  /* ---------- La carte : dimensions et lieux (en fraction de la carte) ---------- */
  const MAP_W = 2400;
  const MAP_H = Math.round(MAP_W * 2378 / 3200);

  const LIEUX = [
    { id: 'maison', n: 1, nom: 'La maison', sous: 'depuis 1684', x: .47, y: .335, r: .1, forme: 1, cote: 'gauche', vue: { x: .558, f: 1.3 } },
    { id: 'pressoir', n: 2, nom: 'Le pressoir', sous: '1927', note: 'emplacement indicatif, à confirmer', x: .44, y: .45, r: .07, forme: 2, cote: 'gauche' },
    { id: 'cave', n: 3, nom: 'La cave', sous: 'les cuvées', note: 'emplacement indicatif, à confirmer', x: .585, y: .415, r: .08, forme: 3, cote: 'droite' },
    { id: 'parcelles', n: 4, nom: 'Les parcelles', sous: 'Chardonnay, Pinot Noir', x: .245, y: .7, r: .165, forme: 2, cote: 'droite',
      autres: [{ x: .79, y: .6, r: .16, forme: 1 }, { x: .62, y: .16, r: .12, forme: 3 }] },
    { id: 'venir', n: 5, nom: 'vous êtes attendus', legende: 'Venir au domaine', sous: '67, avenue de Champagne', x: .368, y: .53, r: .06, forme: 3, cote: 'gauche', attendus: true },
    { id: 'kiosque', n: 0, nom: 'Le kiosque aux nouvelles', legende: 'Le kiosque', sous: 'les nouvelles', note: 'un repère de lecture, pas un lieu du domaine', x: .15, y: .29, r: .06, forme: 1, cote: 'droite' }
  ];
  const lieu = (id) => LIEUX.find((l) => l.id === id);
  const ORDRE = ['maison', 'pressoir', 'cave', 'parcelles', 'venir', 'kiosque'];

  const ICONE_PUNAISE = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="7.5" r="4.5"/><path d="M10 12v6"/></svg>';
  const FLECHE = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5"/></svg>';
  const FLECHE_G = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 10H4M9 5l-5 5 5 5"/></svg>';
  const FENETRE = '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4.5" y="3" width="11" height="14" rx=".5"/><path d="M10 3v14M4.5 10h11M2.5 3v14M17.5 3v14"/></svg>';

  /* ---------- État ---------- */
  const state = { page: null, sub: null, objet: 'Commande', cuveeForm: L.CUVEES[0].id, envoye: false };
  const vus = new Set();
  try { (JSON.parse(localStorage.getItem('lejeune-vue-cavaliere-vus')) || []).forEach((v) => vus.add(v)); } catch (e) { /* stockage indisponible */ }
  const sauver = () => { try { localStorage.setItem('lejeune-vue-cavaliere-vus', JSON.stringify([...vus])); } catch (e) { /* rien */ } };

  const body = document.body;
  const visionneuse = $('#visionneuse');
  const carte = $('#carte');
  const lavis = $('#lavis');
  const carnet = $('#carnet');
  const page = $('#carnet-page');
  const trait = $('#carte-trait');

  carte.style.width = MAP_W + 'px';
  carte.style.height = MAP_H + 'px';
  trait.alt = 'Plan dessiné du domaine Lejeune vu d\'en haut et de biais : la maison et sa cour au centre, la petite annexe à gauche, les routes, les rangs de vigne tout autour, la forêt de la Montagne de Reims en haut.';

  // Le calque couleur suit la définition du calque trait (1600 sur mobile, 3200 sur bureau).
  function calquesSources() {
    const grand = !estMobile() && (trait.currentSrc || '').indexOf('1600') === -1;
    carte.style.setProperty('--trait', `url(${grand ? 'carte-trait.webp' : 'carte-trait-1600.webp'})`);
    carte.style.setProperty('--couleur', `url(${ILL}${grand ? 'carte-domaine.jpg' : 'carte-domaine-1600.jpg'})`);
  }
  trait.addEventListener('load', calquesSources);
  calquesSources();

  /* ---------- Repères, affichettes, étiquettes ---------- */
  function htmlRepere(l) {
    const n = l.attendus ? '' : (l.n || ICONE_PUNAISE);
    return `<button class="repere${l.attendus ? ' attendus' : ''}" type="button" data-go="${l.id}" data-cote="${l.cote}"
      style="left:${l.x * 100}%;top:${l.y * 100}%" aria-label="${esc((l.n ? l.n + '. ' : '') + (l.legende || l.nom))}">
      <span class="repere-n leg-n-carte">${n}</span>
      <span class="repere-t"><span class="repere-nom">${esc(l.nom)}</span><span class="repere-sous">${esc(l.sous)}</span>${l.note ? `<span class="repere-note">${esc(l.note)}</span>` : ''}</span>
    </button>`;
  }

  const AFFICHETTES = [
    { news: 'medaille', x: .615, y: .56, rot: '3deg', titre: "Médaille d'Or pour la Grande Réserve", tag: 'Paris, mars 2026', mot: "Médaille d'Or" },
    { news: 'recrutement', x: .355, y: .84, rot: '-4deg', titre: 'Vendangeurs, nous recrutons', tag: 'pour les vendanges 2026', mot: 'Vendangeurs' }
  ];
  if (L.enSaison()) AFFICHETTES.push({ news: 'rene-louis', x: .72, y: .29, rot: '-2deg', titre: 'La René Louis est de retour', tag: "d'octobre à décembre", mot: 'René Louis' });

  $('#reperes').innerHTML = [
    `<span class="etiquette etiquette-grande" style="left:33%;top:15.5%">forêt de la Montagne de Reims</span>`,
    `<span class="etiquette" style="left:70%;top:79%;transform:translate(-50%,-50%) rotate(41deg) scale(var(--inv))">avenue de Champagne</span>`,
    `<button class="vers" type="button" data-go="parcelles" style="left:95%;top:15%">
       <span><span class="vers-nom">vers Verzy</span><small>Grand Cru</small><small class="vers-note">direction à vérifier</small></span>
       <svg viewBox="0 0 46 46" aria-hidden="true"><path d="M8 38C16 30 22 20 36 10M24 9.5l12.5.5-1 12"/></svg></button>`,
    `<button class="vers" type="button" data-go="parcelles" style="left:95%;top:86%">
       <span><span class="vers-nom">vers Ambonnay</span><small>Grand Cru</small><small class="vers-note">direction à vérifier</small></span>
       <svg viewBox="0 0 46 46" aria-hidden="true"><path d="M8 8c8 8 14 18 28 28M35.5 24l1 12.5-12.5.5"/></svg></button>`,
    ...AFFICHETTES.map((a) => `<button class="affichette" type="button" data-go="kiosque/${a.news}" style="left:${a.x * 100}%;top:${a.y * 100}%;--rot:${a.rot}">
       <span class="affichette-titre">${esc(a.titre)}</span><span class="affichette-tag">${esc(a.tag)}</span><span class="affichette-mot" aria-hidden="true">${esc(a.mot)}</span></button>`),
    ...LIEUX.map(htmlRepere),
    `<button class="repere repere-fenetre" type="button" data-go="maison/fenetre" data-cote="gauche" style="left:64.6%;top:33%" hidden aria-label="Regarder par la fenêtre de la maison">
       <span class="repere-n">${FENETRE}</span><span class="repere-t"><span class="repere-nom">la fenêtre</span></span></button>`
  ].join('');
  $$('.repere-fenetre svg').forEach((s) => { s.style.cssText = 'width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.4'; });

  /* ---------- Légende ---------- */
  $('#cartouche-liste').innerHTML = ORDRE.map((id) => {
    const l = lieu(id);
    const n = l.n ? l.n : ICONE_PUNAISE;
    return `<li><button type="button" data-go="${id}" data-leg="${id}">
      <span class="leg-n">${n}</span>
      <span class="leg-t"><span class="leg-nom">${esc(l.legende || l.nom)}</span><span class="leg-sous">${esc(l.sous)}</span></span>
      <span class="leg-vu" aria-hidden="true"></span>
    </button></li>`;
  }).join('');

  /* ---------- Taches d'aquarelle ---------- */
  const taches = new Map();
  function tache(key, t, anime) {
    if (taches.has(key)) return taches.get(key);
    const R = t.r * MAP_W;
    const left = t.x * MAP_W - R, top = t.y * MAP_H - R;
    const el = document.createElement('div');
    el.className = 'tache';
    el.style.cssText = `left:${left}px;top:${top}px;width:${2 * R}px;height:${2 * R}px;--forme:url(tache-${t.forme}.png)`;
    const pos = `background-size:${MAP_W}px ${MAP_H}px;background-position:${-left}px ${-top}px`;
    el.innerHTML = `<i class="tache-encre" style="${pos}"></i><i class="tache-couleur" style="${pos}"></i>`;
    lavis.appendChild(el);
    taches.set(key, el);
    if (!anime || reduit.matches) {
      el.classList.add('is-fixe', 'is-trace', 'is-lavis');
    } else {
      void el.offsetWidth;
      requestAnimationFrame(() => {
        el.classList.add('is-trace');
        el.classList.add('is-lavis');
      });
    }
    return el;
  }
  function colorier(id, anime) {
    const l = lieu(id);
    if (!l) return;
    tache(id, l, anime);
    (l.autres || []).forEach((t, i) => setTimeout(() => tache(id + i, t, anime), anime ? 380 * (i + 1) : 0));
  }
  function marquerVu(id) {
    if (!lieu(id)) return;
    const neuf = !vus.has(id);
    vus.add(id); sauver();
    renduVus();
    return neuf;
  }
  function renduVus() {
    $$('.repere[data-go]').forEach((b) => b.classList.toggle('is-vu', vus.has(b.dataset.go)));
    $$('[data-leg]').forEach((b) => b.classList.toggle('is-vu', vus.has(b.dataset.leg)));
  }
  vus.forEach((id) => colorier(id, false));
  renduVus();

  // La forêt n'est pas une rubrique : elle prend sa couleur dès l'arrivée, et montre le geste de la carte.
  const FORET = [{ x: .24, y: .13, r: .21, forme: 2 }, { x: .58, y: .07, r: .15, forme: 3 }, { x: .82, y: .05, r: .1, forme: 1 }];
  function foret(anime) { FORET.forEach((t, i) => setTimeout(() => tache('foret' + i, t, anime), anime ? 420 * i : 0)); }
  function chargerCarte() { if (trait.loading === 'lazy') trait.loading = 'eager'; }
  if (!estMobile()) chargerCarte();

  /* ---------- Vue : pan / zoom ---------- */
  const vue = { x: 0, y: 0, k: 1 };
  let kMin = .3, kMax = 1.6, kAccueil = .6;
  const dims = () => ({ w: visionneuse.clientWidth, h: visionneuse.clientHeight });

  function bornes() {
    const { w, h } = dims();
    const cover = Math.max(w / MAP_W, h / MAP_H);
    const contain = Math.min(w / MAP_W, h / MAP_H);
    kMin = Math.max(contain * .98, cover * .62);
    kMax = Math.max(cover * 3, 1.45);
    kAccueil = estMobile() ? cover * .75 : Math.max(contain, cover * .9);
  }
  function borner(v) {
    const { w, h } = dims();
    v.k = Math.min(kMax, Math.max(kMin, v.k));
    const M = 90;
    const axe = (pos, taille, vu) => {
      const lo = Math.min(vu - taille, 0) - M;
      const hi = Math.max(vu - taille, 0) + M;
      return Math.min(hi, Math.max(lo, pos));
    };
    v.x = axe(v.x, MAP_W * v.k, w);
    v.y = axe(v.y, MAP_H * v.k, h);
    return v;
  }
  function appliquer(vol = false) {
    const vole = vol && !reduit.matches;
    const cible = `translate3d(${vue.x}px, ${vue.y}px, 0) scale(${vue.k})`;
    const inv = (1 / vue.k).toFixed(4);
    if (vole) {
      // Le masquage se calcule sur la position d'arrivée, avant le vol : juste dès la première image.
      const avant = carte.style.transform, invAvant = carte.style.getPropertyValue('--inv');
      carte.classList.remove('is-vol');
      carte.style.transform = cible; carte.style.setProperty('--inv', inv);
      eviter();
      carte.style.transform = avant; if (invAvant) carte.style.setProperty('--inv', invAvant);
      void carte.offsetWidth;
    }
    carte.classList.toggle('is-vol', vole);
    carte.style.transform = cible;
    carte.style.setProperty('--inv', inv);
    clearTimeout(eviterTimer); clearTimeout(eviterTimer2);
    if (!vole) eviter();
  }

  // Ce qui passerait sous le titre, la légende, le zoom ou le carnet est masqué, pas recouvert.
  let eviterTimer = 0;
  let eviterTimer2 = 0;
  function eviter() {
    const fixes = ['.titre', '#legende', '.carte-retour', '.barre-mobile']
      .map((sel) => $(sel)).filter((el) => el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none')
      .map((el) => el.getBoundingClientRect());
    if (state.page && !estMobile()) {
      const w0 = dims().w, lc = Math.min(600, w0 * .46);
      fixes.push({ left: w0 - 22 - lc, right: w0 - 22, top: 16, bottom: dims().h - 16 });
    }
    const marge = 6;
    const { w, h } = dims();
    if (!estMobile()) {
      const droite = state.page ? Math.min(600, w * .46) + 44 : 20;
      fixes.push({ left: w - droite - 44, right: w - droite, top: h - 20 - 148, bottom: h - 20 });
    } else if (body.classList.contains('is-carte')) {
      fixes.push({ left: w - 12 - 44, right: w - 12, top: h - 86 - 148, bottom: h - 86 });
    }
    $$('#reperes > *').forEach((el) => {
      if (el.hidden) return;
      if (el.classList.contains('is-actif')) { el.classList.remove('is-masque'); return; }
      el.classList.remove('is-masque');
      const r = el.getBoundingClientRect();
      const touche = fixes.some((f) => r.right > f.left - marge && r.left < f.right + marge && r.bottom > f.top - marge && r.top < f.bottom + marge);
      // Une affichette coupée par le bord de l'écran se retire aussi : on ne lit pas une demi-affiche.
      const coupee = (el.classList.contains('affichette') || estMobile()) && (r.left < 0 || r.top < 0 || r.right > w || r.bottom > h);
      el.classList.toggle('is-masque', touche || coupee);
    });
  }
  function zoneLibre() {
    // Ce que l'interface fixe laisse voir : entre la légende et le carnet, sous le titre.
    const { w, h } = dims();
    if (estMobile()) return { l: 0, r: w, t: 70, b: h - 80 };
    const leg = $('#legende').getBoundingClientRect();
    const r = state.page ? w - Math.min(600, w * .46) - 22 - 24 : w - 80;
    return { l: leg.right + 24, r, t: 84, b: h - 20 };
  }
  function regarder(fx, fy, k, vol = true, plein = false) {
    const { w, h } = dims();
    const z = plein ? { l: 0, r: w, t: 0, b: h } : zoneLibre();
    vue.k = k;
    vue.x = (z.l + z.r) / 2 - fx * MAP_W * k;
    vue.y = (z.t + z.b) / 2 - fy * MAP_H * k;
    borner(vue);
    appliquer(vol);
  }
  function accueil(vol = true) { if (estMobile()) regarder(.385, .5, kAccueil, vol, true); else regarder(.5, .47, kAccueil, vol, true); }
  function zoomer(f, cx, cy) {
    const { w, h } = dims();
    cx = cx == null ? w / 2 : cx; cy = cy == null ? h / 2 : cy;
    const k = Math.min(kMax, Math.max(kMin, vue.k * f));
    vue.x = cx - (cx - vue.x) * k / vue.k;
    vue.y = cy - (cy - vue.y) * k / vue.k;
    vue.k = k;
    borner(vue); appliquer(false);
  }

  // Glisser, pincer
  const pointeurs = new Map();
  let glisse = null;
  let aBouge = false;
  visionneuse.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (e.target.closest('.carte-retour')) return;
    pointeurs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    aBouge = false;
    glisse = { x: e.clientX, y: e.clientY, vx: vue.x, vy: vue.y, k: vue.k, d: 0 };
    if (pointeurs.size === 2) {
      const [a, b] = [...pointeurs.values()];
      glisse.d = Math.hypot(a.x - b.x, a.y - b.y);
      glisse.cx = (a.x + b.x) / 2; glisse.cy = (a.y + b.y) / 2;
    }
    carte.classList.remove('is-vol');
  });
  visionneuse.addEventListener('pointermove', (e) => {
    if (!glisse || !pointeurs.has(e.pointerId)) return;
    pointeurs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointeurs.size === 2 && glisse.d) {
      const [a, b] = [...pointeurs.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const k = Math.min(kMax, Math.max(kMin, glisse.k * d / glisse.d));
      const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
      vue.x = cx - (glisse.cx - glisse.vx) * k / glisse.k;
      vue.y = cy - (glisse.cy - glisse.vy) * k / glisse.k;
      vue.k = k; aBouge = true;
      borner(vue); appliquer(false);
      return;
    }
    const dx = e.clientX - glisse.x, dy = e.clientY - glisse.y;
    if (!aBouge && Math.hypot(dx, dy) < 5) return;
    if (!aBouge) { aBouge = true; visionneuse.classList.add('is-glisse'); try { visionneuse.setPointerCapture(e.pointerId); } catch (err) { /* rien */ } }
    vue.x = glisse.vx + dx; vue.y = glisse.vy + dy;
    borner(vue); appliquer(false);
  });
  const finGlisse = (e) => {
    pointeurs.delete(e.pointerId);
    if (pointeurs.size === 1) {
      const [p] = [...pointeurs.values()];
      glisse = { x: p.x, y: p.y, vx: vue.x, vy: vue.y, k: vue.k, d: 0 };
      return;
    }
    if (pointeurs.size === 0) { glisse = null; visionneuse.classList.remove('is-glisse'); }
  };
  visionneuse.addEventListener('pointerup', finGlisse);
  visionneuse.addEventListener('pointercancel', finGlisse);
  // Un glissé ne doit pas déclencher le clic du repère sous le doigt.
  visionneuse.addEventListener('click', (e) => { if (aBouge) { e.stopPropagation(); e.preventDefault(); aBouge = false; } }, true);
  visionneuse.addEventListener('wheel', (e) => {
    e.preventDefault();
    const r = visionneuse.getBoundingClientRect();
    const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    zoomer(Math.exp(-d * .0016), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  visionneuse.addEventListener('keydown', (e) => {
    if (e.target !== visionneuse) return;
    const pas = 90;
    const t = { ArrowLeft: [pas, 0], ArrowRight: [-pas, 0], ArrowUp: [0, pas], ArrowDown: [0, -pas] }[e.key];
    if (t) { e.preventDefault(); vue.x += t[0]; vue.y += t[1]; borner(vue); appliquer(false); }
    if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomer(1.25); }
    if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomer(.8); }
  });
  $$('[data-zoom]').forEach((b) => b.addEventListener('click', () => {
    const z = b.dataset.zoom;
    if (z === 'in') { carte.classList.add('is-vol'); zoomer(1.35); }
    else if (z === 'out') { carte.classList.add('is-vol'); zoomer(1 / 1.35); }
    else accueil(true);
  }));

  /* ---------- Pages du carnet ---------- */
  const evin = `<p class="evin">${esc(L.CONTACT.evin)}</p>`;
  const tirage = (nom, alt, legende, ratio = '4 / 5', rot = '-1.6deg') =>
    `<figure class="tirage" style="--ratio:${ratio};--rot:${rot}"><img src="${L.photo(nom)}" alt="${esc(alt)}"><figcaption>${legende}</figcaption></figure>`;
  const entete = (l, titre) => `<header class="p-entete"><span class="leg-n">${l.n || ICONE_PUNAISE}</span><h2 class="p-titre" tabindex="-1">${titre}</h2></header>`;

  function pied(id) {
    const i = ORDRE.indexOf(id);
    const prec = ORDRE[(i - 1 + ORDRE.length) % ORDRE.length];
    const suiv = ORDRE[(i + 1) % ORDRE.length];
    const nom = (x) => esc(lieu(x).legende || lieu(x).nom);
    return `<footer class="p-pied">
      <button class="lien" type="button" data-go="${prec}">${FLECHE_G}${nom(prec)}</button>
      <button class="lien" type="button" data-go="${suiv}">${nom(suiv)}${FLECHE}</button>
      ${evin}</footer>`;
  }

  const PAGES = {
    maison: () => {
      const M = L.MAISON;
      return `${entete(lieu('maison'), 'La maison')}
      <p class="p-chapo">Au 67, avenue de Champagne, à Villers-Marmery. ${esc(L.CONTACT.mention)} : nous cultivons nos vignes et faisons notre vin.</p>
      <p class="note-marge">à la plume</p>
      <p class="plume">${M.depuis}</p>
      <p class="plume-legende">${esc(M.fondateur)}, né en ${M.depuis} : la première des ${esc(M.generationsTexte)} générations de vignerons.</p>
      <p class="p-texte" style="margin-top:20px">${esc(M.textes.histoire)}</p>
      <div class="tirages">
        ${tirage('histoire-portrait-ancien-aieul', 'Une main tient une ancienne photographie en noir et blanc : le portrait d\'un aïeul en costume, devant le domaine.', 'Le portrait d\'un aïeul, tenu devant le domaine.', '3 / 4', '-2deg')}
        ${tirage('vendanges-trois-generations-enfant', 'Trois générations autour d\'une caisse de raisins dans les vignes ; un enfant porte un chapeau de paille.', 'Trois générations, aux vendanges.', '3 / 4')}
      </div>
      <section class="p-bloc">
        <h3 class="p-sous">Onze générations</h3>
        <p class="p-texte">${esc(M.textes.heritage)}</p>
        <p class="a-recueillir"><b>À recueillir auprès de la famille :</b> les prénoms et le rôle de chacun aujourd'hui, et quelques mots de leur part pour cette page.</p>
        <button class="lien lien-fenetre" type="button" data-go="maison/fenetre">${FENETRE}Regarder par la fenêtre de la maison</button>
      </section>
      ${pied('maison')}`;
    },

    pressoir: () => `${entete(lieu('pressoir'), 'Le pressoir')}
      <p class="p-chapo">Le raisin de nos vignes passe par le pressoir avant de descendre en cave.</p>
      <figure class="dessin"><img src="${ILL}pressoir.png" alt="Dessin à l'encre et à l'aquarelle : le vieux pressoir en bois vu de dessus, des mains serrent la barre de fer qui fait tourner la vis.">
        <figcaption>Le vieux pressoir, dessiné d'après nos photos.</figcaption></figure>
      <div class="p-bloc">
        ${tirage('histoire-pressoir-lejeune-1927', 'Photographie ancienne, sépia : des hommes en tablier dans un pressoir, devant de grands paniers d\'osier remplis de raisin.', 'Le pressoir Lejeune en 1927, photographie d\'archive de la famille.', '733 / 474', '1.2deg')}
      </div>
      <div class="tirages">
        ${tirage('pressoir-ancien-jus-detail', 'Détail du vieux pressoir en bois cerclé de fer, le jus s\'écoule dans la goulotte rouge.', 'Le jus s\'écoule du vieux pressoir.', '3 / 4')}
        ${tirage('pressoir-tri-raisins-noirs-equipe', 'L\'équipe trie des grappes de raisin noir sur une table, dans le pressoir.', 'Le tri du Pinot Noir, à l\'entrée du pressoir.', '4 / 3', '2deg')}
      </div>
      <section class="p-bloc">
        <h3 class="p-sous">Les vendanges</h3>
        <p class="p-texte">${esc(L.ACTUALITES.find((a) => a.id === 'recrutement').texte)}</p>
        <button class="lien" type="button" data-go="kiosque/recrutement">${FLECHE}Lire l'affichette du kiosque</button>
      </section>
      ${pied('pressoir')}`,

    cave: () => {
      // Les cinq galeries de la cave en coupe, une par cuvée (en % du dessin).
      const G = [[29, 41, 8.6, 25.5], [44.4, 41.5, 11.1, 24], [56.7, 41.5, 12.3, 24], [70.3, 44, 11.5, 28.7], [41.5, 69, 27.2, 18]];
      return `${entete(lieu('cave'), 'La cave')}
      <p class="p-chapo">Nos cinq cuvées vieillissent sur lattes, de trois à six ans selon la cuvée. Choisissez une galerie.</p>
      <div class="coupe">
        <img src="${ILL}cave-coupe.jpg" alt="Dessin en coupe : la maison et, dessous, ses galeries voûtées creusées dans la craie, où les bouteilles reposent en rangées.">
        ${L.CUVEES.map((c, i) => `<button class="galerie" type="button" data-go="cave/${c.id}" style="left:${G[i][0]}%;top:${G[i][1]}%;width:${G[i][2]}%;height:${G[i][3]}%" aria-label="${esc(c.name)}"><span>${esc(c.name)}</span></button>`).join('')}
      </div>
      <p class="coupe-note"><span class="marge">dessin d'intention</span>Dessin d'intention : la maison et la cave ne sont pas représentées fidèlement. Il sera repris d'après les lieux réels.</p>
      <ol class="rangees">
        ${L.CUVEES.map((c) => `<li><button type="button" data-go="cave/${c.id}"><span class="rangee-nom">${esc(c.name)}</span><span class="rangee-mots">${esc(c.mots.toLowerCase())}</span><span class="rangee-cru">${esc(c.cru)}</span></button></li>`).join('')}
      </ol>
      <button class="affichette affichette-page" type="button" data-go="cave/grande-reserve" style="--rot:2deg">
        <span class="affichette-titre">Médaille d'Or pour la Grande Réserve</span><span class="affichette-tag">Concours Général Agricole de Paris, mars 2026</span>
      </button>
      ${pied('cave')}`;
    },

    parcelles: () => {
      const M = L.MAISON;
      return `${entete(lieu('parcelles'), 'Les parcelles')}
      <p class="p-chapo">${esc(M.textes.vignoble)}</p>
      <div class="chiffres">
        <p class="chiffre"><b>${M.parcelles}</b><span>parcelles, ${esc(M.parcellesAres)}</span></p>
        <p class="chiffre"><b>2</b><span>cépages</span></p>
        <p class="chiffre"><b>3</b><span>communes</span></p>
      </div>
      <div class="cepages">
        <div class="cepage" style="--lavis:#C9C46F"><h4>Chardonnay</h4><p>Lavis doré, pour le raisin blanc.</p></div>
        <div class="cepage" style="--lavis:#8E5A78"><h4>Pinot Noir</h4><p>Lavis violine, pour le raisin noir.</p></div>
      </div>
      <p class="a-recueillir"><b>Plan des 35 parcelles à fournir par la famille.</b> Les vignes dessinées sur la carte sont un décor, pas un relevé : leurs emplacements réels y seront hachurés aux deux lavis.</p>
      <section class="p-bloc">
        <h3 class="p-sous">Trois communes</h3>
        <ul class="communes">${M.communes.map((c) => `<li><b>${esc(c.nom)}</b><i>${esc(c.caractere)}</i><span>${esc(c.cru)}</span></li>`).join('')}</ul>
        <div class="labels">${M.labels.map((l) => `<span title="${esc(l.nom)}">${esc(l.court === l.nom ? l.nom : l.court + ' · ' + l.nom)}</span>`).join('')}</div>
      </section>
      <div class="tirages">
        ${tirage('vignes-grappes-chardonnay-dorees', 'Grappes de chardonnay dorées au soleil, entre les feuilles.', 'Le Chardonnay, à maturité.', '3 / 4')}
        ${tirage('vignes-grappes-pinot-feuilles-automne', 'Grappes de pinot noir parmi des feuilles qui jaunissent.', 'Le Pinot Noir, à l\'automne.', '3 / 4')}
      </div>
      <div class="p-bloc">${tirage('vendanges-panier-raisins-blancs', 'Un panier rempli de raisins blancs posé entre les rangs.', 'Un panier de Chardonnay, entre les rangs.', '4 / 3', '1deg')}</div>
      ${pied('parcelles')}`;
    },

    venir: () => {
      const C = L.CONTACT;
      const tel = (t) => `<a href="tel:${t.replace(/\s/g, '')}">${esc(t)}</a>`;
      return `${entete(lieu('venir'), 'Venir au domaine')}
      <p class="adresse">${C.adresse.map(esc).join('<br>')}<em>${esc(L.MAISON.textes.prevenir)}</em></p>
      <p class="p-texte" style="margin-top:16px">${esc(L.MAISON.textes.accueil)}</p>
      <dl class="coord">
        <dt>Téléphone</dt><dd>${tel(C.tel)}</dd>
        <dt>Portable</dt><dd>${tel(C.portable)}</dd>
        <dt>Courriel</dt><dd><a href="mailto:${esc(C.email)}">${esc(C.email)}</a></dd>
        <dt>Instagram</dt><dd>${esc(C.instagram)}</dd>
      </dl>
      <p class="confirmer">Coordonnées reprises du site actuel, à confirmer par la famille.</p>
      <section class="p-bloc">
        <h3 class="p-sous">Points de retrait</h3>
        <ul class="retraits">${C.retraits.map((r) => `<li><b>${esc(r.lieu)}</b>${esc(r.detail)}</li>`).join('')}</ul>
        <p class="confirmer">D'après le site actuel, à confirmer.</p>
      </section>
      <section class="p-bloc" id="ecrire">
        <h3 class="p-sous">Nous écrire</h3>
        <div id="form-zone"></div>
      </section>
      ${pied('venir')}`;
    },

    kiosque: () => `${entete(lieu('kiosque'), 'Le kiosque')}
      <p class="p-chapo">Les nouvelles du domaine, rassemblées au kiosque. Chacune est aussi punaisée sur la carte, à l'endroit qu'elle concerne.</p>
      <p class="confirmer">Le kiosque aux nouvelles est un repère de lecture posé sur la carte, pas un lieu du domaine.</p>
      <div class="kiosque">
        ${L.ACTUALITES.map((a, i) => {
          const ou = a.cuvee === 'grande-reserve' ? 'cave/grande-reserve' : a.lieu === 'vendanges' ? 'parcelles' : a.cuvee === 'rene-louis' ? 'kiosque' : 'maison';
          return `<article class="affichette" id="news-${a.id}" style="--rot:${['-2deg', '1.6deg', '1deg', '-1.4deg'][i % 4]}">
            <h3 class="affichette-titre">${esc(a.titre)}</h3>
            <span class="affichette-tag">${esc(a.date)} · ${esc(a.tag.toLowerCase())}${a.aConfirmer ? ' · à confirmer' : ''}</span>
            <p>${esc(a.texte)}</p>
            ${ou !== 'kiosque' ? `<button class="lien" type="button" data-go="${ou}">${FLECHE}Voir sur la carte</button>` : ''}
          </article>`;
        }).join('')}
      </div>
      ${pied('kiosque')}`
  };

  // Annotations à l'encre dans la marge : assemblage et vieillissement de la fiche ; pour le Rosé, le vin rouge d'Ambonnay.
  const NOTE_ETIQUETTE = {
    'brut-reserve': 'assemblage : le site actuel dit 85 % Chardonnay, 15 % Pinot Noir',
    'grande-reserve': 'étiquette : Blanc de Blancs · Premier Cru',
    millesime: 'étiquette 2016 : visuel provisoire'
  };
  function margeTechnique(c) {
    const fait = (k) => (c.facts.find(([x]) => x === k) || [])[1];
    const notes = [];
    if (c.aConfirmer && NOTE_ETIQUETTE[c.id]) {
      notes.push(`<p class="marge marge-etiquette" style="top:250px">${esc(NOTE_ETIQUETTE[c.id])}<b>${c.id === 'millesime' ? 'photo du 2019 à fournir' : 'à confirmer par la famille'}</b></p>`);
    }
    if (fait('Assemblage')) notes.push(`<p class="marge" style="top:24px"><b>Assemblage</b>${esc(fait('Assemblage'))}</p>`);
    if (fait('Vieillissement')) notes.push(`<p class="marge" style="top:132px"><b>Vieillissement</b>${esc(fait('Vieillissement'))}</p>`);
    if (c.id === 'rose') {
      notes.push(`<p class="marge marge-etiquette" style="top:238px">le site actuel dit 55 % Pinot Noir, 35 % Chardonnay et 10 % de vin rouge d'Ambonnay, pour la robe<b>à confirmer par la famille</b></p>`);
    }
    return notes.join('');
  }

  function fiche(id) {
    const i = L.CUVEES.findIndex((c) => c.id === id);
    const c = L.CUVEES[i];
    const suiv = L.CUVEES[(i + 1) % L.CUVEES.length];
    const teintes = { 'brut-reserve': '#B8963F', 'demi-sec': '#C99236', rose: '#D4806E', 'grande-reserve': '#C2AA5E', millesime: '#A86F33' };
    const fl = (n) => `<svg viewBox="0 0 70 40" aria-hidden="true"><path d="M2 6C24 4 44 12 62 30M54 30.5l8 .5-1-8"/></svg>`;
    return `<header class="p-entete"><span class="leg-n">3</span><h2 class="p-titre" tabindex="-1"><span class="aide">La cave : </span>${esc(c.name)}</h2></header>
      <div class="fiche-scene" style="--teinte:${teintes[c.id]}">
        ${margeTechnique(c)}
        <span class="fiche-lavis"></span>
        <img class="fiche-feuille" src="${ILL}feuille-${c.id}.png" alt="">
        <img class="fiche-bouteille" src="${c.bouteille}" alt="Bouteille de ${esc(c.name)}">
        <img class="fiche-grappe" src="${ILL}grappe-${c.id}.png" alt="">
        ${c.tasting.map(([k, v], j) => `<p class="annot annot-${j + 1}"><b>${esc(k)}</b>${esc(v)}${fl(j)}</p>`).join('')}
      </div>
      <p class="fiche-cru">${esc(c.cru)} · ${esc(c.mots.toLowerCase())}</p>
      <p class="p-texte" style="margin-top:14px">${esc(c.desc)}</p>
      <dl class="faits">${c.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><span class="points" aria-hidden="true"></span><dd>${esc(v)}</dd></div>`).join('')}</dl>
      ${c.aConfirmer ? `<p class="a-confirmer"><span class="marge">à confirmer par la famille</span>${esc(c.aConfirmer)}</p>` : ''}
      <p class="accords"><b>Accords</b>${esc(c.accords)}</p>
      ${c.distinction ? `<div class="affichette affichette-page" style="--rot:2deg"><span class="affichette-titre">${esc(c.distinction.split(',')[0])}</span><span class="affichette-tag">${esc(c.distinction.split(',').slice(1).join(',').trim())}, mars 2026</span></div>` : ''}
      <div class="fiche-actions">
        <button class="bouton bouton-pinot" type="button" data-go="venir/${c.id}">Commander cette cuvée</button>
        <button class="lien" type="button" data-go="cave/${suiv.id}">${esc(suiv.name)}${FLECHE}</button>
      </div>
      <footer class="p-pied">
        <button class="lien" type="button" data-go="cave">${FLECHE_G}Retour à la cave</button>
        ${evin}
      </footer>`;
  }

  /* ---------- Formulaire ---------- */
  function rendreFormulaire() {
    const zone = $('#form-zone');
    if (!zone) return;
    const C = L.CONTACT;
    if (state.envoye) {
      zone.innerHTML = `<div class="merci" tabindex="-1"><h3>${esc(C.merci[0])}</h3><p>${esc(C.merci[1])}</p></div>`;
      return;
    }
    const cercle = '<svg viewBox="0 0 100 44" preserveAspectRatio="none" aria-hidden="true"><path d="M8 26C6 12 30 4 54 5c22 1 40 6 39 18-1 13-24 18-48 17C22 39 6 33 9 20 11 12 22 8 34 7"/></svg>';
    zone.innerHTML = `<form class="form" novalidate>
      <fieldset class="objets"><legend>Votre demande</legend>
        ${C.objets.map((o) => `<label class="objet"><input type="radio" name="objet" value="${esc(o)}"${o === state.objet ? ' checked' : ''}><span>${esc(o)}${cercle}</span></label>`).join('')}
      </fieldset>
      <label class="champ" id="champ-cuvee"${state.objet === 'Commande' ? '' : ' hidden'}><span>Cuvée souhaitée</span>
        <select name="cuvee">${L.CUVEES.map((c) => `<option value="${c.id}"${c.id === state.cuveeForm ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
      <label class="champ"><span>Nom</span><input name="nom" autocomplete="name" required></label>
      <label class="champ"><span>Courriel</span><input name="email" type="email" autocomplete="email" required></label>
      <label class="champ"><span>Message</span><textarea name="message" placeholder="${esc(C.placeholders[state.objet])}"></textarea></label>
      <button class="bouton bouton-pinot" type="submit">Envoyer
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5"/></svg></button>
    </form>`;
    const form = $('form', zone);
    form.addEventListener('change', (e) => {
      if (e.target.name === 'objet') {
        state.objet = e.target.value;
        $('#champ-cuvee', zone).hidden = state.objet !== 'Commande';
        $('textarea', zone).placeholder = C.placeholders[state.objet];
      }
      if (e.target.name === 'cuvee') state.cuveeForm = e.target.value;
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      state.envoye = true; // aucun envoi pour l'instant
      rendreFormulaire();
      $('.merci', zone).focus();
    });
  }

  /* ---------- Ouvrir / fermer ---------- */
  let cleRendue = null;
  let poseTimer = 0;

  function ouvrir(id, sub, depuisClic) {
    const l = lieu(id);
    if (!l) return fermer();
    const cle = id === 'cave' && sub ? 'cave/' + sub : id;
    const changePage = state.page !== id || (id === 'cave' && state.sub !== sub);
    const premier = !state.page;
    state.page = id; state.sub = sub;
    if (id === 'venir' && sub && L.CUVEES.some((c) => c.id === sub)) { state.objet = 'Commande'; state.cuveeForm = sub; state.envoye = false; }

    if (cleRendue !== cle || (id === 'venir' && sub)) {
      page.innerHTML = (id === 'cave' && sub && L.CUVEES.some((c) => c.id === sub)) ? fiche(sub) : PAGES[id]();
      cleRendue = cle;
      page.scrollTop = 0;
      page.classList.remove('is-change'); void page.offsetWidth; page.classList.add('is-change');
      if (id === 'venir') rendreFormulaire();
    }
    if (id === 'kiosque' && sub) {
      const cible = $('#news-' + sub, page);
      $$('.affichette.is-cible', page).forEach((a) => a.classList.remove('is-cible'));
      if (cible) { cible.classList.add('is-cible'); requestAnimationFrame(() => cible.scrollIntoView({ block: 'center', behavior: reduit.matches ? 'auto' : 'smooth' })); }
    }
    if (id === 'venir' && sub && L.CUVEES.some((c) => c.id === sub)) requestAnimationFrame(() => $('#ecrire', page) && $('#ecrire', page).scrollIntoView({ block: 'start' }));

    body.classList.add('is-carnet');
    carnet.hidden = false;
    clearTimeout(poseTimer);
    $$('[data-leg]').forEach((b) => { if (b.dataset.leg === id) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    $$('.repere[data-go]').forEach((b) => b.classList.toggle('is-actif', b.dataset.go === id));
    $('.repere-fenetre').hidden = id !== 'maison';

    const neuf = marquerVu(id);
    if (!estMobile() || body.classList.contains('is-carte')) {
      const f = l.vue ? l.vue.f : (id === 'parcelles' ? 1.05 : 1.55);
      const k = Math.max((estMobile() ? kAccueil * 1.4 : kAccueil) * f, kMin);
      regarder(l.vue ? l.vue.x : l.x, l.y, Math.min(k, kMax), true);
      // Le trait se retrace puis l'aquarelle se diffuse, une fois la vue arrivée.
      if (neuf) setTimeout(() => colorier(id, true), reduit.matches ? 0 : (premier ? 700 : 450));
    } else if (neuf) {
      colorier(id, false);
    }
    const delai = (premier && !estMobile() && !reduit.matches) ? 380 : 0;
    poseTimer = setTimeout(() => {
      requestAnimationFrame(() => carnet.classList.add('is-pose'));
      if (depuisClic) setTimeout(() => { const h = $('.p-titre', page); if (h) h.focus({ preventScroll: true }); }, 60);
    }, delai);
    if (state.sub === 'fenetre' && id === 'maison') ouvrirFenetre(); else fermerFenetre(true);
    if (changePage && estMobile()) body.classList.remove('is-tiroir');
  }

  function fermer() {
    state.page = null; state.sub = null;
    setTimeout(eviter, 60);
    carnet.classList.remove('is-pose');
    body.classList.remove('is-carnet');
    clearTimeout(poseTimer);
    poseTimer = setTimeout(() => { if (!state.page) carnet.hidden = true; }, reduit.matches ? 0 : 450);
    $$('.repere[data-go]').forEach((b) => b.classList.remove('is-actif'));
    $$('[data-leg]').forEach((b) => b.removeAttribute('aria-current'));
    $('.repere-fenetre').hidden = true;
    fermerFenetre(true);
  }

  const fenetre = $('#fenetre');
  function ouvrirFenetre() {
    fenetre.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => fenetre.classList.add('is-ouverte')));
    setTimeout(() => $('.fenetre-fermer').focus({ preventScroll: true }), 50);
  }
  function fermerFenetre(silence) {
    if (fenetre.hidden) return;
    fenetre.classList.remove('is-ouverte');
    setTimeout(() => { if (!fenetre.classList.contains('is-ouverte')) fenetre.hidden = true; }, reduit.matches ? 0 : 400);
    if (!silence) aller('maison');
  }

  /* ---------- Routeur (hash) ---------- */
  function aller(cible) {
    if (cible) {
      if (location.hash === '#' + cible) route(); else location.hash = cible;
    } else {
      if (location.hash) history.pushState(null, '', location.pathname + location.search);
      route();
    }
  }
  let depuisClic = false;
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    const [id, sub] = h.split('/');
    body.classList.toggle('is-carte', estMobile() && (id === 'carte' || (body.classList.contains('is-carte') && !!lieu(id))));
    if (id === 'carte') { fermer(); if (estMobile()) { chargerCarte(); bornes(); accueil(false); foret(false); } }
    else if (id === 'legende') { fermer(); if (estMobile()) ouvrirTiroir(true, true); else focusDoux($('.cartouche-liste button')); }
    else if (lieu(id)) ouvrir(id, sub || null, depuisClic);
    else fermer();
    depuisClic = false;
  }
  window.addEventListener('hashchange', route);

  /* ---------- Clics ---------- */
  document.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (go) {
      e.preventDefault();
      depuisClic = true;
      const cible = go.dataset.go;
      if (estMobile() && go.closest('.cartouche')) body.classList.remove('is-tiroir');
      if (location.hash === '#' + cible) route(); else location.hash = cible;
      return;
    }
    const act = e.target.closest('[data-action]');
    if (!act) return;
    const a = act.dataset.action;
    if (a === 'fermer') {
      if (estMobile() && body.classList.contains('is-carte')) location.hash = 'carte';
      else aller('');
    }
    if (a === 'accueil') { aller(''); accueil(true); if (estMobile()) { body.classList.remove('is-carte'); window.scrollTo({ top: 0, behavior: 'smooth' }); } }
    if (a === 'fermer-fenetre') aller('maison');
    if (a === 'tiroir') { parClavier = e.detail === 0; ouvrirTiroir(!body.classList.contains('is-tiroir')); parClavier = false; }
    if (a === 'ouvrir-carte') { body.classList.remove('is-tiroir'); location.hash = 'carte'; }
    if (a === 'fermer-carte') { body.classList.remove('is-carte'); aller(''); }
  });

  let parClavier = false;
  function focusDoux(el) {
    // Focus déplacé par le programme (ancre #legende) : pas d'anneau tant qu'on n'utilise pas le clavier.
    if (!el) return;
    el.setAttribute('data-focus-doux', '');
    el.focus({ preventScroll: true });
    const fin = () => { el.removeAttribute('data-focus-doux'); el.removeEventListener('blur', fin); document.removeEventListener('keydown', fin); };
    el.addEventListener('blur', fin); document.addEventListener('keydown', fin);
  }
  function ouvrirTiroir(on, depuisAncre) {
    body.classList.toggle('is-tiroir', on);
    $('.barre-legende').setAttribute('aria-expanded', String(on));
    const b = $('.cartouche-liste button');
    if (on && parClavier) setTimeout(() => b && b.focus({ preventScroll: true }), 80);
    else if (on && depuisAncre) setTimeout(() => focusDoux(b), 80);
  }

  // Langue : la traduction n'existe pas encore.
  let toastTimer = 0;
  $$('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    const toast = $('#toast');
    if (b.dataset.lang === 'en') {
      toast.textContent = L.CONTACT.langueNote;
      toast.classList.add('is-on');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('is-on'), 3200);
    } else toast.classList.remove('is-on');
  }));

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!fenetre.hidden) { aller('maison'); return; }
    if (body.classList.contains('is-tiroir')) { ouvrirTiroir(false); $('.barre-legende').focus(); return; }
    if (state.page) {
      const retour = state.page === 'cave' && state.sub ? 'cave' : (estMobile() && body.classList.contains('is-carte') ? 'carte' : '');
      aller(retour);
      return;
    }
    if (body.classList.contains('is-carte')) { body.classList.remove('is-carte'); aller(''); }
  });

  /* ---------- Mobile : l'itinéraire ---------- */
  function vignette(x, y, z) {
    // Recadre la carte en couleur autour de (x, y) ; z = part de la largeur de carte visible.
    const taille = 100 / z;
    const borne = (v) => Math.max(0, Math.min(100, v));
    const px = borne((0.5 - x * taille / 100) / (1 - taille / 100) * 100);
    const ratioH = (MAP_H / MAP_W) * taille; // hauteur de l'image en % de la largeur du cadre (cadre carré)
    const py = borne((0.5 - y * ratioH / 100) / (1 - ratioH / 100) * 100);
    return `background-image:url(${ILL}carte-domaine-1600.jpg);background-size:${taille}% auto;background-position:${px}% ${py}%`;
  }
  const chemin = (sens) => `<svg class="chemin" viewBox="0 0 100 110" preserveAspectRatio="none" aria-hidden="true"><path d="${sens ? 'M22 0C22 40 78 46 78 110' : 'M78 0C78 40 22 46 22 110'}"/></svg>`;
  const ETAPES = [
    { id: 'foret', titre: 'La forêt', texte: 'Au-dessus des vignes, la forêt de la Montagne de Reims. Le chemin descend vers le domaine.', x: .3, y: .12, z: .26, forme: 2 },
    { id: 'parcelles', texte: L.MAISON.textes.vignoble, z: .42 },
    { id: 'kiosque', texte: 'Le kiosque rassemble les nouvelles du domaine : médaille, vendanges, cuvée de saison. C\'est un repère de lecture posé sur la carte, pas un lieu du domaine.', z: .26 },
    { id: 'maison', texte: L.MAISON.textes.histoire, z: .3 },
    { id: 'pressoir', texte: 'Le vieux pressoir de bois, et la photographie du pressoir Lejeune en 1927.', z: .26 },
    { id: 'cave', texte: 'Dans la cave, nos cinq cuvées vieillissent sur lattes, de trois à six ans.', z: .26 },
    { id: 'venir', texte: `${L.CONTACT.adresse.join(', ')}. ${L.MAISON.textes.prevenir}`, z: .24 }
  ];
  function rendreItineraire() {
    const it = $('#itineraire');
    it.innerHTML = `<section class="it-intro">
        <h1 class="p-titre">Le domaine, de la forêt jusqu'à la cave</h1>
        <p class="p-chapo">Champagne Lejeune Père &amp; Fils, ${esc(L.CONTACT.mention.toLowerCase())} à Villers-Marmery depuis 1684. Suivez le chemin, ou ouvrez la carte entière.</p>
        <button class="bouton bouton-trait" type="button" data-action="ouvrir-carte">
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2.5 5.5 7.5 3.5l5 2 5-2v11l-5 2-5-2-5 2z M7.5 3.5v11 M12.5 5.5v11"/></svg>Voir toute la carte</button>
      </section>` +
      ETAPES.map((et, i) => {
        const l = lieu(et.id) || {};
        const x = et.x != null ? et.x : l.x, y = et.y != null ? et.y : l.y;
        const forme = et.forme || l.forme || 1;
        const titre = et.titre || l.legende || l.nom;
        const num = l.n ? `<span class="leg-n">${l.n}</span>` : (l.id ? `<span class="leg-n">${ICONE_PUNAISE}</span>` : '');
        return `${chemin(i % 2 === 0)}<section class="etape">
          <div class="etape-vue" style="--forme:url(tache-${forme}.png);${vignette(x, y, et.z)}" role="img" aria-label="Détail de la carte dessinée : ${esc(titre)}"></div>
          <div class="etape-tete">${num}<h2>${esc(titre.charAt(0).toUpperCase() + titre.slice(1))}</h2></div>
          <p>${esc(et.texte)}</p>
          ${l.id ? `<button class="lien" type="button" data-go="${l.id}">${FLECHE}${l.id === 'venir' ? 'Préparer votre venue' : 'Ouvrir la page du carnet'}</button>` : ''}
        </section>`;
      }).join('') +
      `<p class="evin it-fin">${esc(L.CONTACT.evin)}</p>`;
  }
  rendreItineraire();
  $$('.repere-n svg').forEach((s) => { s.style.cssText = 'width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.5'; });

  /* ---------- Démarrage ---------- */
  function mesurer() { bornes(); if (!state.page) accueil(false); else { const l = lieu(state.page); regarder(l.x, l.y, vue.k, false); } }
  window.addEventListener('resize', () => { bornes(); if (!state.page) accueil(false); else { borner(vue); appliquer(false); } });
  carnet.addEventListener('transitionend', (e) => { if (e.target.classList.contains('carnet-feuille')) eviter(); });
  carte.addEventListener('transitionend', (e) => { if (e.target === carte) eviter(); });
  mobileQ.addEventListener('change', () => { body.classList.remove('is-tiroir', 'is-carte'); mesurer(); calquesSources(); });
  mesurer();
  route();
  const premiereFois = vus.size === 0;
  if (!estMobile()) setTimeout(() => foret(premiereFois && !reduit.matches), premiereFois ? 650 : 0);
})();
