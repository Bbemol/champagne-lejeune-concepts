'use strict';
/* Contenu commun aux cinq concepts. Faits repris de js/app.js (fiches cuvées) et de PRODUCT.md.
   Ce qui vient du site actuel (2019) et reste à confirmer porte `aConfirmer: true`.
   Chemins relatifs à un dossier de concept (concepts/<n>/). */
(() => {
  const S = '../shared/';
  const photo = (name) => S + 'photos/' + name + '.jpg';

  // `aConfirmer` : désaccord visible entre la fiche, l'étiquette et le site actuel ; à afficher discrètement
  // dans la fiche (le visiteur doit le voir), tant que la famille n'a pas tranché.
  const CUVEES = [
    { id: 'brut-reserve', name: 'Brut Réserve', cru: 'Premier Cru', mots: 'Vif & floral',
      bouteille: S + 'bouteilles/brut-reserve.webp',
      short: 'Vif et floral, la signature de la maison.',
      desc: "Notre cuvée emblématique. Un assemblage équilibré de Chardonnay et de Pinot Noir issus de nos parcelles Premier Cru, patiemment élevé en cave pour révéler finesse et fraîcheur.",
      facts: [['Assemblage', 'Chardonnay & Pinot Noir'], ['Dosage', 'Brut'], ['Vieillissement', '3 ans sur lattes'], ['Service', '8 – 10 °C']],
      tasting: [['Œil', 'Or pâle, bulles fines et persistantes'], ['Nez', 'Fleurs blanches, agrumes, brioche légère'], ['Bouche', 'Fraîche et ronde, finale saline']],
      accords: "À l'apéritif, avec des gougères ou des huîtres.",
      aConfirmer: "Le site actuel indique 85 % Chardonnay, 15 % Pinot Noir et deux à trois ans en cave : à confirmer par la famille." },
    { id: 'demi-sec', name: 'Demi-Sec Réserve', cru: 'Premier Cru', mots: 'Rond & gourmand',
      bouteille: S + 'bouteilles/demi-sec.webp',
      short: 'Tout en rondeur et en gourmandise.',
      desc: "Une bulle douce et soyeuse, pensée pour les moments gourmands. Le même assemblage que notre Brut Réserve, avec un dosage plus généreux.",
      facts: [['Assemblage', 'Chardonnay & Pinot Noir'], ['Dosage', 'Demi-sec'], ['Vieillissement', '3 ans sur lattes'], ['Service', '6 – 8 °C']],
      tasting: [['Œil', 'Or soutenu, mousse onctueuse'], ['Nez', 'Fruits mûrs, miel, pâte de coing'], ['Bouche', 'Ample et suave, belle fraîcheur']],
      accords: 'Foie gras, tarte aux fruits, desserts peu sucrés.' },
    { id: 'rose', name: 'Brut Rosé', cru: 'Premier Cru', mots: 'Croquant & fruité',
      bouteille: S + 'bouteilles/rose.webp',
      short: 'Fruits rouges et robe lumineuse.',
      desc: "Un rosé d'assemblage délicat, où le Pinot Noir de nos coteaux apporte couleur et fruit. Toute l'élégance d'une fin d'après-midi d'été.",
      facts: [['Assemblage', 'Chardonnay & Pinot Noir'], ['Dosage', 'Brut'], ['Vieillissement', '3 ans sur lattes'], ['Service', '8 – 10 °C']],
      tasting: [['Œil', 'Rose saumoné, reflets cuivrés'], ['Nez', 'Fraise des bois, groseille, framboise'], ['Bouche', 'Croquante et fruitée, finale fraîche']],
      accords: 'Saumon gravlax, cuisine asiatique, tarte aux fraises.',
      aConfirmer: "Le site actuel indique 55 % Pinot Noir, 35 % Chardonnay et 10 % de vin rouge d'Ambonnay : assemblage à confirmer par la famille." },
    { id: 'grande-reserve', name: 'Brut Grande Réserve', cru: 'Grand Cru', mots: 'Ample & ciselé',
      bouteille: S + 'bouteilles/grande-reserve.webp',
      // L'étiquette du détourage indique « Blanc de Blancs · Premier Cru » : à arbitrer avec la famille.
      short: 'La profondeur et la noblesse du Grand Cru.',
      desc: "Issue de nos parcelles Grand Cru de Verzy et d'Ambonnay, cette cuvée bénéficie d'une longue maturation qui lui donne complexité et vinosité.",
      facts: [['Assemblage', 'Chardonnay & Pinot Noir'], ['Dosage', 'Brut'], ['Vieillissement', '5 ans sur lattes'], ['Service', '10 – 12 °C']],
      tasting: [['Œil', 'Or lumineux, cordon fin'], ['Nez', 'Fruits secs, pain grillé, notes beurrées'], ['Bouche', 'Structurée et ample, longue finale']],
      accords: 'Volaille de Bresse, homard, risotto aux morilles.',
      distinction: "Médaille d'Or, Concours Général Agricole de Paris 2026",
      aConfirmer: "L'étiquette de la bouteille indique « Blanc de Blancs · Premier Cru » et le site actuel 100 % Chardonnay, 4 ans en cave : cru, assemblage et durée à confirmer par la famille." },
    { id: 'millesime', name: 'Millésime 2019', cru: 'Grand Cru · Millésimé', mots: 'Riche & racé',
      bouteille: S + 'bouteilles/millesime.webp', // étiquette 2016 sur le détourage : à remplacer
      short: "L'expression d'une seule année d'exception.",
      desc: "Une cuvée produite seulement les grandes années. 2019 a donné des raisins d'une maturité rare, que nous avons laissés vieillir longuement en cave.",
      facts: [['Assemblage', 'Chardonnay & Pinot Noir'], ['Année', '2019'], ['Vieillissement', '6 ans sur lattes'], ['Service', '10 – 12 °C']],
      tasting: [['Œil', 'Or profond, bulles très fines'], ['Nez', 'Fruits jaunes, épices douces, moka'], ['Bouche', 'Riche et racée, grande persistance']],
      accords: 'Plats truffés, Comté 24 mois, Saint-Jacques snackées.',
      aConfirmer: "La bouteille montrée porte l'étiquette du millésime 2016 : photo du 2019 à fournir." }
  ];

  // Cuvée de saison, d'après le site actuel (à confirmer) : vendue d'octobre à décembre.
  const RENE_LOUIS = {
    id: 'rene-louis', name: 'René Louis', saison: [10, 11, 12], aConfirmer: true,
    short: 'Chardonnay et Pinot Noir à parts égales, en hommage à nos grands-pères René Lejeune et Louis Billiot.',
    photo: photo('bouteilles-rene-louis-exterieur'),
    photoSalon: photo('degustation-rene-louis-salon')
  };
  const enSaison = (d = new Date()) => RENE_LOUIS.saison.includes(d.getMonth() + 1);

  const ACTUALITES = [
    { id: 'medaille', tag: 'Distinction', date: 'Mars 2026', titre: "Médaille d'Or à Paris", cuvee: 'grande-reserve',
      texte: 'Notre Brut Grande Réserve a été distingué au Concours Général Agricole de Paris.' },
    { id: 'recrutement', tag: 'Recrutement', date: 'Août 2026', titre: 'Vendanges 2026\u00a0: nous recrutons', lieu: 'vendanges',
      texte: 'Coupeurs, porteurs, cuisiniers : nous constituons nos équipes pour la récolte de septembre.' },
    { id: 'vendanges', tag: 'Au domaine', date: 'Sept. 2025', titre: 'Les vendanges ont commencé', lieu: 'vendanges',
      texte: 'Le raisin est à maturité : la récolte démarre sur nos trois communes.' },
    { id: 'rene-louis', tag: 'De saison', date: 'Octobre à décembre', titre: 'La René Louis est de retour', cuvee: 'rene-louis', aConfirmer: true,
      texte: "Notre cuvée d'hommage aux grands-pères, Chardonnay et Pinot Noir à parts égales, n'est proposée qu'en fin d'année." }
  ];

  const MAISON = {
    depuis: 1684, fondateur: 'Sébastien Lejeune', generations: 11, generationsTexte: 'onze',
    parcelles: 35, parcellesAres: 'de 4 à 36 ares', cepages: ['Chardonnay', 'Pinot Noir'],
    communes: [
      { nom: 'Villers-Marmery', cru: 'Premier Cru', caractere: 'la finesse crayeuse' },
      { nom: 'Verzy', cru: 'Grand Cru', caractere: 'la puissance' },
      { nom: 'Ambonnay', cru: 'Grand Cru', caractere: 'la générosité' }
    ],
    labels: [
      { id: 'hve', nom: 'Haute Valeur Environnementale', court: 'HVE' },
      { id: 'vdc', nom: 'Viticulture Durable en Champagne', court: 'VDC' },
      { id: 'vi', nom: 'Vignerons Indépendants', court: 'Vignerons Indépendants' }
    ],
    grandsPeres: ['René Lejeune', 'Louis Billiot'],
    textes: {
      histoire: 'Depuis Sébastien Lejeune, né en 1684, onze générations de vignerons se sont transmis les traditions et le savoir-faire de la maison.',
      heritage: 'Fruit de cet héritage familial, nos champagnes sont le reflet de notre passion pour la vigne et le vin.',
      vignoble: 'Notre vignoble s\'étend sur trois communes classées Premier Cru et Grand Cru : la finesse crayeuse de Villers-Marmery, la puissance de Verzy, la générosité d\'Ambonnay.',
      accueil: 'Vente au domaine, visites et dégustations sur rendez-vous, au cœur de nos vignes de Villers-Marmery.',
      prevenir: 'Prévenez-nous de votre passage, si possible quelques jours à l\'avance.'
    },
    // Ce que seule la famille peut fournir : affiché comme emplacement, jamais inventé.
    aRecueillir: ['prénoms et rôles de la famille d\'aujourd\'hui', 'paroles de la famille', 'plan des parcelles', 'plans vidéo']
  };

  const CONTACT = {
    raison: 'Champagne Lejeune Père & Fils', mention: 'Propriétaires-Récoltants',
    adresse: ['67, avenue de Champagne', '51380 Villers-Marmery'],
    tel: '03 26 97 93 98', portable: '06 72 42 52 17', email: 'champagne.lejeunepf@orange.fr',
    instagram: '@champagnelejeune', aConfirmer: true,
    retraits: [
      { lieu: 'Reims', detail: 'retrait chez Arnaud Lejeune' },
      { lieu: 'Bretagne', detail: "dépôt dans le secteur d'Auray et Crach (56)" }
    ],
    objets: ['Commande', 'Visite & dégustation', 'Vendanges', 'Autre'],
    placeholders: {
      'Commande': 'Quantité, date souhaitée…',
      'Visite & dégustation': 'Nombre de personnes, dates…',
      'Vendanges': 'Vos disponibilités, votre expérience…',
      'Autre': 'Votre message'
    },
    merci: ['Merci.', 'Votre message a bien été transmis. Nous vous répondrons dans les meilleurs délais.'],
    evin: "L'abus d'alcool est dangereux pour la santé. À consommer avec modération.",
    langueNote: 'English version coming soon. La traduction est en préparation.'
  };

  window.LEJEUNE = { CUVEES, RENE_LOUIS, enSaison, ACTUALITES, MAISON, CONTACT, photo, shared: S };
})();
