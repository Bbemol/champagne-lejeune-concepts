'use strict';
/* Concept 5 — Les Trois Portes.
   Le site est un arbre de portes (trois niveaux au plus), adressé par le hash (#/cave/cuvees/rose).
   Descendre = zoom : la photo choisie grandit, les deux autres sortent, puis elle se fend en trois.
   Remonter (Échap, bouton retour, pictogramme) = le même mouvement à l'envers. */
(() => {
  const L = window.LEJEUNE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const photo = L.photo;
  const CUV = Object.fromEntries(L.CUVEES.map((c) => [c.id, c]));
  const reduceQ = matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQ = matchMedia('(max-width: 900px)');
  const EASE = 'cubic-bezier(.76, 0, .18, 1)';
  const EASE_OUT = 'cubic-bezier(.16, 1, .3, 1)';

  const ICON = {
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>'
  };

  /* ---------- L'arbre des portes ---------- */

  const C = L.CONTACT;
  const M = L.MAISON;
  const fig = (name, alt, cls = '', caption = '') => `
    <figure class="ph ${cls}">
      <img src="${photo(name)}" alt="${esc(alt)}" loading="lazy" decoding="async">
      ${caption ? `<figcaption>${caption}</figcaption>` : ''}
    </figure>`;
  const aRecueillir = (txt) => `<p class="a-recueillir"><span>À recueillir</span>${txt}</p>`;

  const TREE = {
    '': { titre: 'Champagne Lejeune', kind: 'tri', kids: ['vigne', 'cave', 'maison'], lecture: lectureAccueil },

    vigne: { titre: 'La Vigne', phrase: '2 cépages, 35 parcelles', photo: 'vendanges-caisses-chemin-vignes',
      alt: 'Caisses de raisins alignées sur le chemin du coteau', pos: '50% 60%', kind: 'tri',
      kids: ['vigne/chardonnay', 'vigne/pinot-noir', 'vigne/vendanges'], lecture: lectureVigne },
    'vigne/chardonnay': { titre: 'Le Chardonnay', phrase: 'La finesse et la fraîcheur', photo: 'vignes-grappes-chardonnay-dorees',
      alt: 'Grappes de chardonnay dorées au soleil', pos: '50% 45%', kind: 'leaf', lecture: lectureChardonnay },
    'vigne/pinot-noir': { titre: 'Le Pinot Noir', phrase: 'La couleur et le fruit', photo: 'vignes-grappes-pinot-feuilles-automne',
      alt: 'Grappes de pinot noir parmi les feuilles d’automne', pos: '50% 50%', kind: 'leaf', lecture: lecturePinot },
    'vigne/vendanges': { titre: 'Les Vendanges', phrase: 'En septembre, toute l’équipe', photo: 'vendanges-vendangeuse-accroupie',
      alt: 'Vendangeuse accroupie coupant le pinot noir', pos: '50% 40%', kind: 'leaf', lecture: lectureVendanges },

    cave: { titre: 'La Cave', phrase: 'Presser, assembler, attendre', photo: 'pressoir-ancien-mains-vue-dessus',
      alt: 'Vieux pressoir vu du dessus, mains sur la barre', pos: '50% 50%', kind: 'tri',
      kids: ['cave/pressoir', 'cave/tirage', 'cave/cuvees'], lecture: lectureCave },
    'cave/pressoir': { titre: 'Le Pressoir', phrase: 'Le jus de nos raisins', photo: 'pressoir-ancien-raisins-noirs',
      alt: 'Raisins noirs foulés dans le vieux pressoir, vue du dessus', pos: '50% 50%', kind: 'leaf', lecture: lecturePressoir },
    'cave/tirage': { titre: 'Le Tirage', phrase: 'Le temps en cave', photo: 'cave-tirage-caisses-bouteilles',
      alt: 'Caisses de bouteilles capsulées marquées Lejeune', pos: '50% 55%', kind: 'leaf', lecture: lectureTirage },
    'cave/cuvees': { titre: 'Les Cuvées', phrase: 'Cinq expressions d’un même terroir', photo: null, kind: 'cuvees', lecture: lectureCuvees },

    maison: { titre: 'La Maison', phrase: 'Onze générations depuis 1684', photo: 'vendanges-trois-generations-enfant',
      alt: 'Trois générations autour d’une caisse de raisins, un enfant au chapeau', pos: '50% 35%', kind: 'tri',
      kids: ['maison/1684', 'maison/1927', 'maison/aujourdhui'], lecture: lectureMaison },
    'maison/1684': { titre: '1684', phrase: 'Onze générations', photo: 'histoire-portrait-ancien-aieul',
      note: 'Portrait d’un aïeul, nom à fournir par la famille.',
      alt: 'Portrait d’un aïeul tenu à la main devant le domaine ; nom à fournir par la famille', pos: '50% 52%', kind: 'leaf', lecture: lecture1684 },
    'maison/1927': { titre: '1927', phrase: 'Le pressoir Lejeune', photo: 'histoire-pressoir-lejeune-1927',
      alt: 'Photo d’archive : le pressoir Lejeune en 1927, paniers d’osier pleins de raisins et équipe en tablier', pos: '58% 50%', fit: 'contain', kind: 'leaf', lecture: lecture1927 },
    'maison/aujourdhui': { titre: 'Aujourd’hui', phrase: 'Trois générations', photo: 'famille-trois-generations-chariot',
      alt: 'Trois générations de la famille sur le chariot élévateur, dans la cour', pos: '50% 40%', kind: 'leaf', lecture: lectureAujourdhui },

    venir: { titre: 'Venir', phrase: 'Commander, visiter, vendanger', photo: null, kind: 'tri',
      kids: ['venir/commander', 'venir/visiter', 'venir/vendanger'], lecture: lectureVenir },
    'venir/commander': { titre: 'Commander', phrase: 'Au domaine ou en retrait', photo: 'bouteilles-rose-en-main',
      alt: 'Bouteille de Brut Rosé tenue à la main', pos: '50% 45%', kind: 'form', objet: 'Commande', lecture: lectureForm },
    'venir/visiter': { titre: 'Visiter & déguster', phrase: 'Sur rendez-vous, au domaine', photo: 'degustation-comptoir-accueil',
      alt: 'Accueil au comptoir de dégustation du domaine', pos: '50% 45%', kind: 'form', objet: 'Visite & dégustation', lecture: lectureForm },
    'venir/vendanger': { titre: 'Vendanger avec nous', phrase: 'Coupeurs, porteurs, cuisiniers', photo: 'vendanges-vendangeuse-capuche-sourire',
      alt: 'Vendangeuse souriante entre les feuilles', pos: '50% 35%', kind: 'form', objet: 'Vendanges', lecture: lectureForm }
  };
  for (const c of L.CUVEES) {
    TREE['cave/cuvees/' + c.id] = { titre: c.name, phrase: c.mots, kind: 'fiche', cuvee: c.id, lecture: lectureFiche };
  }

  // Faits que le site actuel ou l'étiquette contredisent (voir CUVEES[i].aConfirmer).
  const CONTESTE = {
    'brut-reserve': ['Assemblage', 'Vieillissement'],
    rose: ['Assemblage'],
    'grande-reserve': ['Cru', 'Assemblage', 'Vieillissement']
  };
  const conteste = (id, k) => (CONTESTE[id] || []).includes(k);
  const AC = ' <em class="conf">(à confirmer)</em>';
  const PROVISOIRE = 'étiquette 2016, visuel provisoire';
  const provisoire = (id, cls = 'provisoire') => id === 'millesime' ? `<span class="${cls}">${PROVISOIRE}</span>` : '';

  const parentOf = (p) => p.split('/').slice(0, -1).join('/');
  const depth = (p) => (p ? p.split('/').length : 0);
  const href = (p) => '#/' + p;

  /* ---------- Contenus (tout vient de window.LEJEUNE) ---------- */

  function autresPortes(path) {
    const par = parentOf(path);
    const kids = TREE[par] && TREE[par].kids;
    if (!kids) return '';
    return `
      <section class="autres" aria-labelledby="autres-t">
        <h2 class="h-sec" id="autres-t">${esc(TREE[par].titre)}, les trois portes</h2>
        <div class="mini-tri">
          ${kids.map((k) => {
            const n = TREE[k];
            const here = k === path;
            const media = n.photo ? `<img src="${photo(n.photo)}" alt="" loading="lazy" decoding="async" style="object-position:${n.pos || '50% 50%'}">`
              : n.kind === 'cuvees' ? shelfMini() : '';
            const inner = `<span class="mini-media">${media}</span><span class="mini-band"><span class="mini-t">${esc(n.titre)}</span>${here ? '<span class="mini-here">Vous êtes ici</span>' : `<span class="mini-p">${esc(n.phrase)}</span>`}</span>`;
            return here ? `<div class="mini is-here" aria-current="page">${inner}</div>` : `<a class="mini" href="${href(k)}">${inner}</a>`;
          }).join('')}
        </div>
      </section>`;
  }

  function lectureAccueil() {
    const news = L.ACTUALITES;
    const affBase = news.map((n) => {
      const link = n.cuvee === 'grande-reserve' ? 'cave/cuvees/grande-reserve' : n.id === 'recrutement' ? 'venir/vendanger'
        : n.id === 'vendanges' ? 'vigne/vendanges' : 'cave/cuvees';
      const visu = n.id === 'medaille' ? `<img class="aff-bottle" src="${CUV['grande-reserve'].bouteille}" alt="" loading="lazy" decoding="async">`
        : n.id === 'recrutement' ? `<img class="aff-photo" src="${photo('vendanges-equipe-photo-groupe-coteau')}" alt="" loading="lazy" decoding="async">`
        : n.id === 'vendanges' ? `<img class="aff-photo" src="${photo('vendanges-panier-raisins-blancs')}" alt="" loading="lazy" decoding="async">`
        : `<img class="aff-photo" src="${L.RENE_LOUIS.photo}" alt="" loading="lazy" decoding="async">`;
      return `
        <a class="affiche aff-${n.id}" href="${href(link)}">
          <span class="aff-visu">${visu}</span>
          <span class="aff-txt">
            <span class="aff-t">${esc(n.titre)}</span>
            <span class="aff-date">${esc(n.date)}</span>
            <span class="aff-x">${esc(n.texte)}${n.aConfirmer ? ' <em class="conf">(à confirmer)</em>' : ''}</span>
          </span>
        </a>`;
    }).join('');

    const pops = [
      { id: 'medaille', mots: ['Médaille', 'd’or'], link: 'cave/cuvees/grande-reserve',
        visu: `<img class="pop-bottle" src="${CUV['grande-reserve'].bouteille}" alt="" loading="lazy" decoding="async">`,
        bas: 'Brut Grande Réserve · Concours Général Agricole, Paris 2026' },
      { id: 'rene-louis', mots: ['René', 'Louis'], link: 'cave/cuvees',
        visu: `<img class="pop-photo" src="${L.RENE_LOUIS.photo}" alt="" loading="lazy" decoding="async">`,
        bas: 'D’octobre à décembre · en hommage à nos grands-pères (à confirmer)' },
      { id: 'vendangeurs', mots: ['Vendan-', 'geurs'], link: 'venir/vendanger',
        visu: `<img class="pop-photo" src="${photo('vendanges-vendangeuse-coupe-grappe')}" alt="" loading="lazy" decoding="async">`,
        bas: 'Coupeurs, porteurs, cuisiniers : écrivez-nous' },
      { id: 'fetes', mots: ['Les', 'fêtes'], link: 'venir/commander',
        visu: `<img class="pop-bottle pop-b1" src="${CUV['brut-reserve'].bouteille}" alt="" loading="lazy" decoding="async"><img class="pop-bottle pop-b2" src="${CUV.rose.bouteille}" alt="" loading="lazy" decoding="async">`,
        bas: 'Pour la fin d’année, commandez au domaine' }
    ].map((p) => `
      <a class="pop pop-${p.id}" href="${href(p.link)}" aria-label="${esc(p.mots.join(''))} — ${esc(p.bas)}">
        <span class="pop-mot" aria-hidden="true">${p.mots.map((m) => `<span>${esc(m)}</span>`).join('')}</span>
        <span class="pop-visu">${p.visu}</span>
        <span class="pop-bas">${esc(p.bas)}</span>
      </a>`).join('');

    return `
      <section class="intro">
        <p class="intro-grand">Une famille de vignerons à Villers-Marmery, depuis 1684. <em>Choisissez une porte.</em></p>
        <div class="intro-x">
          <p>${esc(M.textes.histoire)}</p>
          <p>${esc(M.textes.heritage)}</p>
        </div>
      </section>
      <section class="affiches" id="affiches" aria-labelledby="affiches-t">
        <h2 class="h-sec" id="affiches-t">La vie du domaine</h2>
        <div class="aff-row aff-base">${affBase}</div>
        <div class="aff-row aff-pop">${pops}</div>
      </section>`;
  }

  function lectureVigne() {
    return `
      <section class="bloc">
        <p class="lead">${esc(M.textes.vignoble)}</p>
        <dl class="regle">
          <div><dt>${M.parcelles} parcelles</dt><dd>de 4 à 36 ares chacune, entretenues par la famille</dd></div>
          <div><dt>2 cépages</dt><dd>${M.cepages.join(' et ')}</dd></div>
          ${M.communes.map((c) => `<div><dt>${esc(c.nom)}</dt><dd>${esc(c.cru)}, ${esc(c.caractere)}</dd></div>`).join('')}
        </dl>
        <p class="labels">${M.labels.map((l) => `<span>${esc(l.nom)}</span>`).join('')}</p>
        ${aRecueillir('Le plan de nos 35 parcelles, à dessiner avec la famille : nous ne plaçons rien sans lui.')}
      </section>`;
  }

  function lectureChardonnay() {
    return `
      <section class="bloc deux">
        <div class="texte">
          <p class="lead">Avec le Pinot Noir, c’est l’un de nos deux cépages.</p>
          <p>Il apporte à nos assemblages leur fraîcheur et leur finesse : fleurs blanches et agrumes au nez du Brut Réserve, cordon fin et fruits secs dans la Grande Réserve.</p>
          <p><a class="lien" href="${href('cave/cuvees')}">Voir nos cinq cuvées ${ICON.right}</a></p>
        </div>
        <div class="photos p3">
          ${fig('vignes-grappes-chardonnay-panier', 'Grappes de chardonnay, panier de vendange en dessous')}
          ${fig('vendanges-vendangeuse-coupe-grappe', 'Vendangeuse coupant une grappe de chardonnay')}
          ${fig('vendanges-panier-raisins-blancs', 'Panier rempli de raisins blancs entre les rangs')}
        </div>
      </section>
      ${autresPortes('vigne/chardonnay')}`;
  }

  function lecturePinot() {
    return `
      <section class="bloc deux">
        <div class="texte">
          <p class="lead">Notre second cépage, le raisin noir de la Montagne de Reims.</p>
          <p>${esc(CUV.rose.desc)}</p>
          <p class="voix">Fraise des bois, groseille, framboise.</p>
          <p><a class="lien" href="${href('cave/cuvees/rose')}">Le Brut Rosé ${ICON.right}</a></p>
        </div>
        <div class="photos p2">
          ${fig('vendanges-raisins-noirs-caisses', 'Raisins noirs dans les caisses, vus du dessus')}
          ${fig('vendanges-pinot-noir-caisses-domaine', 'Deux vendangeurs et des caisses de pinot noir devant la maison')}
        </div>
      </section>
      ${autresPortes('vigne/pinot-noir')}`;
  }

  function lectureVendanges() {
    const rec = L.ACTUALITES.find((n) => n.id === 'recrutement');
    const go = L.ACTUALITES.find((n) => n.id === 'vendanges');
    return `
      <section class="bloc deux">
        <div class="texte">
          <p class="lead">${esc(go.texte)}</p>
          <p>${esc(rec.texte)}</p>
          <p><a class="btn" href="${href('venir/vendanger')}">Vendanger avec nous ${ICON.right}</a></p>
        </div>
        <div class="photos p-large">
          ${fig('vendanges-equipe-photo-groupe-coteau', 'Photo de groupe des vendangeurs sur le coteau', 'wide')}
          ${fig('vendanges-brouette-caisse-rang', 'Vendangeur poussant une brouette chargée de raisins dans le rang')}
          ${fig('vendanges-contre-jour-brouette', 'Vendangeur à contre-jour avec sa brouette')}
        </div>
      </section>
      ${autresPortes('vigne/vendanges')}`;
  }

  function lectureCave() {
    return `
      <section class="bloc">
        <p class="lead">Presser, assembler, attendre. Nos cuvées restent de trois à six ans sur lattes avant de vous rejoindre.</p>
        <table class="lattes">
          <caption>Le temps sur lattes, cuvée par cuvée</caption>
          <tbody>
            ${L.CUVEES.map((c) => {
              const v = c.facts.find((f) => f[0] === 'Vieillissement');
              const ans = v ? parseInt(v[1], 10) : 0;
              return `<tr><th scope="row"><a href="${href('cave/cuvees/' + c.id)}">${esc(c.name)}</a></th><td><span class="barre" style="--n:${ans}" aria-hidden="true"></span>${esc(v ? v[1] : '')}${conteste(c.id, 'Vieillissement') ? AC : ''}</td></tr>`;
            }).join('')}
          </tbody>
        </table>
      </section>`;
  }

  function lecturePressoir() {
    return `
      <section class="bloc deux">
        <div class="texte">
          <p class="lead">Les grappes arrivent de nos trois communes. On les trie, puis on les presse.</p>
          <p>La maison a toujours eu son pressoir : la photo d’archive de 1927 montre déjà les paniers d’osier pleins de raisins et l’équipe en tablier.</p>
          <p><a class="lien" href="${href('maison/1927')}">Le pressoir Lejeune en 1927 ${ICON.right}</a></p>
        </div>
        <div class="photos p3">
          ${fig('pressoir-ancien-jus-detail', 'Détail du vieux pressoir en bois, le jus qui s’écoule')}
          ${fig('pressoir-tri-raisins-noirs-equipe', 'L’équipe trie les raisins noirs au pressoir', 'wide')}
          ${fig('pressoir-grappes-chardonnay', 'Grappes de chardonnay chargées dans le pressoir')}
        </div>
      </section>
      ${autresPortes('cave/pressoir')}`;
  }

  function lectureTirage() {
    return `
      <section class="bloc deux">
        <div class="texte">
          <p class="lead">Après le tirage, les bouteilles se couchent sur lattes. Elles y restent de trois à six ans selon la cuvée.</p>
          <p>Trois ans pour le Brut Réserve, le Demi-Sec et le Rosé, cinq pour la Grande Réserve, six pour le Millésime 2019. <em class="conf">(Durées du Brut Réserve et de la Grande Réserve à confirmer : le site actuel en donne d’autres.)</em></p>
          <p><a class="lien" href="${href('cave/cuvees')}">Les cuvées ${ICON.right}</a></p>
        </div>
        <div class="photos p3">
          ${fig('cave-equipe-tirage-empilage', 'L’équipe empile les bouteilles en cave après le tirage', 'wide')}
          ${fig('cave-mise-en-bouteille-mains', 'Mains manipulant des bouteilles vides, palettes en fond')}
          ${fig('cave-rose-bouteilles-cage', 'Bouteilles de rosé tête en bas dans une cage')}
        </div>
      </section>
      ${autresPortes('cave/tirage')}`;
  }

  function lectureCuvees() {
    const rl = L.RENE_LOUIS;
    return `
      <section class="bloc">
        <ol class="liste-cuvees">
          ${L.CUVEES.map((c) => `
            <li><a href="${href('cave/cuvees/' + c.id)}">
              <span class="lc-n">${esc(c.name)}</span>
              <span class="lc-m">${esc(c.mots)}</span>
              <span class="lc-s">${esc(c.short)}</span>
              <span class="lc-cru">${esc(c.cru)}</span>
            </a></li>`).join('')}
        </ol>
        <div class="saison">
          ${fig('bouteilles-rene-louis-exterieur', 'Bouteille de la cuvée René Louis en extérieur')}
          <div>
            <h2 class="h-sec">La René Louis, de saison</h2>
            <p>${esc(rl.short)} Elle n’est proposée que d’octobre à décembre. <em class="conf">(D’après le site actuel, à confirmer.)</em></p>
            <p><a class="lien" href="${href('venir/commander')}">La commander ${ICON.right}</a></p>
          </div>
        </div>
      </section>
      ${autresPortes('cave/cuvees')}`;
  }

  function lectureFiche(path) {
    const c = CUV[TREE[path].cuvee];
    const i = L.CUVEES.indexOf(c);
    const others = L.CUVEES.filter((x) => x !== c);
    return `
      <section class="bloc fiche-x">
        <p class="lead">${esc(c.desc)}${conteste(c.id, 'Cru') ? AC : ''}</p>
        <dl class="faits">
          ${c.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}${conteste(c.id, k) ? AC : ''}</dd></div>`).join('')}
          <div><dt>Cru</dt><dd>${esc(c.cru)}${conteste(c.id, 'Cru') ? AC : ''}</dd></div>
        </dl>
        ${c.aConfirmer ? `<p class="a-confirmer"><span>À confirmer</span>${esc(c.aConfirmer)}</p>` : ''}
        ${c.distinction ? `<p class="distinction"><span class="or" aria-hidden="true"></span>${esc(c.distinction)}</p>` : ''}
        <div class="accords">
          <h2 class="h-sec">À table</h2>
          <p class="voix">${esc(c.accords)}</p>
        </div>
        <p class="actions"><a class="btn" href="${href('venir/commander')}?cuvee=${c.id}">Commander cette cuvée ${ICON.right}</a></p>
      </section>
      <section class="autres" aria-labelledby="autres-c">
        <h2 class="h-sec" id="autres-c">Les autres cuvées</h2>
        <ul class="autres-cuvees">
          ${others.map((o) => `<li><a href="${href('cave/cuvees/' + o.id)}"><img src="${o.bouteille}" alt="" loading="lazy" decoding="async"><span>${esc(o.name)}</span>${provisoire(o.id)}</a></li>`).join('')}
        </ul>
        <p class="pos">Cuvée ${i + 1} sur ${L.CUVEES.length}</p>
      </section>`;
  }

  function lectureMaison() {
    return `
      <section class="bloc deux">
        <div class="texte">
          <p class="lead">${esc(M.textes.histoire)}</p>
          <p>${esc(M.textes.heritage)}</p>
          <p>Propriétaires-récoltants : nous cultivons nos propres vignes et vendons nos cuvées au domaine.</p>
        </div>
        <dl class="regle court">
          <div><dt>1684</dt><dd>naissance de Sébastien Lejeune</dd></div>
          <div><dt>1927</dt><dd>le pressoir Lejeune, en photo d’archive</dd></div>
          <div><dt>Onze</dt><dd>générations de vignerons</dd></div>
        </dl>
      </section>`;
  }

  function lecture1684() {
    return `
      <section class="bloc deux">
        <div class="texte">
          <p class="lead">Sébastien Lejeune naît en 1684.</p>
          <p>${esc(M.textes.histoire)}</p>
          <p>${esc(M.textes.heritage)}</p>
        </div>
        <div class="photos p1">
          ${fig('histoire-portrait-ancien-aieul', 'Portrait d’un aïeul tenu à la main devant le domaine ; nom à fournir par la famille', '',
            'Une photo de famille, tenue devant le domaine. Le nom de cet aïeul et la date du portrait sont à recueillir auprès de la famille.')}
        </div>
      </section>
      ${autresPortes('maison/1684')}`;
  }

  function lecture1927() {
    return `
      <section class="bloc">
        ${fig('histoire-pressoir-lejeune-1927', 'Photo d’archive : le pressoir Lejeune en 1927, paniers d’osier pleins de raisins et équipe en tablier', 'archive',
          'Pressoir Lejeune, 1927. Photo d’archive de la famille.')}
        <div class="texte cote">
          <p class="lead">Les paniers d’osier pleins de raisins, les grands pressoirs de bois, l’équipe en tablier : c’est le pressoir Lejeune en 1927.</p>
          <p>Le geste n’a pas changé : on trie, on presse, on attend. <a class="lien" href="${href('cave/pressoir')}">Le pressoir aujourd’hui ${ICON.right}</a></p>
        </div>
      </section>
      ${autresPortes('maison/1927')}`;
  }

  function lectureAujourdhui() {
    return `
      <section class="bloc deux">
        <div class="texte">
          <p class="lead">Trois générations travaillent aujourd’hui au domaine.</p>
          ${aRecueillir('Le prénom et le rôle de chacun, et quelques mots de leur main.')}
          <p>Nos grands-pères, ${esc(M.grandsPeres.join(' et '))}, ont donné leur nom à la cuvée René Louis. <em class="conf">(À confirmer.)</em></p>
        </div>
        <div class="photos p2">
          ${fig('famille-trinque-rose-jardin', 'Quatre proches trinquent au rosé dans le jardin')}
          ${fig('vendanges-pere-fils-vignes', 'Père et fils dans les vignes, la veille des vendanges')}
        </div>
      </section>
      ${autresPortes('maison/aujourdhui')}`;
  }

  function coordonnees() {
    return `
      <div class="coord">
        <p class="adr">${C.adresse.map(esc).join('<br>')}</p>
        <p><a href="tel:+33326979398">${esc(C.tel)}</a> · <a href="tel:+33672425217">${esc(C.portable)}</a><br><a href="mailto:${C.email}">${esc(C.email)}</a></p>
        <p class="note">Coordonnées reprises du site actuel, à confirmer.</p>
      </div>`;
  }

  function lectureVenir() {
    return `
      <section class="bloc deux">
        <div class="texte">
          <p class="lead">${esc(M.textes.accueil)}</p>
          <p class="voix">${esc(M.textes.prevenir)}</p>
        </div>
        ${coordonnees()}
      </section>`;
  }

  const form = { objet: 'Commande', cuvee: 'brut-reserve', sent: false };

  function lectureForm(path) {
    const n = TREE[path];
    const intro = {
      'venir/commander': `<p class="lead">Il n’y a pas de boutique en ligne : dites-nous quelles cuvées et combien de bouteilles, nous revenons vers vous.</p>
        <h2 class="h-sec">Retrait</h2>
        <ul class="retraits">${C.retraits.map((r) => `<li><b>${esc(r.lieu)}</b>, ${esc(r.detail)}</li>`).join('')}<li><b>Au domaine</b>, à Villers-Marmery</li></ul>
        <p class="note">Points de retrait repris du site actuel, à confirmer.</p>`,
      'venir/visiter': `<p class="lead">${esc(M.textes.accueil)}</p><p class="voix">${esc(M.textes.prevenir)}</p>`,
      'venir/vendanger': `<p class="lead">${esc(L.ACTUALITES.find((x) => x.id === 'recrutement').texte)}</p><p>Dites-nous vos disponibilités et votre expérience : nous vous répondons avant septembre.</p>`
    }[path];
    return `
      <section class="bloc deux venir-x">
        <div class="texte">${intro}${coordonnees()}</div>
        <div class="formulaire" id="formulaire">${formHTML()}</div>
      </section>
      ${autresPortes(path)}`;
  }

  function formHTML() {
    if (form.sent) {
      return `<div class="merci" role="status"><p class="merci-t">${esc(C.merci[0])}</p><p>${esc(C.merci[1])}</p>
        <button type="button" class="lien" data-act="reform">Écrire un autre message</button></div>`;
    }
    return `
      <form id="f" novalidate>
        <fieldset class="objets">
          <legend>Votre demande</legend>
          ${C.objets.map((o) => `<label class="objet"><input type="radio" name="objet" value="${esc(o)}"${o === form.objet ? ' checked' : ''}><span>${esc(o)}</span></label>`).join('')}
        </fieldset>
        <div class="champ" id="champ-cuvee"${form.objet === 'Commande' ? '' : ' hidden'}>
          <label for="f-cuvee">Cuvée souhaitée</label>
          <select id="f-cuvee" name="cuvee">${L.CUVEES.map((c) => `<option value="${c.id}"${c.id === form.cuvee ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}<option value="rene-louis"${form.cuvee === 'rene-louis' ? ' selected' : ''}>René Louis (de saison)</option></select>
        </div>
        <div class="champs2">
          <div class="champ"><label for="f-nom">Nom</label><input id="f-nom" name="nom" autocomplete="name" required></div>
          <div class="champ"><label for="f-mail">Courriel</label><input id="f-mail" name="email" type="email" autocomplete="email" required></div>
        </div>
        <div class="champ"><label for="f-msg">Message</label><textarea id="f-msg" name="message" rows="5" placeholder="${esc(C.placeholders[form.objet])}"></textarea></div>
        <p class="erreur" id="f-err" hidden>Indiquez votre nom et un courriel valide pour que nous puissions vous répondre.</p>
        <button class="btn plein" type="submit">Envoyer la demande ${ICON.right}</button>
        <p class="note">Rien n’est encore envoyé depuis cette maquette.</p>
      </form>`;
  }

  /* ---------- Portes, héros, fiche ---------- */

  function shelfMini() {
    return `<span class="shelf-mini">${L.CUVEES.map((c) => `<img src="${c.bouteille}" alt="" loading="lazy" decoding="async">`).join('')}</span>`;
  }

  function splitHTML(parentPath, i) {
    const p = TREE[parentPath];
    const bg = p && p.photo ? `background-image:url('${photo(p.photo)}');background-position:${p.pos || '50% 50%'}` : '';
    return `<span class="door-split" aria-hidden="true"><i style="--i:${i};${bg}"></i></span>`;
  }

  function doorHTML(path, i, parentPath) {
    const n = TREE[path];
    const media = n.photo ? `<img class="door-img" src="${photo(n.photo)}" alt="" decoding="async" style="object-position:${n.pos || '50% 50%'}">`
      : n.kind === 'cuvees' ? `<span class="door-img door-shelf">${shelfMini()}</span>` : '';
    return `
      <a class="door" href="${href(path)}" data-path="${path}" style="--i:${i}">
        <span class="door-media">${splitHTML(parentPath, i)}${media}</span>
        <span class="door-band">
          <h2 class="door-title">${esc(n.titre)}</h2>
          <span class="door-phrase">${esc(n.phrase)}</span>
          <span class="door-go" aria-hidden="true">${ICON.right}</span>
        </span>
      </a>`;
  }

  function stageHTML(path) {
    const n = TREE[path];
    if (n.kind === 'tri') {
      return `<h1 class="vh" id="level-title" tabindex="-1">${esc(path ? n.titre : 'Champagne Lejeune Père & Fils')}</h1>
        <div class="tri">${n.kids.map((k, i) => doorHTML(k, i, path)).join('')}</div>`;
    }
    if (n.kind === 'fiche') return ficheHTML(path);
    const par = parentOf(path);
    const media = n.kind === 'cuvees'
      ? `<div class="shelf" role="list">${L.CUVEES.map((c, i) => `
          <a class="shelf-b" role="listitem" href="${href('cave/cuvees/' + c.id)}" data-id="${c.id}" style="--i:${i}">
            <img src="${c.bouteille}" alt="" decoding="async"><span class="shelf-lab"><span class="shelf-n">${esc(c.name)}</span>${provisoire(c.id, 'provisoire shelf-p')}</span>
          </a>`).join('')}</div>`
      : `<img class="hero-img${n.fit === 'contain' ? ' is-contain' : ''}" src="${photo(n.photo)}" alt="${esc(n.alt)}" decoding="async" style="object-position:${n.fit === 'contain' ? '50% 50%' : n.pos || '50% 50%'}">`;
    return `
      <div class="hero hero-${n.kind}">
        <div class="hero-media">${media}</div>
        <div class="hero-band">
          <h1 class="hero-title" id="level-title" tabindex="-1">${esc(n.titre)}</h1>
          <p class="hero-phrase">${esc(n.phrase)}${n.note ? `<span class="hero-note">${esc(n.note)}</span>` : ''}</p>
          <a class="up" href="${href(par)}">${ICON.up}<span>Revenir à ${esc(TREE[par].titre)}</span></a>
        </div>
      </div>`;
  }

  function ficheHTML(path) {
    const c = CUV[TREE[path].cuvee];
    const i = L.CUVEES.indexOf(c);
    const prev = L.CUVEES[(i - 1 + L.CUVEES.length) % L.CUVEES.length];
    const next = L.CUVEES[(i + 1) % L.CUVEES.length];
    return `
      <div class="fiche" data-id="${c.id}">
        <div class="fiche-cols">
          ${c.tasting.map(([k, v], j) => `
            <div class="fiche-col" style="--i:${j}">
              <h2 class="fiche-k">${{ 'Œil': 'L’œil', 'Nez': 'Le nez', 'Bouche': 'La bouche' }[k] || esc(k)}</h2>
              <p class="fiche-v">${esc(v)}</p>
            </div>`).join('')}
          <div class="fiche-bottle"><img src="${c.bouteille}" alt="${esc(c.name)}, bouteille couchée" decoding="async"></div>
          ${provisoire(c.id, 'provisoire fiche-p')}
        </div>
        <div class="fiche-band">
          <div class="fiche-id">
            <h1 class="fiche-name" id="level-title" tabindex="-1">${esc(c.name)}</h1>
            <p class="fiche-meta"><span>${esc(c.cru)}${conteste(c.id, 'Cru') ? ' (à confirmer)' : ''}</span><span>${esc(c.mots)}</span></p>
          </div>
          <div class="fiche-nav">
            <a class="fnav" href="${href('cave/cuvees/' + prev.id)}" aria-label="Cuvée précédente : ${esc(prev.name)}">${ICON.left}</a>
            <a class="fnav" href="${href('cave/cuvees/' + next.id)}" aria-label="Cuvée suivante : ${esc(next.name)}">${ICON.right}</a>
            <a class="up" href="${href('cave/cuvees')}">${ICON.up}<span>Les cuvées</span></a>
          </div>
        </div>
      </div>`;
  }

  /* ---------- En-tête : pictogramme et fil ---------- */

  function pictoSVG(n, lit, venir) {
    const w = 10, g = 3;
    const cells = Array.from({ length: n }, (_, k) =>
      `<rect x="${k * (w + g) + .5}" y=".5" width="${w}" height="16" ${k === lit ? 'class="on"' : ''}/>`).join('');
    const v = venir ? `<rect x="${n * (w + g) + .5}" y=".5" width="4" height="16" ${lit === n ? 'class="on"' : ''}/>` : '';
    const total = n * (w + g) + (venir ? 5 : -g + 1);
    return `<svg viewBox="0 0 ${total} 17" width="${total * 1.6}" height="${17 * 1.6}" aria-hidden="true">${cells}${v}</svg>`;
  }

  function renderHeader(path) {
    const segs = path ? path.split('/') : [];
    const rows = [];
    let prefix = '';
    for (let k = 0; k <= segs.length; k++) {
      const node = TREE[prefix];
      if (!node || node.kind !== 'tri') break;
      const seg = segs[k];
      const child = seg !== undefined ? (prefix ? prefix + '/' + seg : seg) : null;
      let lit = child ? node.kids.indexOf(child) : -1;
      if (prefix === '' && child === 'venir') lit = 3;
      rows.push({ prefix, lit, n: node.kids.length, venir: prefix === '', current: child === null });
      if (!child) break;
      prefix = child;
    }
    $('#picto').innerHTML = rows.map((r) => {
      const label = r.current ? `Vous êtes ici : ${TREE[r.prefix].titre}` : `Remonter à ${r.prefix ? TREE[r.prefix].titre : 'l’accueil'}`;
      const svg = pictoSVG(r.n, r.lit, r.venir);
      return r.current ? `<span class="picto-row is-current" aria-label="${esc(label)}" role="img">${svg}</span>`
        : `<a class="picto-row" href="${href(r.prefix)}" aria-label="${esc(label)}" title="${esc(label)}">${svg}</a>`;
    }).join('<span class="picto-sep" aria-hidden="true"></span>');

    const crumbs = [];
    let acc = '';
    for (const s of segs) {
      acc = acc ? acc + '/' + s : s;
      crumbs.push(acc);
    }
    $('#top').classList.toggle('has-crumbs', crumbs.length > 0);
    $('#crumbs').innerHTML = crumbs.map((p, k) => k === crumbs.length - 1
      ? `<li><span class="crumb is-last" aria-current="page">${esc(TREE[p].titre)}</span></li>`
      : `<li><a class="crumb" href="${href(p)}">${esc(TREE[p].titre)}</a></li>`).join('');
  }

  /* ---------- Rendu ---------- */

  const stage = $('#stage');
  const inner = $('#stage-inner');
  const lecture = $('#lecture');
  const venirDoor = $('#venir-door');
  let current = null;

  function render(path, opts = {}) {
    const n = TREE[path];
    current = path;
    renderHeader(path);
    stage.dataset.kind = n.kind;
    inner.className = 'stage-inner' + (opts.merged ? ' is-merged' : '');
    inner.innerHTML = stageHTML(path);
    lecture.innerHTML = n.lecture(path);
    venirDoor.classList.toggle('is-here', path === 'venir' || path.startsWith('venir/'));
    venirDoor.setAttribute('aria-current', path.startsWith('venir') ? 'page' : 'false');
    document.title = (path ? n.titre + ' · ' : '') + 'Champagne Lejeune Père & Fils';
    if (n.kind === 'form') bindForm(path);
  }

  function focusTitle() {
    const t = $('#level-title');
    if (t) t.focus({ preventScroll: true });
  }

  /* ---------- Mouvements ---------- */

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const rectKF = (r) => ({ left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
  const motion = () => !reduceQ.matches;

  function bandH() {
    return parseFloat(getComputedStyle(stage).getPropertyValue('--band')) || 0;
  }
  // Zone des photos : la scène moins la bande bleue des titres.
  function mediaArea() {
    const r = stage.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: Math.max(0, r.height - bandH()) };
  }

  function makeGhost(path, r) {
    const n = TREE[path] || {};
    const g = document.createElement('div');
    g.className = 'ghost' + (n.photo ? '' : n.kind === 'cuvees' ? ' ghost-craie' : ' ghost-bleu');
    if (n.photo) {
      g.style.backgroundImage = `url('${photo(n.photo)}')`;
      g.style.backgroundPosition = n.pos || '50% 50%';
    }
    if (n.fit === 'contain') g.classList.add('ghost-contain');
    Object.assign(g.style, rectKF(r));
    document.body.appendChild(g);
    return g;
  }

  // Le nouveau titre arrive dans le fil d'Ariane.
  function flipCrumb(fromRect) {
    const last = $('.crumb.is-last');
    if (!last || !fromRect) return;
    // Le titre se pose dans le fil en glissant sur sa propre ligne (jamais au-dessus des photos) ;
    // son « / » n'apparaît qu'à l'arrivée.
    const li = last.closest('li');
    li.classList.add('is-arriving');
    const a = last.animate([
      { transform: 'translateX(-28px)', opacity: 0 },
      { transform: 'none', opacity: 1 }
    ], { duration: 650, easing: EASE_OUT });
    const done = () => li.classList.remove('is-arriving');
    a.finished.then(done, done);
  }

  async function zoomIn(to, source) {
    const isVenir = source === venirDoor;
    const media = isVenir ? venirDoor : source.querySelector('.door-media');
    const r0 = media.getBoundingClientRect();
    const r1 = mediaArea();
    const ghost = makeGhost(to, r0);
    const title = isVenir ? $('.venir-word') : source.querySelector('.door-title');
    const tr = title.getBoundingClientRect();
    const tSize = parseFloat(getComputedStyle(title).fontSize);
    if (!isVenir) media.style.visibility = 'hidden';

    const doors = $$('.door', inner);
    const idx = doors.indexOf(source);
    const vertical = mobileQ.matches;
    const anims = [];
    doors.forEach((d, i) => {
      if (d === source) {
        anims.push(d.querySelector('.door-band').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: 'forwards' }));
        return;
      }
      const dir = idx === -1 ? -1 : i < idx ? -1 : 1;
      const t = vertical ? `translateY(${dir * 115}%)` : `translateX(${dir * 115}%)`;
      anims.push(d.animate([{ transform: 'none', opacity: 1 }, { transform: t, opacity: .2 }], { duration: 640, easing: EASE, fill: 'forwards' }));
    });
    const hero = $('.hero, .fiche', inner);
    if (hero) anims.push(hero.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }));
    anims.push(ghost.animate([rectKF(r0), rectKF(r1)], { duration: 820, easing: EASE, fill: 'forwards' }));
    lecture.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' });
    await Promise.all(anims.map((a) => a.finished));

    render(to, { merged: true });
    lecture.getAnimations().forEach((a) => a.cancel());
    void inner.offsetWidth;
    requestAnimationFrame(() => {
      inner.classList.remove('is-merged');
      ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: 'forwards' }).finished.then(() => ghost.remove());
    });
    lecture.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 350, easing: EASE_OUT, fill: 'backwards' });
    flipCrumb(tr, tSize);
  }

  async function zoomOut(from, to) {
    // 1. Les trois portes se referment sur la photo d'où l'on vient.
    inner.classList.add('is-merged');
    lecture.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: 'forwards' });
    await wait(TREE[from].kind === 'tri' ? 420 : 200);
    const r1 = mediaArea();
    const ghost = makeGhost(from, r1);

    // 2. On revient au niveau du dessus : la photo rapetisse jusqu'à sa porte, les voisines reviennent.
    render(to);
    lecture.getAnimations().forEach((a) => a.cancel());
    const isVenir = from === 'venir';
    const door = isVenir ? null : $(`.door[data-path="${from}"]`, inner);
    const target = isVenir ? venirDoor : door && door.querySelector('.door-media');
    if (!target) { ghost.remove(); return; }
    const r0 = target.getBoundingClientRect();
    if (!isVenir) target.style.visibility = 'hidden';
    const doors = $$('.door', inner);
    const idx = doors.indexOf(door);
    const vertical = mobileQ.matches;
    const anims = [ghost.animate([rectKF(r1), rectKF(r0)], { duration: 780, easing: EASE, fill: 'forwards' })];
    doors.forEach((d, i) => {
      if (d === door) {
        d.querySelector('.door-band').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 420, fill: 'backwards' });
        return;
      }
      const dir = idx === -1 ? 1 : i < idx ? -1 : 1;
      const t = vertical ? `translateY(${dir * 115}%)` : `translateX(${dir * 115}%)`;
      anims.push(d.animate([{ transform: t, opacity: .2 }, { transform: 'none', opacity: 1 }], { duration: 760, easing: EASE, fill: 'backwards' }));
    });
    lecture.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 500, fill: 'backwards' });
    await Promise.all(anims.map((a) => a.finished));
    target.style.visibility = '';
    ghost.remove();
  }

  // De la rangée de bouteilles à la fiche : la bouteille choisie se couche à cheval sur les trois colonnes.
  async function bottleIn(to, standing) {
    const r0 = standing.getBoundingClientRect();
    render(to);
    const img = $('.fiche-bottle img', inner);
    if (!img) return;
    const r1 = img.getBoundingClientRect();
    const T = img.offsetWidth, Lh = img.offsetHeight;
    const g = img.cloneNode();
    g.className = 'ghost-bottle';
    const cx0 = r0.left + r0.width / 2, cy0 = r0.top + r0.height / 2;
    const cx1 = r1.left + r1.width / 2, cy1 = r1.top + r1.height / 2;
    Object.assign(g.style, { left: cx0 - T / 2 + 'px', top: cy0 - Lh / 2 + 'px', width: T + 'px', height: Lh + 'px' });
    document.body.appendChild(g);
    img.style.visibility = 'hidden';
    const s0 = r0.height / Lh;
    const a = g.animate([
      { transform: `translate(0, 0) scale(${s0}) rotate(0deg)` },
      { transform: `translate(${cx1 - cx0}px, ${cy1 - cy0}px) scale(1) rotate(90deg)` }
    ], { duration: 900, easing: EASE, fill: 'forwards' });
    $$('.fiche-col, .fiche-band > *', inner).forEach((el, i) =>
      el.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 380 + i * 70, easing: EASE_OUT, fill: 'backwards' }));
    lecture.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: 600, fill: 'backwards' });
    await a.finished;
    img.style.visibility = '';
    g.remove();
  }

  function crossfade(to, dir = 0) {
    render(to);
    if (!motion()) return;
    inner.animate([{ opacity: 0, transform: dir ? `translateX(${dir * 40}px)` : 'scale(1.02)' }, { opacity: 1, transform: 'none' }], { duration: 560, easing: EASE_OUT });
    lecture.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: 120, easing: EASE_OUT, fill: 'backwards' });
  }

  /* ---------- Routeur ---------- */

  let busy = false;
  let lastSource = null;

  function parseHash() {
    const raw = location.hash.replace(/^#\/?/, '');
    const [p, q] = raw.split('?');
    const path = (p || '').replace(/\/+$/, '');
    const query = new URLSearchParams(q || '');
    return { path, query };
  }

  async function navigate() {
    const { path: asked, query } = parseHash();
    let path = asked === 'actualites' ? '' : asked;
    if (!(path in TREE)) path = '';
    if (query.get('cuvee')) form.cuvee = query.get('cuvee');
    if (TREE[path].kind === 'form') { form.objet = TREE[path].objet; form.sent = false; }
    if (path === current && !query.get('cuvee')) return;
    if (busy) { pending = true; return; }

    const from = current;
    const source = lastSource;
    lastSource = null;

    if (from === null || !motion()) {
      render(path);
      if (from !== null) { window.scrollTo(0, 0); focusTitle(); }
      if (asked === 'actualites') $('#affiches').scrollIntoView();
      return;
    }

    busy = true;
    const scrolled = window.scrollY > 4;
    if (scrolled) window.scrollTo(0, 0);
    try {
      const isChild = parentOf(path) === from;
      const isParent = parentOf(from) === path;
      if (isChild && !scrolled && TREE[from].kind === 'tri') {
        const src = path === 'venir' ? venirDoor : $(`.door[data-path="${path}"]`, inner);
        if (src) await zoomIn(path, src); else crossfade(path);
      } else if (path === 'venir' && source === venirDoor) {
        await zoomIn(path, venirDoor);
      } else if (isChild && TREE[from].kind === 'cuvees' && source && source.closest('.shelf-b')) {
        await bottleIn(path, source.closest('.shelf-b').querySelector('img'));
      } else if (isParent && TREE[path].kind === 'tri') {
        await zoomOut(from, path);
      } else if (TREE[path].kind === 'fiche' && TREE[from].kind === 'fiche') {
        const a = L.CUVEES.findIndex((c) => c.id === TREE[from].cuvee);
        const b = L.CUVEES.findIndex((c) => c.id === TREE[path].cuvee);
        crossfade(path, b > a ? 1 : -1);
      } else {
        crossfade(path);
      }
    } finally {
      busy = false;
      focusTitle();
      if (asked === 'actualites') $('#affiches').scrollIntoView({ behavior: 'smooth' });
      if (pending) { pending = false; navigate(); }
    }
  }
  let pending = false;

  // On retient la porte cliquée (pour zoomer depuis elle, y compris la porte Venir).
  document.addEventListener('click', (e) => {
    if (!(e.target instanceof Element)) return;
    const a = e.target.closest('a[href^="#/"]');
    if (a) lastSource = a;
    const act = e.target.closest('[data-act]');
    if (act && act.dataset.act === 'reform') { form.sent = false; $('#formulaire').innerHTML = formHTML(); bindForm(current); }
  });

  window.addEventListener('hashchange', navigate);

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || (e.target instanceof Element && e.target.closest('input, textarea, select'))) return;
    if (!current) return;
    location.hash = href(parentOf(current));
  });

  /* ---------- Formulaire ---------- */

  function bindForm() {
    const f = $('#f');
    if (!f) return;
    f.addEventListener('change', (e) => {
      if (e.target.name === 'objet') {
        form.objet = e.target.value;
        $('#champ-cuvee').hidden = form.objet !== 'Commande';
        $('#f-msg').placeholder = C.placeholders[form.objet];
      }
      if (e.target.name === 'cuvee') form.cuvee = e.target.value;
    });
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = f.nom.value.trim() && /\S+@\S+\.\S+/.test(f.email.value);
      $('#f-err').hidden = !!ok;
      if (!ok) { (f.nom.value.trim() ? f.email : f.nom).focus(); return; }
      form.sent = true;
      $('#formulaire').innerHTML = formHTML();
      const merci = $('.merci');
      merci.setAttribute('tabindex', '-1');
      merci.focus();
    });
  }

  /* ---------- Pied de page : plan du site, coordonnées, LEJEUNE ---------- */

  function renderPied() {
    const col = (p) => `
      <div class="plan-col">
        <a class="plan-t" href="${href(p)}">${esc(TREE[p].titre)}</a>
        <ul>${TREE[p].kids.map((k) => `<li><a href="${href(k)}">${esc(TREE[k].titre)}</a>${k === 'cave/cuvees'
          ? `<ul>${L.CUVEES.map((c) => `<li><a href="${href('cave/cuvees/' + c.id)}">${esc(c.name)}</a></li>`).join('')}</ul>` : ''}</li>`).join('')}</ul>
      </div>`;
    $('#pied').innerHTML = `
      <nav class="plan" aria-label="Plan du site">
        ${['vigne', 'cave', 'maison', 'venir'].map(col).join('')}
        <div class="plan-col">
          <a class="plan-t" href="#/actualites">Actualités</a>
          <ul>${L.ACTUALITES.map((n) => `<li><a href="#/actualites">${esc(n.titre)}</a></li>`).join('')}</ul>
        </div>
      </nav>
      <div class="pied-info">
        <p><b>${esc(C.raison)}</b><br>${esc(C.mention)}<br>${C.adresse.map(esc).join(', ')}</p>
        <p><a href="tel:+33326979398">${esc(C.tel)}</a> · <a href="mailto:${C.email}">${esc(C.email)}</a> · Instagram ${esc(C.instagram)}<br><span class="note">Coordonnées à confirmer.</span></p>
        <p>${M.labels.map((l) => esc(l.nom)).join(' · ')}</p>
      </div>
      <p class="evin">${esc(C.evin)}</p>
      <div class="geant" aria-hidden="true"><span id="geant">Lejeune</span></div>`;
  }

  // LEJEUNE pile à la largeur de la colonne.
  function fitGeant() {
    const el = $('#geant');
    if (!el) return;
    const box = el.parentElement;
    el.style.fontSize = '100px';
    const w = el.getBoundingClientRect().width;
    if (w) el.style.fontSize = (100 * box.clientWidth / w) + 'px';
  }

  /* ---------- Langue ---------- */

  let toastT = 0;
  $$('.lang-b').forEach((b) => b.addEventListener('click', () => {
    const en = b.dataset.lang === 'en';
    const t = $('#toast');
    clearTimeout(toastT);
    t.hidden = !en;
    if (en) {
      t.textContent = C.langueNote;
      toastT = setTimeout(() => { t.hidden = true; }, 3600);
    }
  }));

  /* ---------- Départ ---------- */

  renderPied();
  navigate();
  if (document.fonts) document.fonts.ready.then(fitGeant);
  fitGeant();
  new ResizeObserver(fitGeant).observe($('#pied'));
})();
