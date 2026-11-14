'use strict';
/* Le Nuancier — tout le site tient dans une rangée de colonnes de couleur.
   Une colonne ouverte = une page ; les autres restent en bandes pour y passer.
   État unique `state`, rendu par `render()`, adresses par le hash (#rose, #venir/rose…). */
(() => {
  const L = window.LEJEUNE;
  const { CUVEES, MAISON, CONTACT, ACTUALITES } = L;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 900px)');

  /* ---------- Le nuancier : teintes et colonnes ---------- */

  // Teintes de concepts.md §4 ; or doux et miel légèrement écartés pour qu'ils se distinguent côte à côte.
  const TEINTES = {
    'brut-reserve': ['#E4D3A6', 'or doux'],
    'demi-sec': ['#EAC283', 'miel'],
    'rose': ['#F0CFC2', 'saumon'],
    'grande-reserve': ['#EFE6C8', 'paille'],
    'millesime': ['#D9B07A', 'ambre']
  };
  const COURT = { 'brut-reserve': 'Brut Réserve', 'demi-sec': 'Demi-Sec', 'rose': 'Rosé', 'grande-reserve': 'Grande Réserve', 'millesime': 'Millésime' };
  const RL = L.enSaison() ? L.RENE_LOUIS : null;

  const COLS = [
    { id: 'la-maison', kind: 'maison', court: 'La maison', tint: '#ECEAE3', teinte: 'craie' },
    ...CUVEES.map((c) => ({ id: c.id, kind: 'cuvee', court: COURT[c.id] || c.name, tint: TEINTES[c.id][0], teinte: TEINTES[c.id][1], c })),
    ...(RL ? [{ id: 'rene-louis', kind: 'rene', court: 'René Louis', tint: '#CF9C86', teinte: 'cuivre' }] : []),
    { id: 'venir', kind: 'venir', court: 'Venir', tint: '#2C353D', teinte: 'ardoise' }
  ];
  const byId = Object.fromEntries(COLS.map((c) => [c.id, c]));
  const news = (id) => ACTUALITES.find((n) => n.id === id);

  // Les actualités se posent en pastilles sur la bande qu'elles concernent.
  const PASTILLES = {
    'grande-reserve': { l1: "Médaille d'Or", l2: 'Paris 2026', pop: "MÉDAILLE D'OR", label: news('medaille').titre + ', ' + news('medaille').date },
    'venir': { l1: 'On recrute', l2: 'vendanges', pop: 'ON RECRUTE', label: news('recrutement').titre, href: '#venir/vendanges' },
    'rene-louis': { l1: 'De saison', l2: 'oct.–déc.', pop: 'DE SAISON', label: 'La René Louis, d’octobre à décembre' }
  };

  const ICON = {
    close: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    next: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11.5M11 5.5 15.5 10 11 14.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    prev: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M16 10H4.5M9 5.5 4.5 10 9 14.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    pin: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 18s5.5-5.2 5.5-9.6A5.5 5.5 0 0 0 4.5 8.4C4.5 12.8 10 18 10 18z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="10" cy="8.4" r="2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
  };

  const state = { open: null, objet: 'Commande', formCuvee: CUVEES[0].id, sent: false };

  /* ---------- Construction ---------- */

  const langHTML = () => `
    <div class="lang" role="group" aria-label="Langue">
      <button type="button" class="lang-b" data-action="lang" data-lang="fr" aria-pressed="true">FR</button>
      <button type="button" class="lang-b" data-action="lang" data-lang="en" aria-pressed="false">EN</button>
    </div>`;

  const headHTML = (col) => `
    <div class="page-head">
      <a class="page-brand" href="#" data-action="overview">Lejeune <span>Père &amp; Fils</span></a>
      <div class="page-tools">
        ${langHTML()}
        <button type="button" class="round" data-action="overview" aria-label="Fermer ${esc(col.court)} et revenir au nuancier">${ICON.close}</button>
      </div>
    </div>`;

  const neighbours = (col) => {
    const i = COLS.indexOf(col);
    const p = COLS[(i - 1 + COLS.length) % COLS.length];
    const n = COLS[(i + 1) % COLS.length];
    return `
      <nav class="voisins stg" style="--d:.5s" aria-label="Colonnes voisines">
        <a href="#${p.id}" class="voisin" style="--sw:${p.tint}">${ICON.prev}<span><small>Précédente</small>${esc(p.court)}</span></a>
        <a href="#${n.id}" class="voisin voisin--n" style="--sw:${n.tint}"><span><small>Suivante</small>${esc(n.court)}</span>${ICON.next}</a>
      </nav>`;
  };

  const evinHTML = (cls = '') => `<p class="evin ${cls}">${esc(CONTACT.evin)}</p>`;

  function pastilleHTML(col) {
    const p = PASTILLES[col.id];
    if (!p) return '';
    const href = p.href || '#' + col.id;
    return `<a class="pastille" href="${href}" aria-label="${esc(p.label)}"><span class="pastille-t"><b>${esc(p.l1)}</b>${esc(p.l2)}</span><span class="pastille-pop" aria-hidden="true">${esc(p.pop)}</span></a>`;
  }

  // 9. Le nom de la teinte, comme sous une pastille de nuancier de peintre.
  const teinteHTML = (col) => `<span class="face-teinte" aria-hidden="true">${esc(col.teinte)}</span>`;

  function faceHTML(col) {
    if (col.kind === 'maison') {
      return `
        <span class="face face--maison">
          <span class="v-pair"><span class="v-brand">Lejeune</span><span class="v-entry">La maison</span></span>
          <span class="v-sub">Père &amp; Fils · depuis ${MAISON.depuis}</span>
          <span class="h-brand"><span><b>Lejeune</b> Père &amp; Fils</span><small>La maison · propriétaires-récoltants depuis&nbsp;${MAISON.depuis}</small></span>
          ${teinteHTML(col)}
        </span>`;
    }
    if (col.kind === 'venir') {
      return `
        <span class="face face--venir">
          <span class="v-brand">Venir</span>
          <span class="v-sub">${esc(CONTACT.adresse[0])} · Villers-Marmery</span>
          <span class="h-brand"><span><b>Venir au domaine</b></span><small>${esc(CONTACT.adresse.join(', '))}</small><small class="evin-m">${esc(CONTACT.evin)}</small></span>
          <span class="face-icon">${ICON.pin}</span>
          ${teinteHTML(col)}
        </span>`;
    }
    if (col.kind === 'rene') {
      return `
        <span class="face">
          <span class="face-top"><span class="face-name">René Louis</span><span class="face-cru">Cuvée de saison</span></span>
          <span class="face-mots">Hommage aux grands-pères</span>
          ${teinteHTML(col)}
        </span>`;
    }
    const c = col.c;
    return `
      <span class="face">
        <span class="face-top"><span class="face-name">${esc(COURT[c.id])}</span><span class="face-cru">${esc(c.cru)}</span>${c.id === 'millesime' ? '<span class="face-note">Étiquette 2016, visuel provisoire</span>' : ''}</span>
        <span class="face-mots">${esc(c.mots)}</span>
        ${teinteHTML(col)}
      </span>`;
  }

  function stageHTML(col) {
    if (col.kind === 'cuvee') {
      const c = col.c;
      return `
        <div class="stage" aria-hidden="true">
          <div class="halo"><div class="fx-slot"></div></div>
          ${c.id === 'grande-reserve' ? '<span class="pop-word"><span>Médaille</span><span>d’Or</span></span><span class="pop-or">OR</span>' : ''}
          <img class="bottle" src="${c.bouteille}" alt="">
        </div>`;
    }
    if (col.kind === 'rene') {
      return `
        <div class="stage stage--photo" aria-hidden="true">
          <div class="halo"><div class="fx-slot"></div></div>
          <img class="print" src="${RL.photo}" alt="">
        </div>`;
    }
    return '';
  }

  // Photos en situation (concepts.md §4), posées comme des tirages sous la fiche.
  const SITU = {
    'rose': [['bouteilles-rose-en-main', 'Une bouteille de Brut Rosé tenue à la main, sur un fond de verdure.', 'En main, au jardin.'],
      ['degustation-verre-rose-grave', 'Un verre de rosé gravé « Champagne Lejeune, Villers-Marmery », tenu à la main.', 'Le verre gravé de la maison.']],
    'grande-reserve': [['degustation-grande-reserve-plateau-argent', 'La Grande Réserve et des coupes posées sur un plateau d\u2019argent.', 'Sur le plateau d\u2019argent.']]
  };
  const tiragesHTML = (c) => (SITU[c.id] ? `
        <div class="tirages">
          ${SITU[c.id].map(([n, alt, cap], i) => `
          <figure class="tirage" style="--r:${i % 2 ? 2.2 : -1.8}deg">
            <img src="${L.photo(n)}" alt="${esc(alt)}" loading="lazy" decoding="async">
            <figcaption>${esc(cap)}</figcaption>
          </figure>`).join('')}
        </div>` : '');

  function cuveePage(col) {
    const c = col.c;
    const d = c.distinction ? `<p class="distinction stg" style="--d:.16s"><span class="dot" aria-hidden="true"></span>${esc(c.distinction)}</p>` : '';
    return `
      <div class="page" id="p-${col.id}" role="region" aria-labelledby="h-${col.id}" inert>
        ${headHTML(col)}
        <div class="cuvee-grid">
          <div class="sheet-spacer" aria-hidden="true"></div>
          <div class="cuvee-text">
            <h2 class="cuvee-name stg" id="h-${col.id}" tabindex="-1">${esc(c.name)}</h2>
            <p class="cuvee-mots stg" style="--d:.06s">${esc(c.mots)}</p>
            <p class="cuvee-cru stg" style="--d:.1s">${esc(c.cru)} · teinte ${esc(col.teinte)}</p>
            ${d}
            <p class="cuvee-desc stg" style="--d:.2s">${esc(c.desc)}</p>
            ${c.aConfirmer ? `<p class="a-confirmer stg" style="--d:.24s">${esc(c.aConfirmer)}</p>` : ''}
            <div class="cta-row stg" style="--d:.28s">
              <a class="btn" href="#venir/${c.id}">Commander cette cuvée</a>
              <a class="link" href="#venir/visite">Venir la déguster</a>
            </div>
          </div>
          <div class="cuvee-mid">${c.id === 'millesime' ? '<p class="bottle-note">Étiquette 2016, visuel provisoire</p>' : ''}</div>
          <div class="cuvee-fiche">
            <h3 class="fiche-h stg" style="--d:.2s">Fiche technique</h3>
            <dl class="filets stg" style="--d:.26s">
              ${c.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
            </dl>
            <h3 class="fiche-h stg" style="--d:.32s">Dégustation</h3>
            <dl class="filets filets--deg stg" style="--d:.38s">
              ${c.tasting.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
            </dl>
            <h3 class="fiche-h stg" style="--d:.44s">À table</h3>
            <p class="accords stg" style="--d:.48s">${esc(c.accords)}</p>
          </div>
        </div>
        ${tiragesHTML(c)}
        <div class="page-foot">${neighbours(col)}${evinHTML()}</div>
      </div>`;
  }

  function renePage(col) {
    return `
      <div class="page" id="p-${col.id}" role="region" aria-labelledby="h-${col.id}" inert>
        ${headHTML(col)}
        <div class="cuvee-grid">
          <div class="sheet-spacer" aria-hidden="true"></div>
          <div class="cuvee-text">
            <h2 class="cuvee-name stg" id="h-${col.id}" tabindex="-1">René Louis</h2>
            <p class="cuvee-mots stg" style="--d:.06s">D'octobre à décembre</p>
            <p class="cuvee-desc stg" style="--d:.14s">${esc(RL.short)}</p>
            <p class="a-confirmer stg" style="--d:.2s">D'après le site actuel de la maison, à confirmer par la famille. <span class="note-cuivre">La couleur de cette colonne, cuivre, reprend celle de son étiquette.</span></p>
            <div class="cta-row stg" style="--d:.28s">
              <a class="btn" href="#venir/rene-louis">Réserver la René Louis</a>
            </div>
          </div>
          <div class="cuvee-mid" aria-hidden="true"></div>
          <div class="cuvee-fiche">
            <figure class="rl-salon stg" style="--d:.3s">
              <img src="${RL.photoSalon}" alt="Une bouteille de René Louis sur un guéridon, trois verres à côté, dans un salon aux murs peints." loading="lazy" decoding="async">
              <figcaption>Une colonne qui n'apparaît qu'en fin d'année, le temps de la saison.</figcaption>
            </figure>
          </div>
        </div>
        <div class="page-foot">${neighbours(col)}${evinHTML()}</div>
      </div>`;
  }

  function maisonPage(col) {
    const P = (n) => L.photo(n);
    const communes = MAISON.communes.map((c) => `<div><dt>${esc(c.nom)}</dt><dd><b>${esc(c.cru)}</b> ${esc(c.caractere)}</dd></div>`).join('');
    const labels = MAISON.labels.map((l) => `<li><b>${esc(l.court)}</b>${l.court !== l.nom ? ` <span>${esc(l.nom)}</span>` : ''}</li>`).join('');
    const items = ACTUALITES.map((n) => {
      const target = n.cuvee && byId[n.cuvee] ? '#' + n.cuvee : n.id === 'recrutement' ? '#venir/vendanges' : null;
      const sw = n.cuvee && byId[n.cuvee] ? byId[n.cuvee].tint : 'transparent';
      return `<li style="--sw:${sw}"><span class="n-date">${esc(n.date)}</span><span class="n-body"><b>${esc(n.titre)}</b>${esc(n.texte)}${n.aConfirmer ? ' <em>À confirmer.</em>' : ''}</span>${target ? `<a href="${target}" class="n-go" aria-label="Voir : ${esc(n.titre)}">${ICON.next}</a>` : ''}</li>`;
    }).join('');
    return `
      <div class="page page--long" id="p-${col.id}" role="region" aria-labelledby="h-${col.id}" inert>
        ${headHTML(col)}
        <div class="long">
          <img class="facade" data-src="${L.shared}illustrations/facade.png" alt="La façade de la maison, dessinée à l'encre." decoding="async">
          <section class="m-intro">
            <div>
              <h2 class="long-h stg" id="h-${col.id}" tabindex="-1">${cap(MAISON.generationsTexte)} générations de vignerons, depuis ${MAISON.depuis}</h2>
              <p class="lead stg" style="--d:.08s">${esc(MAISON.textes.histoire)}</p>
              <p class="stg" style="--d:.14s">${esc(MAISON.textes.heritage)}</p>
              <p class="stg" style="--d:.18s">Propriétaires-récoltants à Villers-Marmery : nous cultivons nos propres vignes, nous pressons, assemblons et vendons nos vins au domaine.</p>
            </div>
            <figure class="print-fig stg" style="--d:.2s">
              <img src="${P('histoire-portrait-ancien-aieul')}" alt="Une main tient une ancienne photographie d'un aïeul de la famille, devant le domaine." loading="lazy" decoding="async">
              <figcaption>Un aïeul de la famille, en photographie ancienne, devant le domaine.</figcaption>
            </figure>
          </section>

          <section class="m-1927">
            <figure>
              <img src="${P('histoire-pressoir-lejeune-1927')}" alt="Le pressoir Lejeune en 1927 : vendangeurs en tablier et paniers d'osier remplis de raisin devant les pressoirs." loading="lazy" decoding="async">
            </figure>
            <div class="m-1927-t">
              <p class="big-num">1927</p>
              <p>Le pressoir Lejeune, photographié pendant les vendanges. Les paniers d'osier attendent devant les pressoirs en bois.</p>
            </div>
          </section>

          <section class="m-vignoble">
            <div>
              <h3 class="long-h3">Trois communes, deux cépages, ${MAISON.parcelles} parcelles</h3>
              <p>${esc(MAISON.textes.vignoble)}</p>
              <dl class="filets">${communes}
                <div><dt>${MAISON.parcelles} parcelles</dt><dd>${esc(MAISON.parcellesAres)}</dd></div>
                <div><dt>Cépages</dt><dd>${MAISON.cepages.join(' et ')}</dd></div>
              </dl>
            </div>
            <figure class="print-fig">
              <img src="${P('paysage-fenetre-vue-vignes')}" alt="Par la fenêtre ouverte de la maison, les rangs de vigne descendent vers la plaine." loading="lazy" decoding="async">
              <figcaption>La vue depuis la maison, chaque matin.</figcaption>
            </figure>
          </section>

          <section class="m-famille">
            <figure>
              <img src="${P('famille-trois-generations-chariot')}" alt="Trois générations de la famille réunies sur le chariot élévateur, dans la cour du domaine." loading="lazy" decoding="async">
            </figure>
            <div>
              <h3 class="long-h3">Aujourd'hui, trois générations</h3>
              <p>Au domaine, on travaille en famille, des vignes jusqu'à la cave.</p>
              <p class="a-recueillir">Prénoms et rôles de chacun : à recueillir auprès de la famille.</p>
            </div>
          </section>

          <section class="m-labels">
            <h3 class="long-h3">Une vigne cultivée avec soin</h3>
            <ul class="labels">${labels}</ul>
          </section>

          <section class="m-news">
            <h3 class="long-h3">La vie du domaine</h3>
            <ul class="news">${items}</ul>
          </section>
        </div>
        <div class="page-foot">${neighbours(col)}${evinHTML()}</div>
      </div>`;
  }

  function venirPage(col) {
    const objets = CONTACT.objets.map((o, i) => `
      <label class="objet"><input type="radio" name="objet" value="${esc(o)}"${i === 0 ? ' checked' : ''}><span>${esc(o)}</span></label>`).join('');
    const choix = [...CUVEES.map((c) => ({ id: c.id, name: c.name, tint: byId[c.id].tint })),
      ...(RL ? [{ id: 'rene-louis', name: 'René Louis', tint: byId['rene-louis'].tint }] : [])];
    const swatches = choix.map((c, i) => `
      <label class="swatch" style="--sw:${c.tint}"><input type="radio" name="cuvee" value="${c.id}"${i === 0 ? ' checked' : ''}><span class="swatch-c" aria-hidden="true"></span><span class="swatch-n">${esc(c.name)}</span></label>`).join('');
    return `
      <div class="page page--long" id="p-${col.id}" role="region" aria-labelledby="h-${col.id}" inert>
        ${headHTML(col)}
        <div class="long venir">
          <section class="v-intro">
            <h2 class="long-h stg" id="h-${col.id}" tabindex="-1">Venir au domaine</h2>
            <p class="lead stg" style="--d:.08s">${esc(MAISON.textes.accueil)}</p>
            <p class="stg" style="--d:.12s">${esc(MAISON.textes.prevenir)}</p>
          </section>
          <section class="v-grid">
            <div class="v-coord stg" style="--d:.16s">
              <dl class="filets filets--clair">
                <div><dt>Adresse</dt><dd>${CONTACT.adresse.map(esc).join('<br>')}</dd></div>
                <div><dt>Téléphone</dt><dd><a href="tel:+33326979398">${esc(CONTACT.tel)}</a><br><a href="tel:+33672425217">${esc(CONTACT.portable)}</a></dd></div>
                <div><dt>Courriel</dt><dd><a href="mailto:${esc(CONTACT.email)}">${esc(CONTACT.email).replace('@', '@<wbr>')}</a></dd></div>
                <div><dt>Instagram</dt><dd>${esc(CONTACT.instagram)}</dd></div>
                <div><dt>Retraits</dt><dd>${CONTACT.retraits.map((r) => `${esc(r.lieu)}, ${esc(r.detail)}`).join('<br>')}</dd></div>
              </dl>
              <p class="note">Coordonnées et points de retrait repris du site actuel, à confirmer.</p>
            </div>
            <form class="form stg" style="--d:.22s" id="form" novalidate>
              <fieldset class="f-objets">
                <legend>Votre demande</legend>
                <div class="objets">${objets}</div>
              </fieldset>
              <fieldset class="f-cuvee" id="f-cuvee">
                <legend>Cuvée souhaitée</legend>
                <div class="swatches">${swatches}</div>
              </fieldset>
              <div class="f-row">
                <label class="field"><span>Nom</span><input type="text" name="nom" autocomplete="name" required></label>
                <label class="field"><span>Courriel</span><input type="email" name="email" autocomplete="email" required></label>
              </div>
              <label class="field"><span>Message</span><textarea name="message" rows="4" id="f-msg"></textarea></label>
              <p class="f-error" id="f-error" hidden></p>
              <button type="submit" class="btn btn--clair">Envoyer</button>
            </form>
            <div class="merci" id="merci" hidden tabindex="-1">
              <p class="merci-h">${esc(CONTACT.merci[0])}</p>
              <p>${esc(CONTACT.merci[1])}</p>
              <button type="button" class="link link--clair" data-action="reset-form">Écrire un autre message</button>
            </div>
          </section>
        </div>
        <div class="page-foot">${neighbours(col)}${evinHTML()}</div>
        <p class="geant" aria-hidden="true">LEJEUNE</p>
      </div>`;
  }

  function colHTML(col) {
    const page = { cuvee: cuveePage, rene: renePage, maison: maisonPage, venir: venirPage }[col.kind](col);
    const label = col.kind === 'cuvee' ? `${col.c.name}, ${col.c.mots}` : col.kind === 'maison' ? 'La maison : histoire, vignoble, famille' : col.kind === 'venir' ? 'Venir au domaine : adresse et contact' : 'René Louis, cuvée de saison';
    return `
      <section class="col col--${col.kind}" id="col-${col.id}" data-id="${col.id}" style="--tint:${col.tint}">
        ${col.kind === 'cuvee' ? `<img class="leaf" data-src="${L.shared}illustrations/feuille-${col.id}.png" alt="" aria-hidden="true">` : ''}
        ${stageHTML(col)}
        <a class="col-hit" href="#${col.id}" aria-controls="p-${col.id}" aria-expanded="false" aria-label="${esc(label)}">
          <span class="band-name" aria-hidden="true">${esc(col.court)}</span>
          ${faceHTML(col)}
        </a>
        ${col.kind === 'maison' ? `<div class="face-lang">${langHTML()}</div>` : ''}
        ${pastilleHTML(col)}
        ${page}
      </section>`;
  }

  const root = $('#nuancier');
  root.innerHTML = COLS.map(colHTML).join('');
  root.style.setProperty('--n', COLS.length);
  $('#evin-fixed').textContent = CONTACT.evin;

  /* ---------- Lumière : bulles et poussière d'or (canvas) ---------- */

  const fx = { canvas: document.createElement('canvas'), raf: 0, parts: [], host: null, w: 0, h: 0, t: 0 };
  fx.canvas.className = 'fx';
  fx.ctx = fx.canvas.getContext('2d');

  function fxSpawn(p, initial) {
    const gold = Math.random() < 0.45;
    p.gold = gold;
    p.x = fx.w * (gold ? 0.15 + Math.random() * 0.7 : 0.4 + Math.random() * 0.2);
    p.y = gold ? fx.h * (0.1 + Math.random() * 0.8) : (initial ? Math.random() : 1) * fx.h * 0.98;
    p.r = gold ? 0.6 + Math.random() * 1.3 : 1 + Math.random() * 2.6;
    p.vy = gold ? (Math.random() - 0.5) * 0.12 : -(0.25 + Math.random() * 0.75);
    p.vx = gold ? (Math.random() - 0.5) * 0.12 : 0;
    p.ph = Math.random() * Math.PI * 2;
    return p;
  }

  function fxResize() {
    if (!fx.host) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1) * 1.4;
    fx.w = fx.host.offsetWidth; fx.h = fx.host.offsetHeight;
    fx.canvas.width = Math.round(fx.w * dpr); fx.canvas.height = Math.round(fx.h * dpr);
    fx.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fx.parts = Array.from({ length: 70 }, () => fxSpawn({}, true));
  }

  function fxFrame() {
    const { ctx, w, h } = fx;
    fx.t += 1;
    ctx.clearRect(0, 0, w, h);
    for (const p of fx.parts) {
      p.y += p.vy; p.x += p.vx + (p.gold ? 0 : Math.sin((fx.t + p.ph * 40) / 28) * 0.18);
      if (p.y < h * 0.02 || p.y > h || p.x < 0 || p.x > w) fxSpawn(p, false);
      if (p.gold) {
        const a = 0.35 + 0.55 * Math.abs(Math.sin(fx.t / 46 + p.ph));
        ctx.fillStyle = `rgba(201, 166, 90, ${a})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        if (p.r > 1.4) { ctx.fillStyle = `rgba(255, 248, 226, ${a * 0.8})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.45, 0, Math.PI * 2); ctx.fill(); }
      } else {
        const fade = Math.min(1, (p.y / h) * 1.6);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.75 * fade})`;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.16 * fade})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
    }
    fx.raf = requestAnimationFrame(fxFrame);
  }

  function fxStop() { cancelAnimationFrame(fx.raf); fx.raf = 0; }

  function fxAttach(colId) {
    fxStop();
    const slot = colId && $(`#col-${colId} .fx-slot`);
    if (!slot || reduced.matches || document.hidden) { fx.canvas.remove(); fx.host = null; return; }
    slot.appendChild(fx.canvas);
    fx.host = slot;
    fxResize();
    fx.raf = requestAnimationFrame(fxFrame);
  }

  document.addEventListener('visibilitychange', () => (document.hidden ? fxStop() : fxAttach(state.open)));
  reduced.addEventListener('change', () => fxAttach(state.open));
  window.addEventListener('resize', () => { if (fx.host) fxResize(); });

  /* ---------- Rendu ---------- */

  let rendered = { open: undefined };

  function render(opts = {}) {
    const { open } = state;
    root.classList.toggle('is-open', !!open);
    document.body.classList.toggle('is-open', !!open);
    for (const col of COLS) {
      const el = $(`#col-${col.id}`);
      const isOpen = col.id === open;
      el.classList.toggle('is-open', isOpen);
      const hit = $('.col-hit', el);
      hit.setAttribute('aria-expanded', String(isOpen));
      hit.tabIndex = isOpen ? -1 : 0;
      $('.page', el).inert = !isOpen;
    }
    const col = open && byId[open];
    document.documentElement.style.setProperty('--page-tint', col ? col.tint : '#2C353D');
    document.title = (col ? (col.kind === 'cuvee' ? col.c.name : col.kind === 'maison' ? 'La maison' : col.kind === 'venir' ? 'Venir au domaine' : 'René Louis') + ' · ' : 'Le Nuancier · ') + 'Champagne Lejeune Père & Fils';
    $('#lines-hit').hidden = !open;
    renderForm();

    if (rendered.open !== open) {
      const was = rendered.open;
      rendered.open = open;
      // Le canvas suit la colonne ouverte, une fois qu'elle a pris sa largeur.
      fxStop();
      setTimeout(() => { if (state.open === open) fxAttach(open); }, reduced.matches ? 0 : 520);
      if (open && !opts.silent) {
        const page = $(`#p-${open}`);
        page.scrollTop = 0;
        setTimeout(() => { const h = $(`#h-${open}`); if (h && state.open === open) h.focus({ preventScroll: true }); }, reduced.matches ? 0 : 420);
      } else if (!open && was && !opts.silent) {
        const hit = $(`#col-${was} .col-hit`);
        if (hit) hit.focus({ preventScroll: true });
      }
    }
  }

  function renderForm() {
    const form = $('#form');
    if (!form) return;
    for (const r of $$('input[name="objet"]', form)) r.checked = r.value === state.objet;
    for (const r of $$('input[name="cuvee"]', form)) r.checked = r.value === state.formCuvee;
    $('#f-cuvee').hidden = state.objet !== 'Commande';
    $('#f-msg').placeholder = CONTACT.placeholders[state.objet] || '';
    form.hidden = state.sent;
    $('#merci').hidden = !state.sent;
  }

  /* ---------- Adresses ---------- */

  const OBJETS = { vendanges: 'Vendanges', visite: 'Visite & dégustation', autre: 'Autre' };

  function fromHash() {
    const [id, sub] = decodeURIComponent(location.hash.slice(1)).split('/');
    const patch = { open: byId[id] ? id : null };
    if (id === 'venir' && sub) {
      if (OBJETS[sub]) Object.assign(patch, { objet: OBJETS[sub], sent: false });
      else if (byId[sub] && sub !== 'venir' && sub !== 'la-maison') Object.assign(patch, { objet: 'Commande', formCuvee: sub, sent: false });
    }
    return patch;
  }

  function apply(opts) { Object.assign(state, fromHash()); render(opts); }

  function go(hash) {
    const target = hash ? '#' + hash.replace(/^#/, '') : location.pathname + location.search;
    if ((hash ? '#' + hash.replace(/^#/, '') : '') === location.hash) { apply(); return; }
    history.pushState(null, '', target);
    apply();
  }

  window.addEventListener('popstate', () => apply());
  window.addEventListener('hashchange', () => apply());

  /* ---------- Interactions ---------- */

  let toastTimer = 0;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    const act = e.target.closest('[data-action]');
    if (act) {
      const k = act.dataset.action;
      if (k === 'overview') { e.preventDefault(); go(''); return; }
      if (k === 'lang') {
        const en = act.dataset.lang === 'en';
        for (const b of $$('.lang-b')) b.setAttribute('aria-pressed', String((b.dataset.lang === 'en') === en));
        if (en) toast(CONTACT.langueNote);
        setTimeout(() => { for (const b of $$('.lang-b')) b.setAttribute('aria-pressed', String(b.dataset.lang === 'fr')); }, en ? 3200 : 0);
        return;
      }
      if (k === 'reset-form') { state.sent = false; render({ silent: true }); $('#form input[name="nom"]').focus(); return; }
    }
    if (a) {
      e.preventDefault();
      go(a.getAttribute('href'));
    }
  });

  root.addEventListener('change', (e) => {
    if (e.target.name === 'objet') { state.objet = e.target.value; renderForm(); }
    if (e.target.name === 'cuvee') state.formCuvee = e.target.value;
  });

  root.addEventListener('submit', (e) => {
    if (e.target.id !== 'form') return;
    e.preventDefault();
    const f = e.target;
    const err = $('#f-error');
    const missing = [];
    if (!f.nom.value.trim()) missing.push('votre nom');
    if (!/^\S+@\S+\.\S+$/.test(f.email.value.trim())) missing.push('un courriel valide');
    if (missing.length) {
      err.textContent = `Il manque ${missing.join(' et ')} pour que nous puissions vous répondre.`;
      err.hidden = false;
      (f.nom.value.trim() ? f.email : f.nom).focus();
      return;
    }
    err.hidden = true;
    // Pas encore d'envoi : la confirmation s'affiche seulement.
    state.sent = true;
    render({ silent: true });
    $('#merci').focus();
  });

  window.addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    if (e.key === 'Escape' && state.open) { e.preventDefault(); go(''); return; }
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    if (state.open) {
      const i = COLS.findIndex((c) => c.id === state.open);
      e.preventDefault();
      go(COLS[(i + dir + COLS.length) % COLS.length].id);
    } else {
      const hits = $$('.col-hit');
      const i = hits.indexOf(document.activeElement);
      e.preventDefault();
      hits[i < 0 ? (dir > 0 ? 0 : hits.length - 1) : (i + dir + hits.length) % hits.length].focus();
    }
  });

  // Mobile : glisser à gauche ou à droite passe à la colonne voisine.
  let tx = 0, ty = 0;
  root.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  root.addEventListener('touchend', (e) => {
    if (!state.open || !mobile.matches) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) {
      const i = COLS.findIndex((c) => c.id === state.open);
      go(COLS[(i + (dx < 0 ? 1 : -1) + COLS.length) % COLS.length].id);
    }
  }, { passive: true });

  /* ---------- Déclinaisons ---------- */

  function onDeclinaison() {
    const d = document.documentElement.dataset.declinaison;
    if (d === 'illustration') {
      for (const img of $$('img[data-src]')) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
    }
  }
  document.addEventListener('declinaison', onDeclinaison);
  onDeclinaison();

  /* ---------- Départ ---------- */

  apply({ silent: true });
  requestAnimationFrame(() => document.body.classList.add('is-ready'));
})();
