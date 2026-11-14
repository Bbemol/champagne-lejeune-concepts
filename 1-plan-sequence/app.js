'use strict';
/* Concept 1 — Le Plan-séquence.
   Un seul défilement natif : chaque plan occupe une hauteur d'écran du conteneur #film, et une scène
   « sticky » montre le plan courant (fondu enchaîné). La frise de montage traduit le défilement en minutage. */
(() => {
  const L = window.LEJEUNE;
  const { CUVEES, ACTUALITES, MAISON, CONTACT, RENE_LOUIS } = L;
  const photo = (n) => L.photo(n);
  const dessin = (n) => L.shared + 'illustrations/' + n + '.jpg';
  const DUREE = 250; // 04:10, la durée du film
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQ = matchMedia('(max-width: 900px)');

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const mmss = (s) => { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  const cuvee = (id) => CUVEES.find((c) => c.id === id);
  const news = (id) => ACTUALITES.find((a) => a.id === id);

  /* ---------- Icônes (trait 1.5, cohérent) ---------- */
  const I = {
    play: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6.5 4.5v11l9-5.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4.5h2.6v11H6zM11.4 4.5H14v11h-2.6z" fill="currentColor"/></svg>',
    next: '<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 10h11M11 5.5 15.5 10 11 14.5"/></svg>',
    prev: '<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 10H5M9 5.5 4.5 10 9 14.5"/></svg>',
    close: '<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 5l10 10M15 5 5 15"/></svg>',
    up: '<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12.5 10 7.5l5 5"/></svg>',
    medal: '<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="10" cy="12.2" r="4.6"/><path d="M7.2 8.6 5 2.5h3.4L10 6.4l1.6-3.9H15l-2.2 6.1"/><path d="M10 10.3l.6 1.3 1.4.2-1 1 .2 1.4-1.2-.7-1.2.7.2-1.4-1-1 1.4-.2z" fill="currentColor" stroke="none"/></svg>'
  };

  /* ---------- Le découpage : sept séquences, leurs plans ---------- */
  const DECORS = {
    'brut-reserve': 'degustation-bar-seau-flutes',
    'demi-sec': 'degustation-rose-verre-madeleine',
    'rose': 'famille-trinque-rose-jardin',
    'grande-reserve': 'degustation-grande-reserve-plateau-argent',
    'millesime': 'maison-vignes-crepuscule'
  };
  const LUMIERE = { // teinte de la lumière ondulante, par cuvée
    'brut-reserve': [1, .84, .52], 'demi-sec': [1, .76, .42], 'rose': [1, .64, .56],
    'grande-reserve': [1, .88, .6], 'millesime': [1, .68, .36]
  };

  const SEQS = [
    { id: 'aube', titre: "L'aube", sb: 'storyboard-1-aube', shots: [
      { t: 'scope', img: 'vendanges-lever-soleil-equipe', pos: '50% 58%', alt: "L'équipe de vendange sur le coteau, au lever du soleil",
        sub: 'Vignerons depuis 1684. <em>Onze</em> générations.', note: `${CONTACT.raison} · propriétaires-récoltants à Villers-Marmery` },
      { t: 'split', imgs: [['paysage-fenetre-vue-vignes', 'Les vignes vues depuis une fenêtre de la maison, volets ouverts'], ['vignes-grappes-chardonnay-dorees', 'Grappes de chardonnay dorées au soleil']],
        sub: 'La vigne commence sous nos <em>fenêtres</em>.', note: 'Villers-Marmery, Montagne de Reims' },
      { t: 'scope', img: 'maison-vue-aerienne-domaine-vignes', pos: '50% 46%', alt: 'Vue aérienne du domaine, entouré de vignes',
        sub: `${MAISON.parcelles} parcelles, de <em>4 à 36</em> ares.`, note: 'Premier Cru à Villers-Marmery · Grand Cru à Verzy et à Ambonnay' }
    ] },
    { id: 'vendanges', titre: 'Les vendanges', sb: 'storyboard-2-vendanges', shots: [
      { t: 'scope', img: 'vendanges-caisses-chemin-vignes', pos: '50% 64%', alt: 'Caisses de raisins alignées sur le chemin du coteau',
        sub: 'Septembre. Les caisses s’alignent sur le <em>chemin</em>.', note: 'Les vendanges, à la main' },
      { t: 'scope', img: 'vendanges-equipe-photo-groupe-coteau', pos: '50% 62%', alt: 'Photo de groupe des vendangeurs sur le coteau',
        sub: 'Toute une <em>équipe</em> monte au coteau.', note: 'Coupeurs, porteurs, cuisiniers' },
      { t: 'split', imgs: [['vendanges-vendangeuse-coupe-grappe', 'Une vendangeuse coupe une grappe de chardonnay'], ['vendanges-brouette-caisse-rang', 'Un vendangeur pousse une brouette chargée de raisins dans le rang']],
        sub: 'Chardonnay et Pinot Noir, grappe après <em>grappe</em>.', note: 'Nos deux cépages' },
      { t: 'insert', news: 'recrutement', img: 'vendanges-vendangeuse-capuche-sourire', alt: 'Une vendangeuse souriante entre les feuilles', objet: 'Vendanges',
        action: 'Proposer sa candidature', sub: 'La prochaine récolte se prépare dès l’<em>été</em>.', note: 'Insert · une nouvelle du domaine' }
    ] },
    { id: 'pressoir', titre: 'Le pressoir', sb: 'storyboard-3-pressoir', shots: [
      { t: 'scope', img: 'pressoir-ancien-mains-vue-dessus', pos: '50% 50%', alt: 'Le vieux pressoir de bois vu du dessus, des mains sur la barre',
        sub: 'Le vieux pressoir de <em>bois</em>.', note: 'Au pressoir' },
      { t: 'scope', img: 'pressoir-tri-raisins-noirs-equipe', pos: '50% 48%', alt: "L'équipe trie les raisins noirs au pressoir",
        sub: 'Les raisins noirs passent entre toutes les <em>mains</em>.', note: 'Le tri' },
      { t: 'split', imgs: [['pressoir-ancien-jus-detail', 'Détail du vieux pressoir en bois, le jus qui s’écoule'], ['pressoir-ancien-raisins-noirs', 'Raisins noirs foulés dans le vieux pressoir']],
        sub: 'Le jus coule, <em>doucement</em>.', note: 'Le pressurage' },
      { t: 'carton', annee: '1927', sub: '', note: '' },
      { t: 'flash', img: 'histoire-pressoir-lejeune-1927', alt: 'Photographie d’archive : le pressoir Lejeune en 1927, les vendangeurs et les paniers',
        sub: 'Le pressoir Lejeune, en <em>1927</em>.', note: 'Photographie d’archive de la famille' },
      { t: 'scope', tourne: true, img: 'pressoir-ancien-mains-vue-dessus', pos: '45% 44%', alt: 'La roue du vieux pressoir, vue du dessus, qui tourne',
        sub: 'La roue tourne ; le vin descend en <em>cave</em>.', note: 'Du pressoir à la cave' }
    ] },
    { id: 'cave', titre: 'La cave', sb: 'storyboard-4-cave', sbAt: 1, shots: [
      { t: 'scope', raccord: true, img: 'cave-rose-bouteilles-cage', pos: '50% 50%', alt: 'Bouteilles de rosé tête en bas dans une cage, des mains au travail, vues du dessus',
        sub: 'Le Rosé, bouteille après <em>bouteille</em>.', note: 'En cave' },
      { t: 'scope', img: 'cave-equipe-tirage-empilage', pos: '50% 40%', alt: "L'équipe empile les bouteilles en cave après le tirage",
        sub: 'Le tirage : chaque bouteille prend sa <em>place</em>.', note: 'Le tirage' },
      { t: 'split', imgs: [['cave-tirage-caisses-bouteilles', 'Caisses de bouteilles capsulées marquées Lejeune'], ['cave-mise-en-bouteille-mains', 'Des mains manipulent des bouteilles, palettes en fond']],
        sub: 'Puis le temps : de trois à six ans sur <em>lattes</em>.', note: 'Selon la cuvée' }
    ] },
    { id: 'famille', titre: 'La famille', sb: 'storyboard-5-famille', shots: [
      { t: 'split', imgs: [['histoire-portrait-ancien-aieul', 'Une ancienne photo d’un aïeul, tenue en main devant le domaine'], ['famille-pere-bebe-caisses-noir-blanc', 'Un père et son bébé assis sur des caisses, en noir et blanc']],
        sub: `Depuis ${MAISON.fondateur}, né en <em>1684</em>.`, note: 'Onze générations se sont transmis la vigne' },
      { t: 'scope', img: 'famille-trois-generations-chariot', pos: '50% 38%', alt: 'Trois générations de la famille sur le chariot élévateur',
        sub: 'Trois générations, <em>aujourd’hui</em>, au domaine.', note: 'Prénoms et rôles de chacun : à recueillir auprès de la famille', aRecueillir: true },
      { t: 'entracte', sub: '<em>Entracte</em>', note: 'En chiffres' },
      { t: 'split', imgs: [['vendanges-trois-generations-enfant', 'Trois générations autour d’une caisse de raisins, un enfant au chapeau'], ['vendanges-pere-fils-vignes', 'Un père et son fils dans les vignes']],
        sub: 'De père en <em>fils</em>.', note: 'Père & Fils, depuis onze générations' },
      { t: 'insert', news: 'rene-louis', img: 'bouteilles-rene-louis-exterieur', pos: '50% 40%', alt: 'Une bouteille de René Louis en extérieur', objet: 'Commande',
        action: 'La commander', sub: `En hommage à nos grands-pères, ${MAISON.grandsPeres[0]} et ${MAISON.grandsPeres[1].split(' ')[0]} <em>${MAISON.grandsPeres[1].split(' ')[1]}</em>.`, note: 'Insert · de saison' }
    ] },
    { id: 'table', titre: 'La table', sb: 'storyboard-6-table', shots: [
      { t: 'split', imgs: [['degustation-verre-rose-grave', 'Un verre de rosé gravé « Champagne Lejeune Villers-Marmery », tenu en main'], ['bouteilles-rose-en-main', 'Une bouteille de Brut Rosé tenue à la main']],
        sub: 'Cinq expressions d’un même <em>terroir</em>.', note: 'Touchez une bouteille pour l’arrêt sur image' },
      ...CUVEES.map((c) => ({ t: 'cuvee', id: c.id, img: DECORS[c.id], sub: esc(c.name), note: `${esc(c.mots)} · ${esc(c.cru)}${/étiquette/i.test(c.aConfirmer || '') ? ' <span class="todo-mark">à confirmer</span>' : ''}` }))
    ] },
    { id: 'rendez-vous', titre: 'Rendez-vous', sb: 'storyboard-7-rendez-vous', shots: [
      { t: 'scope', img: 'maison-vue-aerienne-facade', pos: '50% 56%', alt: 'La maison vue du ciel, sa cour et les vignes derrière',
        sub: `Rendez-vous au ${CONTACT.adresse[0].replace(', ', ', ')}.`.replace('avenue de Champagne', 'avenue de <em>Champagne</em>'), note: 'Villers-Marmery · prévenez-nous de votre passage' }
    ] }
  ];

  // Plans à plat, avec leur séquence.
  const SHOTS = [];
  SEQS.forEach((s, si) => { s.start = SHOTS.length; s.shots.forEach((sh, j) => SHOTS.push({ ...sh, seq: si, first: j === (s.sbAt || 0) })); });
  const N = SHOTS.length;
  const cuveeShot = (id) => SHOTS.findIndex((s) => s.t === 'cuvee' && s.id === id);

  /* ---------- Rendu ---------- */
  const film = $('#film');
  const stage = $('#stage');
  const pic = $('#pic');
  const subs = $('#subs');
  const fiche = $('#fiche');
  film.style.setProperty('--n', N);

  const img = (name, alt, pos, cls = '') =>
    `<img class="${cls}" data-src="${photo(name)}" alt="${esc(alt)}"${pos ? ` style="object-position:${pos}"` : ''} decoding="async">`;

  function mediaHTML(s) {
    switch (s.t) {
      case 'scope': return img(s.img, s.alt, s.pos, 'kb');
      case 'flash': return `${img(s.img, s.alt, '', 'kb')}<span class="grain" aria-hidden="true"></span>`;
      case 'split': return s.imgs.map(([n, a]) => `<div class="half">${img(n, a, '', 'kb')}</div>`).join('');
      case 'carton': return `<div class="carton"><p class="carton-y">${s.annee}</p><p class="carton-n">Retour en arrière</p></div>`;
      case 'entracte': return `
        <div class="entracte">
          <p class="ent-l">Depuis <span class="n">${MAISON.depuis}</span>, <span class="n">onze</span> générations.</p>
          <p class="ent-l"><span class="n">${MAISON.parcelles}</span> parcelles, ${MAISON.parcellesAres}, sur <span class="n">trois</span> communes.</p>
          <p class="ent-l"><span class="n">Deux</span> cépages : ${MAISON.cepages.join(' et ')}.</p>
          <p class="ent-labels">${MAISON.labels.map((l) => `<span title="${esc(l.nom)}">${esc(l.nom)}</span>`).join('')}</p>
        </div>`;
      case 'insert': {
        const n = news(s.news);
        return `<div class="ins-photo">${img(s.img, s.alt, s.pos, 'kb')}</div>
          <div class="ins-card">
            <h3 class="ins-title">${esc(n.titre)}</h3>
            <p class="ins-text">${esc(n.texte)}</p>
            <p class="ins-date">${esc(n.date)}${n.aConfirmer ? ' · à confirmer' : ''}</p>
            <button type="button" class="btn-line" data-action="ecrire" data-objet="${s.objet}"${s.news === 'rene-louis' ? ' data-cuvee=""' : ''}>${esc(s.action)} ${I.next}</button>
          </div>`;
      }
      case 'cuvee': {
        const c = cuvee(s.id);
        return `<img class="decor" data-src="${photo(s.img)}" alt="" decoding="async">
          <button type="button" class="bottle-btn" data-action="freeze" data-id="${c.id}" aria-label="Arrêt sur image : ${esc(c.name)}">
            <img class="bottle" data-src="${c.bouteille}" alt="Bouteille de ${esc(c.name)}" decoding="async">
          </button>`;
      }
    }
    return '';
  }

  pic.innerHTML = SHOTS.map((s, k) => `
    <figure class="shot t-${s.t}${s.tourne ? ' is-tourne' : ''}${s.raccord ? ' is-raccord' : ''}" data-k="${k}"${s.t === 'cuvee' ? ` data-cuvee="${s.id}"` : ''}>
      ${mediaHTML(s)}
      ${s.first ? `<img class="sb" data-sb="${dessin(SEQS[s.seq].sb)}" alt="" aria-hidden="true" decoding="async"${s.pos ? ` style="object-position:${s.pos}"` : ''}>` : ''}
    </figure>`).join('') + '<canvas class="light" id="light" aria-hidden="true"></canvas><span class="light-css" aria-hidden="true"></span>';

  function subHTML(s) {
    const note = s.note ? `<p class="sub-note${s.aRecueillir ? ' is-todo' : ''}">${s.note}</p>` : '';
    if (s.t === 'cuvee') {
      const c = cuvee(s.id);
      return `<div class="sub sub-cuvee" data-k="${s.k}">
        <p class="sub-line">${s.sub}</p>
        <div class="sub-row">${note}<button type="button" class="btn-freeze" data-action="freeze" data-id="${c.id}">${I.pause}<span>Arrêt sur image</span></button></div>
        ${c.distinction ? `<p class="medal" data-news="medaille">${I.medal}<span><strong>Médaille d’Or</strong> au Concours Général Agricole de Paris, mars 2026</span></p>` : ''}
      </div>`;
    }
    return `<div class="sub" data-k="${s.k}">
      ${s.sub ? `<p class="sub-line">${s.sub}</p>` : ''}
      ${note}
    </div>`;
  }
  subs.innerHTML = SHOTS.map((s, k) => subHTML({ ...s, k })).join('');

  // Ancres de séquence (#aube … #rendez-vous) posées à la hauteur de leur premier plan.
  film.insertAdjacentHTML('afterbegin', SEQS.map((s) =>
    `<span class="anchor" id="${s.id}" style="--k:${s.start}" aria-hidden="true"></span>`).join(''));

  const shotEls = $$('.shot', pic);
  const subEls = $$('.sub', subs);

  /* ---------- Le générique de fin ---------- */
  const evin = esc(CONTACT.evin);
  $('#generique').innerHTML = `
    <div class="gen-in">
      <h2 class="gen-title" id="gen-title">Rendez-<em>vous</em> au domaine</h2>
      <p class="gen-lead">${esc(MAISON.textes.accueil)} ${esc(MAISON.textes.prevenir)}</p>

      <dl class="credits">
        <div><dt>Maison</dt><dd>${esc(CONTACT.raison)}<span>${esc(CONTACT.mention)}</span></dd></div>
        <div><dt>Adresse</dt><dd>${CONTACT.adresse.map(esc).join('<br>')}</dd></div>
        <div><dt>Téléphone</dt><dd><a href="tel:+33326979398">${esc(CONTACT.tel)}</a></dd></div>
        <div><dt>Portable</dt><dd><a href="tel:+33672425217">${esc(CONTACT.portable)}</a></dd></div>
        <div><dt>Courriel</dt><dd><a href="mailto:${CONTACT.email}">${esc(CONTACT.email)}</a></dd></div>
        <div><dt>Instagram</dt><dd>${esc(CONTACT.instagram)}</dd></div>
        ${CONTACT.retraits.map((r, i) => `<div><dt>${i ? '' : 'Points de retrait'}</dt><dd>${esc(r.lieu)}<span>${esc(r.detail)}</span></dd></div>`).join('')}
      </dl>
      <p class="gen-note">Coordonnées et points de retrait repris du site actuel : à confirmer par la famille.</p>

      <form class="ecrire" id="ecrire" novalidate>
        <h3 class="ecrire-title">Écrivez-nous</h3>
        <fieldset class="objets">
          <legend>Objet de votre message</legend>
          ${CONTACT.objets.map((o, i) => `<label class="objet"><input type="radio" name="objet" value="${esc(o)}"${i ? '' : ' checked'}><span>${esc(o)}</span></label>`).join('')}
        </fieldset>
        <div class="field" id="field-cuvee">
          <label for="f-cuvee">Cuvée souhaitée</label>
          <select id="f-cuvee" name="cuvee">
            ${CUVEES.map((c) => `<option value="${c.id}">${esc(c.name)}</option>`).join('')}
            <option value="rene-louis">${esc(RENE_LOUIS.name)} (de saison)</option>
          </select>
        </div>
        <div class="field-row">
          <div class="field"><label for="f-nom">Nom</label><input id="f-nom" name="nom" autocomplete="name" required></div>
          <div class="field"><label for="f-email">Courriel</label><input id="f-email" name="email" type="email" autocomplete="email" required></div>
        </div>
        <div class="field"><label for="f-msg">Message</label><textarea id="f-msg" name="message" rows="4" placeholder="${esc(CONTACT.placeholders.Commande)}"></textarea></div>
        <p class="form-err" id="form-err" role="alert" hidden></p>
        <button class="btn-send" type="submit">Envoyer ${I.next}</button>
      </form>
      <div class="merci" id="merci" hidden tabindex="-1">
        <h3>${esc(CONTACT.merci[0])}</h3>
        <p>${esc(CONTACT.merci[1])}</p>
        <p class="gen-note">Prototype : aucun message n’est encore réellement envoyé.</p>
      </div>

      <section class="nouvelles" id="nouvelles" aria-labelledby="nv-title">
        <h3 class="nv-title" id="nv-title">Toutes les nouvelles</h3>
        <ol class="nv-list">
          ${ACTUALITES.map((a) => {
            const k = a.id === 'medaille' ? cuveeShot('grande-reserve') : SHOTS.findIndex((s) => s.news === a.id);
            const seq = k >= 0 ? SEQS[SHOTS[k].seq] : null;
            return `<li>
              <p class="nv-date">${esc(a.date)}</p>
              <div class="nv-body">
                <h4>${esc(a.titre)}</h4>
                <p>${esc(a.texte)}${a.aConfirmer ? ' <span class="todo">À confirmer.</span>' : ''}</p>
                ${k >= 0 ? `<button type="button" class="nv-go" data-action="goto-shot" data-k="${k}">Voir l’insert, dans « ${esc(seq.titre)} » ${I.next}</button>` : ''}
              </div>
            </li>`;
          }).join('')}
        </ol>
      </section>

      <div class="fin">
        <p class="fin-mot">Fin</p>
        <p class="fin-sig">${esc(CONTACT.raison)} · ${esc(CONTACT.mention)}<br>Villers-Marmery, depuis ${MAISON.depuis}</p>
        <p class="evin">${evin}</p>
      </div>
    </div>`;

  /* ---------- La frise de montage ---------- */
  const frise = $('#frise');
  const MARKS = [
    { k: SHOTS.findIndex((s) => s.news === 'recrutement'), label: 'Insert : ' + news('recrutement').titre },
    { k: SHOTS.findIndex((s) => s.news === 'rene-louis'), label: 'Insert : ' + news('rene-louis').titre },
    { k: cuveeShot('grande-reserve'), label: 'Insert : ' + news('medaille').titre }
  ];
  frise.innerHTML = `
    <button type="button" class="play" id="play" aria-pressed="false" aria-label="Lecture du film">${I.play}</button>
    <p class="tc" aria-live="off"><span class="tc-cur" id="tc">00:00</span><span class="tc-tot"> / ${mmss(DUREE)}</span></p>
    <div class="track" id="track">
      <div class="segs">${SEQS.map((s, i) => `
        <button type="button" class="seg" data-s="${i}" aria-label="${esc(s.titre)}">
          <span class="seg-thumb" style="background-image:url('${photo(firstImg(s))}')"></span>
          <span class="seg-name">${esc(s.titre)}</span>
        </button>`).join('')}</div>
      ${MARKS.map((m) => `<button type="button" class="mark" data-action="goto-shot" data-k="${m.k}" aria-label="${esc(m.label)}" title="${esc(m.label)}"></button>`).join('')}
      <span class="head" id="head" role="slider" tabindex="0" aria-label="Tête de lecture" aria-valuemin="0" aria-valuemax="${DUREE}" aria-valuenow="0"></span>
    </div>
    <a class="frise-nv" href="#nouvelles">Nouvelles <span>${ACTUALITES.length}</span></a>`;

  function firstImg(s) {
    const sh = s.shots[0];
    return sh.img || (sh.imgs && sh.imgs[0][0]) || 'vendanges-lever-soleil-equipe';
  }

  const mbar = $('#mbar');
  mbar.innerHTML = `
    <span class="fil" aria-hidden="true"><span id="fil"></span></span>
    <button type="button" class="mbar-b" id="mbar-b" aria-expanded="false" aria-controls="drawer">
      <span class="mbar-seq" id="mbar-seq">L'aube</span>
      <span class="mbar-tc"><span id="mtc">00:00</span> / ${mmss(DUREE)}</span>
      ${I.up}
    </button>
    <button type="button" class="play play-m" id="play-m" aria-pressed="false" aria-label="Lecture du film">${I.play}</button>`;

  const drawer = $('#drawer');
  drawer.innerHTML = `
    <div class="dr-in">
      <div class="dr-head"><p class="dr-title">Séquences</p><button type="button" class="icon-b" data-action="drawer-close" aria-label="Fermer la liste">${I.close}</button></div>
      <ol class="dr-list">${SEQS.map((s, i) => `
        <li><button type="button" class="dr-seq" data-s="${i}">
          <span class="dr-thumb" style="background-image:url('${photo(firstImg(s))}')"></span>
          <span class="dr-name">${esc(s.titre)}</span><span class="dr-tc" data-tc="${i}"></span>
        </button></li>`).join('')}</ol>
      <a class="dr-nv" href="#nouvelles" data-action="drawer-close">Toutes les nouvelles</a>
    </div>`;

  /* ---------- Mesures ---------- */
  let vh = stage.offsetHeight;
  const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const shotTop = (k) => film.offsetTop + k * vh;
  const seqStart = (i) => shotTop(SEQS[i].start);
  const seqEnd = (i) => (i < SEQS.length - 1 ? seqStart(i + 1) : maxScroll());

  function layoutFrise() {
    vh = stage.offsetHeight;
    const total = maxScroll();
    $$('.seg', frise).forEach((b, i) => { b.style.flexGrow = String(Math.max(.4, (seqEnd(i) - seqStart(i)) / total * 100)); });
    $$('.mark', frise).forEach((m) => { m.style.left = (shotTop(+m.dataset.k) / total * 100) + '%'; });
    $$('[data-tc]', drawer).forEach((el) => { el.textContent = mmss(seqStart(+el.dataset.tc) / total * DUREE); });
  }

  /* ---------- État ---------- */
  let active = -1;
  let frozen = null; // id de la cuvée en arrêt sur image
  let playing = false;
  let seqActive = -1;

  function loadAround(k) {
    for (let j = k - 1; j <= k + 2; j++) {
      const el = shotEls[j];
      if (!el) continue;
      $$('img[data-src]', el).forEach((im) => { im.src = im.dataset.src; im.removeAttribute('data-src'); });
    }
    if (document.documentElement.dataset.declinaison === 'illustration') loadStoryboards(k);
  }
  function loadStoryboards(k) {
    $$('img.sb[data-sb]', pic).forEach((im) => {
      const sk = +im.closest('.shot').dataset.k;
      if (k === undefined || Math.abs(sk - k) <= 3) { im.src = im.dataset.sb; im.removeAttribute('data-sb'); }
    });
  }

  function setActive(k) {
    if (k === active) return;
    const prev = active;
    active = k;
    loadAround(k);
    shotEls.forEach((el, j) => {
      el.classList.toggle('is-active', j === k);
      el.classList.toggle('is-leaving', j === prev);
    });
    subEls.forEach((el, j) => {
      const on = j === k;
      el.classList.toggle('is-active', on);
      el.inert = !on;
      el.setAttribute('aria-hidden', String(!on));
    });
    sizeSub();
    const s = SHOTS[k];
    stage.classList.toggle('is-flash', s.t === 'carton' || s.t === 'flash');
    stage.classList.toggle('is-light', s.t === 'entracte');
    // Le décor des cuvées dérive lentement ; il se fige à l'arrêt sur image.
    shotEls.forEach((el, j) => { if (SHOTS[j].t === 'cuvee') drift(el, j === k); });
    if (s.seq !== seqActive) {
      seqActive = s.seq;
      $$('.seg', frise).forEach((b, i) => b.classList.toggle('is-active', i === s.seq));
      $$('.seg', frise).forEach((b, i) => b.setAttribute('aria-current', i === s.seq ? 'step' : 'false'));
      $$('.dr-seq', drawer).forEach((b, i) => b.classList.toggle('is-active', i === s.seq));
      $('#mbar-seq').textContent = SEQS[s.seq].titre;
    }
  }

  function sizeSub() {
    if (active < 0) return;
    stage.style.setProperty('--sub-h', Math.ceil(subEls[active].offsetHeight) + 'px');
  }

  const drifts = new WeakMap();
  function drift(el, on) {
    const d = $('.decor', el);
    if (!d || reduce.matches) return;
    let a = drifts.get(d);
    if (on && !a) {
      a = d.animate([
        { transform: 'scale(1.18) translate3d(-2%, .6%, 0)' },
        { transform: 'scale(1.18) translate3d(2%, -1%, 0)' }
      ], { duration: 16000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' });
      drifts.set(d, a);
    } else if (!on && a) { a.cancel(); drifts.delete(d); }
  }
  function rampDrift(el, to, ms) {
    const d = el && $('.decor', el);
    const a = d && drifts.get(d);
    if (!a) return;
    const from = a.playbackRate;
    const t0 = performance.now();
    if (to > 0 && a.playState === 'paused') a.play();
    const step = (t) => {
      const p = clamp((t - t0) / ms, 0, 1);
      const e = 1 - Math.pow(1 - p, 3);
      a.playbackRate = from + (to - from) * e || 0.0001;
      if (p < 1) requestAnimationFrame(step);
      else if (to === 0) a.pause();
    };
    requestAnimationFrame(step);
  }

  let ticking = false;
  function update() {
    ticking = false;
    if (frozen) return;
    const y = scrollY;
    const local = y - film.offsetTop;
    const k = clamp(Math.floor(local / vh), 0, N - 1);
    const kp = clamp((local - k * vh) / vh, 0, 1);
    setActive(k);
    shotEls[k].style.setProperty('--kp', kp.toFixed(4));
    const p = clamp(y / maxScroll(), 0, 1);
    const t = p * DUREE;
    $('#tc').textContent = mmss(t);
    $('#mtc').textContent = mmss(t);
    const head = $('#head');
    head.style.left = (p * 100) + '%';
    head.setAttribute('aria-valuenow', String(Math.round(t)));
    head.setAttribute('aria-valuetext', `${mmss(t)}, ${SEQS[SHOTS[k].seq].titre}`);
    $('#fil').style.transform = `scaleX(${p})`;
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Aller à ---------- */
  const behavior = () => (reduce.matches ? 'instant' : 'smooth');
  function goShot(k, how = behavior()) { scrollTo({ top: shotTop(k) + 1, behavior: how }); }
  function goSeq(i, how) { goShot(SEQS[clamp(i, 0, SEQS.length - 1)].start, how); }

  /* ---------- Lecture automatique ---------- */
  let last = 0;
  let acc = 0;
  function setPlaying(on) {
    if (on && reduce.matches) return;
    playing = on;
    document.documentElement.classList.toggle('is-playing', on);
    [$('#play'), $('#play-m')].forEach((b) => {
      b.setAttribute('aria-pressed', String(on));
      b.setAttribute('aria-label', on ? 'Mettre le film en pause' : 'Lecture du film');
      b.innerHTML = on ? I.pause : I.play;
    });
    if (on) {
      if (scrollY >= maxScroll() - 2) scrollTo({ top: 0, behavior: 'instant' });
      last = performance.now(); acc = 0;
      requestAnimationFrame(tick);
    }
  }
  function tick(t) {
    if (!playing) return;
    const dt = Math.min(.1, (t - last) / 1000);
    last = t;
    acc += (maxScroll() / DUREE) * dt;
    const d = Math.floor(acc);
    if (d) { acc -= d; scrollBy({ top: d, behavior: 'instant' }); }
    if (scrollY >= maxScroll() - 1) { setPlaying(false); return; }
    requestAnimationFrame(tick);
  }
  const stopPlay = () => { if (playing) setPlaying(false); };
  addEventListener('wheel', stopPlay, { passive: true });
  addEventListener('touchstart', stopPlay, { passive: true });
  addEventListener('pointerdown', (e) => { if (!e.target.closest('.play')) stopPlay(); });
  [$('#play'), $('#play-m')].forEach((b) => b.addEventListener('click', () => setPlaying(!playing)));
  reduce.addEventListener('change', () => { if (reduce.matches) setPlaying(false); });

  /* ---------- Tête de lecture : glisser, cliquer ---------- */
  const track = $('#track');
  let drag = null;
  function scrubTo(clientX) {
    const r = track.getBoundingClientRect();
    const f = clamp((clientX - r.left) / r.width, 0, 1);
    scrollTo({ top: f * maxScroll(), behavior: 'instant' });
  }
  track.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('.mark')) return;
    drag = { x: e.clientX, moved: e.target === $('#head'), id: e.pointerId };
    track.setPointerCapture(e.pointerId);
    if (drag.moved) { track.classList.add('is-scrub'); scrubTo(e.clientX); }
  });
  track.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (!drag.moved && Math.abs(e.clientX - drag.x) > 4) { drag.moved = true; track.classList.add('is-scrub'); }
    if (drag.moved) scrubTo(e.clientX);
  });
  const endDrag = (e) => {
    if (!drag) return;
    const wasMove = drag.moved;
    drag = null;
    track.classList.remove('is-scrub');
    if (!wasMove) {
      const seg = document.elementFromPoint(e.clientX, e.clientY);
      const b = seg && seg.closest('.seg');
      if (b) goSeq(+b.dataset.s);
    }
  };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', () => { drag = null; track.classList.remove('is-scrub'); });
  // Clavier et aides techniques (clic sans pointeur) ; le clic souris passe par le glissé ci-dessus.
  $$('.seg', frise).forEach((b) => b.addEventListener('click', (e) => { if (e.detail === 0) goSeq(+b.dataset.s); }));
  $('#head').addEventListener('keydown', (e) => {
    const step = { ArrowRight: 10, ArrowUp: 10, ArrowLeft: -10, ArrowDown: -10, PageUp: 30, PageDown: -30 }[e.key];
    if (step) {
      e.preventDefault(); e.stopPropagation();
      const t = clamp(scrollY / maxScroll() * DUREE + step, 0, DUREE);
      scrollTo({ top: t / DUREE * maxScroll(), behavior: 'instant' });
    } else if (e.key === 'Home') { e.preventDefault(); scrollTo({ top: 0, behavior: 'instant' }); }
    else if (e.key === 'End') { e.preventDefault(); scrollTo({ top: maxScroll(), behavior: 'instant' }); }
  });

  /* ---------- Tiroir des séquences (mobile) ---------- */
  const mbarB = $('#mbar-b');
  function setDrawer(on) {
    drawer.hidden = !on;
    mbarB.setAttribute('aria-expanded', String(on));
    document.documentElement.classList.toggle('is-drawer', on);
    if (on) ($('.dr-seq.is-active', drawer) || $('.dr-seq', drawer)).focus({ preventScroll: true });
    else mbarB.focus({ preventScroll: true });
  }
  mbarB.addEventListener('click', () => setDrawer(drawer.hidden));
  drawer.addEventListener('click', (e) => {
    if (e.target === drawer) setDrawer(false);
    const b = e.target.closest('.dr-seq');
    if (b) { setDrawer(false); goSeq(+b.dataset.s, 'instant'); }
  });

  /* ---------- Arrêt sur image ---------- */
  const Light = makeLight($('#light'));
  // Désaccord fiche / étiquette / site actuel : toujours dit comme « à confirmer par la famille ».
  const aConfirmer = (t) => {
    const s = String(t === true ? '' : t).trim();
    if (/à confirmer par la famille/i.test(s)) return s;
    return (s ? s.replace(/\.?$/, '. ') : '') + 'À confirmer par la famille.';
  };
  function ficheHTML(c, i) {
    const lines = [];
    let d = 0;
    const ln = (html, cls = '') => `<div class="ln ${cls}" style="--d:${(d++) * 0.09 + 0.35}s">${html}</div>`;
    lines.push(`<div class="fz-col fz-intro">
      ${ln(`<h2 class="fz-name" id="fz-name" tabindex="-1">${esc(c.name)}</h2>`)}
      ${ln(`<p class="fz-mots">${esc(c.mots)} · ${esc(c.cru)}</p>`)}
      ${ln(`<p class="fz-desc">${esc(c.desc)}</p>`)}
      ${c.distinction ? ln(`<p class="medal">${I.medal}<span><strong>Médaille d’Or</strong> au Concours Général Agricole de Paris, mars 2026</span></p>`) : ''}
    </div>`);
    lines.push(`<div class="fz-col fz-mid"><dl class="fz-facts">${c.facts.map(([k, v]) => ln(`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`, 'fact')).join('')}</dl>
      ${c.aConfirmer ? ln(`<p class="fz-todo">${esc(aConfirmer(c.aConfirmer))}</p>`) : ''}</div>`);
    lines.push(`<div class="fz-col fz-taste">
      <dl>${c.tasting.map(([k, v]) => ln(`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`, 'fact')).join('')}</dl>
      ${ln(`<p class="fz-accords"><span>À table</span> ${esc(c.accords)}</p>`)}
      ${ln(`<button type="button" class="btn-order" data-action="order" data-id="${c.id}">Commander cette cuvée ${I.next}</button>`)}
    </div>`);
    return `
      <div class="fz-bar">
        <p class="fz-stamp">${I.pause}<span>Arrêt sur image</span><span class="fz-tc">${$('#tc').textContent}</span></p>
        <div class="fz-nav">
          <button type="button" class="icon-b" data-action="fz-prev" aria-label="Plan précédent">${I.prev}</button>
          <span class="fz-count">${String(i + 1).padStart(2, '0')} / ${String(CUVEES.length).padStart(2, '0')}</span>
          <button type="button" class="fz-next" data-action="fz-next">Plan suivant ${I.next}</button>
          <button type="button" class="icon-b fz-close" data-action="fz-close" aria-label="Relancer le film (Échap)" title="Relancer le film (Échap)">${I.close}</button>
        </div>
      </div>
      <div class="fz-cols">${lines.join('')}</div>`;
  }

  function openFreeze(id, opts = {}) {
    const c = cuvee(id);
    if (!c) return;
    setPlaying(false);
    const k = cuveeShot(id);
    const wasFrozen = !!frozen;
    if (active !== k) {
      frozen = null;
      scrollTo({ top: shotTop(k) + 1, behavior: 'instant' });
      update();
    }
    frozen = id;
    const el = shotEls[k];
    loadAround(k);
    fiche.innerHTML = ficheHTML(c, CUVEES.indexOf(c));
    fiche.hidden = false;
    shotEls.forEach((s) => s.classList.remove('is-frozen'));
    el.classList.add('is-frozen');
    // La lumière passe derrière la bouteille de ce plan.
    el.insertBefore($('#light'), $('.bottle-btn', el));
    el.insertBefore($('.light-css'), $('.bottle-btn', el));
    Light.tint(LUMIERE[id]);
    if (!wasFrozen) {
      document.documentElement.classList.add('is-frozen');
      stage.classList.add('is-freeze');
      rampDrift(el, 0, reduce.matches || opts.quick ? 1 : 900);
      setTimeout(() => { if (frozen) Light.start(); }, reduce.matches || opts.quick ? 0 : 350);
    } else {
      rampDrift(el, 0, 1);
      Light.start();
    }
    frise.inert = true; mbar.inert = true;
    subs.inert = true;
    if (!opts.keepHash) history.replaceState(null, '', '#table/' + id);
    requestAnimationFrame(() => $('#fz-name', fiche)?.focus({ preventScroll: true }));
  }

  function closeFreeze(opts = {}) {
    if (!frozen) return;
    const k = cuveeShot(frozen);
    frozen = null;
    Light.stop();
    document.documentElement.classList.remove('is-frozen');
    stage.classList.remove('is-freeze');
    shotEls[k].classList.remove('is-frozen');
    rampDrift(shotEls[k], 1, reduce.matches ? 1 : 900);
    frise.inert = false; mbar.inert = false; subs.inert = false;
    setTimeout(() => { if (!frozen) { fiche.hidden = true; fiche.innerHTML = ''; } }, 500);
    if (!opts.keepHash) history.replaceState(null, '', '#table');
    $(`.sub[data-k="${k}"] .btn-freeze`)?.focus({ preventScroll: true });
    update();
  }

  function stepFreeze(dir) {
    const i = CUVEES.findIndex((c) => c.id === frozen);
    const n = CUVEES[(i + dir + CUVEES.length) % CUVEES.length];
    const oldK = cuveeShot(frozen);
    Light.stop();
    shotEls[oldK].classList.remove('is-frozen');
    frozen = null;
    scrollTo({ top: shotTop(cuveeShot(n.id)) + 1, behavior: 'instant' });
    update();
    openFreeze(n.id, { quick: true });
  }

  /* ---------- Formulaire ---------- */
  const form = $('#ecrire');
  function syncForm() {
    const objet = form.objet.value;
    $('#field-cuvee').hidden = objet !== 'Commande';
    $('#f-msg').placeholder = CONTACT.placeholders[objet] || '';
  }
  form.addEventListener('change', syncForm);
  syncForm();
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const err = $('#form-err');
    const bad = [form.nom, form.email].find((f) => !f.checkValidity());
    if (bad) {
      err.hidden = false;
      err.textContent = bad === form.nom ? 'Indiquez votre nom pour que nous puissions vous répondre.' : 'Votre courriel semble incomplet : vérifiez-le (exemple : prenom@domaine.fr).';
      bad.setAttribute('aria-invalid', 'true');
      bad.focus();
      return;
    }
    err.hidden = true;
    form.hidden = true;
    $('#merci').hidden = false;
    $('#merci').focus();
  });
  [form.nom, form.email].forEach((f) => f.addEventListener('input', () => f.removeAttribute('aria-invalid')));

  function ecrire(objet, cuveeId) {
    if (frozen) closeFreeze();
    form.hidden = false; $('#merci').hidden = true;
    const r = $$('input[name="objet"]', form).find((x) => x.value === objet);
    if (r) r.checked = true;
    if (cuveeId) $('#f-cuvee').value = cuveeId;
    syncForm();
    $('#ecrire').scrollIntoView({ behavior: behavior(), block: 'start' });
    setTimeout(() => form.nom.focus({ preventScroll: true }), reduce.matches ? 0 : 900);
  }

  /* ---------- Actions ---------- */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const a = el.dataset.action;
    if (a === 'freeze') openFreeze(el.dataset.id);
    else if (a === 'fz-next') stepFreeze(1);
    else if (a === 'fz-prev') stepFreeze(-1);
    else if (a === 'fz-close') closeFreeze();
    else if (a === 'order') ecrire('Commande', el.dataset.id);
    else if (a === 'ecrire') ecrire(el.dataset.objet, el.dataset.cuvee === '' ? 'rene-louis' : el.dataset.cuvee);
    else if (a === 'goto-shot') goShot(+el.dataset.k);
    else if (a === 'drawer-close') setDrawer(false);
  });

  // Langue : la version anglaise est annoncée, pas encore faite.
  const toast = $('#toast');
  let toastT = 0;
  $$('.lang-b').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.lang === 'en') {
      toast.textContent = CONTACT.langueNote;
      toast.hidden = false;
      clearTimeout(toastT);
      toastT = setTimeout(() => { toast.hidden = true; }, 3200);
    } else toast.hidden = true;
  }));

  addEventListener('keydown', (e) => {
    if (playing && !e.target.closest('.play')) {
      setPlaying(false);
      if (e.key === ' ') { e.preventDefault(); return; }
    }
    if (e.key === 'Escape') {
      if (frozen) { e.preventDefault(); closeFreeze(); return; }
      if (!drawer.hidden) { setDrawer(false); return; }
    }
    if (e.target.closest('input, textarea, select, [role="slider"]') || e.metaKey || e.ctrlKey || e.altKey) return;
    if (frozen) {
      if (e.key === 'ArrowRight') { e.preventDefault(); stepFreeze(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); stepFreeze(-1); }
      return;
    }
    if (e.key === 'ArrowRight') { e.preventDefault(); goSeq(Math.max(0, seqActive) + 1); }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const cur = Math.max(0, seqActive);
      // Au milieu d'une séquence, ← revient à son début ; à son début, à la précédente.
      goSeq(scrollY > seqStart(cur) + vh * .5 ? cur : cur - 1);
    }
  });

  /* ---------- Adresses ---------- */
  function route(first) {
    const h = decodeURIComponent(location.hash.slice(1));
    const m = h.match(/^table\/([\w-]+)$/);
    if (m && cuvee(m[1])) { openFreeze(m[1], { keepHash: true }); return; }
    if (frozen) closeFreeze({ keepHash: true });
    const p = h.match(/^plan\/(\d+)$/); // #plan/12 : un plan précis (lien, capture)
    if (p) { goShot(clamp(+p[1], 0, N - 1), first ? 'instant' : behavior()); return; }
    if (first && h) {
      const el = document.getElementById(h);
      if (el) { el.scrollIntoView({ behavior: 'instant', block: 'start' }); }
    }
  }
  addEventListener('hashchange', () => route(false));

  /* ---------- Déclinaison ---------- */
  document.addEventListener('declinaison', (e) => { if (e.detail === 'illustration') loadStoryboards(active); });

  /* ---------- Démarrage ---------- */
  addEventListener('resize', () => {
    const before = scrollY / Math.max(1, vh);
    sizeSub();
    layoutFrise();
    if (!frozen) scrollTo({ top: before * vh, behavior: 'instant' });
    update();
  });
  mobileQ.addEventListener('change', () => { setDrawer(false); sizeSub(); });
  layoutFrise();
  update();
  route(true);
  if (document.documentElement.dataset.declinaison === 'illustration') loadStoryboards(active);
  document.fonts && document.fonts.ready.then(() => { layoutFrise(); sizeSub(); });
  addEventListener('load', () => { layoutFrise(); update(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { Light.stop(); stopPlay(); } else if (frozen) Light.start(); });

  /* ---------- Lumière ondulante (WebGL, repli CSS) ---------- */
  function makeLight(canvas) {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false, powerPreference: 'low-power' });
    let raf = 0;
    let t0 = 0;
    let on = false;
    let tint = [1, .84, .52];
    if (!gl) {
      document.documentElement.classList.add('no-webgl');
      return { start() {}, stop() {}, tint() {} };
    }
    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fs = `precision mediump float;
      uniform float t; uniform vec2 r; uniform vec3 c;
      void main(){
        vec2 uv = gl_FragCoord.xy / r;
        vec2 p = (uv - .5) * vec2(r.x / r.y, 1.) * 3.4 + vec2(t * .03, 0.);
        vec2 i = p; float k = 1.;
        for (int n = 0; n < 4; n++) {
          float tt = t * .32 * (1. - 2.4 / float(n + 2));
          i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
          k += 1. / length(vec2(p.x / (sin(i.x + tt) / .006), p.y / (cos(i.y + tt) / .006)));
        }
        k /= 4.;
        k = 1.17 - pow(k, 1.4);
        float caus = clamp(pow(abs(k), 8.), 0., 1.);
        vec2 q = (uv - vec2(.5, .5)) * vec2(r.x / r.y * .75, 1.);
        float glow = smoothstep(.8, 0., length(q));
        float edge = smoothstep(1., .2, length(q));
        vec3 col = c * (caus * .7 * edge + glow * glow * .32);
        gl_FragColor = vec4(col, 1.);
      }`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      document.documentElement.classList.add('no-webgl');
      return { start() {}, stop() {}, tint() {} };
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uT = gl.getUniformLocation(prog, 't');
    const uR = gl.getUniformLocation(prog, 'r');
    const uC = gl.getUniformLocation(prog, 'c');
    function size() {
      const r = canvas.getBoundingClientRect();
      const s = Math.min(devicePixelRatio || 1, 1.5) * .5;
      const w = Math.max(2, Math.round(r.width * s));
      const h = Math.max(2, Math.round(r.height * s));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uR, w, h);
    }
    function draw(now) {
      gl.uniform1f(uT, (now - t0) / 1000 + 12);
      gl.uniform3f(uC, tint[0], tint[1], tint[2]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function frame(now) {
      if (!on) return;
      size(); draw(now);
      raf = requestAnimationFrame(frame);
    }
    return {
      start() {
        if (on) return;
        on = true; t0 = performance.now();
        if (reduce.matches) { size(); draw(t0); on = false; return; } // une seule image, fixe
        raf = requestAnimationFrame(frame);
      },
      stop() { on = false; cancelAnimationFrame(raf); },
      tint(c) { if (c) tint = c; if (!on) { size(); draw(performance.now()); } }
    };
  }
})();
