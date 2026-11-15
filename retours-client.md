# Retours client sur les 5 concepts — Champagne Lejeune

Réunion client du 14 novembre 2026. Ce document sert de brief pour la prochaine itération.

## Décision

Le client garde le **concept 2, « Le carnet de la maison »** (`2-vue-cavaliere/`), et y ajoute des éléments du **concept 4, « Nuancier »**, surtout pour la mise en valeur des bouteilles. Les concepts 1, 3 et 5 sont écartés.

## Ce qu'on aime et on garde

- La carte du domaine comme porte d'entrée du concept 2.
- La carte qui est blanche puis qui se dévoile aux clics sur les éléments
- Le petit clin d'œil de la fenêtre sur la carte, dans un coin de la maison (lorsqu'on est sur la page la maison): à garder comme « easter egg ». Qui ouvre une modale avec la fenêtre avec vue sur les vignes.
- Dans la fiche d'une cuvée : l'illustration en arrière-plan, les couleurs et les descriptions.
- Du concept 4 : les bouteilles bien visibles et mises en avant.
- Sur mobile : les trois boutons en bas de l'écran.
- Sur bureau : le mot « Légende », qui joue sur le fait que c'est une carte.
- La croix pour quitter une page : suffisante, il n'y a pas besoin d'un lien « retour à la carte » plus visible.

## Ce qu'on aime mais pas obligé de garder

- Du concept 3, l'illustration caisse.png
- Du concept 3, l'illustration sarment.png qui s'affiche au fur et à mesure du scroll

## Ce qu'on n'aime pas

- Trop d'actualités punaisées directement sur la carte.
- Dans "la maison", le lien "Regarder par la fenêtre de la maison", on retire
- Le fond « carnet » des pages qui s'ouvrent : trop marqué.
- Le mot « cave » pour la page des cuvées, et son illustration en coupe avec galeries cliquables : trop décoratif, les bouteilles passent au second plan.
- La liste des cuvées actuelle : on ne voit pas assez les bouteilles.
- Le retour d'une fiche cuvée vers la liste des bouteilles : à retravailler.
- L'illustration de fond de la carte : ce n'est pas la bonne photo de départ, elle est à refaire.
- Le titre « Lejeune, carnet du domaine » : pas assez officiel, et il est incliné.
- Sur mobile : l'accueil (« Le domaine, de la forêt jusqu'à la cave ») et les libellés de la barre du bas.

## Modifications à faire

### Carte (bureau)

| Zone                                        | Modification demandée                                                                                                                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actualités sur la carte                     | Ne laisser qu'**une seule** actualité mise en avant.                                                                                                                                                    |
| « Le kiosque »                              | Renommer en **« Les actualités »** (page, légende, textes).                                                                                                                                             |
| Illustration de fond                        | La refaire en **deux versions**, une par photo : `shared/photos/maison-vue-aerienne-domaine-vignes.jpg` et `shared/photos/maison-vue-aerienne-facade.jpg`. Voir « Illustrations de la carte » plus bas. |
| Repères « vers Verzy » et « vers Ambonnay » | **Retirer** ces deux liens, qui ramènent vers la page des parcelles.                                                                                                                                    |
| « Forêt de la Montagne de Reims »           | **Remettre** cette mention sur la carte, retirée lors du passage aux deux nouvelles illustrations. Confirmé par le client : la ligne de bois en haut de la version A est la forêt de la Montagne de Reims, la mention se pose dessus. Sur la version B, la poser sur l'horizon.                      |
| Titre de la page                            | Remplacer « Lejeune, carnet du domaine » par « Lejeune Père & Fils ». **Droit, jamais incliné.**                                                                                                        |
| Favicon                                     | Proposer un favicon cohérent avec le design (monogramme ou lettre L dans l'univers de la carte).                                                                                                        |
| Carte                                       | On change le texte "vous êtes attendus" par "Venir au domaine"                                                                                                                                          |

### Pages ouvertes

| Zone                     | Modification demandée                                                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page « La maison »       | Intégrer la photo de la vue par la fenêtre **directement dans la page. Retirer le lien « Regarder par la fenêtre de la maison » qui ouvre la modale. |
| Fenêtre sur la carte     | Garder le repère discret de la fenêtre dans un coin de la maison (seulement quand on est sur la page "La maison", comme petit easter egg.            |
| Liens page avant / après | Retirer entre les lieux. Garder **« cuvée suivante »** dans une fiche cuvée, pour comparer sans repasser par la liste.                               |
| Fond des pages           | Remplacer l'effet carnet par un **fond uni**. Sans effet.                                                                                            |
| Retour à la carte        | Ne pas le mettre plus en avant : la croix suffit.                                                                                                    |

### Les cuvées (ex-« La cave »)

| Zone        | Modification demandée                                                                                                                                                                                                                     |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nom         | « La cave » devient **« Les cuvées »** (page, légende, titres, textes comme « de la forêt jusqu'à la cave »).                                                                                                                             |
| Liste       | Nouvelle mise en page à la façon du concept 4 : les **images des bouteilles au premier plan**. Retirer l'illustration en coupe et ses galeries cliquables.<br>Afficher en plus grand s'il y a besoin d'espace. A la manière du concept 4. |
| Fiche cuvée | Garder l'illustration de fond, les couleurs et les descriptions. Retravailler le **retour de la fiche vers la liste des bouteilles** (bouton clair, position évidente).                                                                   |

### Mobile

| Zone | Modification demandée |
| --- | --- |
| Accueil | Ne plus ouvrir sur la forêt ni sur « de la forêt jusqu'à la cave ». Centrer l'accueil sur **la maison**. |
| Barre du bas | Garder les trois éléments, mais clarifier les libellés (proposition ci-dessous). |

## Illustrations de la carte : deux versions au choix

L'illustration actuelle n'est pas fidèle. Le but est de **respecter la vraie maison, les rues alentour et les parcelles de vigne**, donc chaque illustration est dessinée d'après une photo réelle, sans rien inventer :

| Version              | Photo de départ                                        |
| -------------------- | ------------------------------------------------------ |
| A. Domaine et vignes | `shared/photos/maison-vue-aerienne-domaine-vignes.jpg` |
| B. Façade            | `shared/photos/maison-vue-aerienne-facade.jpg`         |

- Les deux illustrations sont proposées dans la prochaine version, avec un **sélecteur pour passer de l'une à l'autre en direct** (dans le bandeau de réglages), afin de choisir celle qui convient le mieux.
- Les lieux numérotés de la carte (maison, pressoir, cuvées, parcelles, venir, actualités) sont replacés sur chaque version d'après la photo, pas d'après l'ancien dessin.
- **Verzy et Ambonnay** : le client indique sur les deux fichiers `maison-vue-aerienne-domaine-vignes-avec-indications.jpg` et `maison-vue-aerienne-facade-avec-indications.jpg` la direction de chaque village. Cette indication sert à placer les repères de direction correctement, si on les garde. Les liens vers la page des parcelles restent retirés.

## Proposition pour la barre du bas sur mobile

Aujourd'hui : **Légende · La carte · Venir**. Deux problèmes : « Légende » ne dit pas qu'on va naviguer, et « La carte » peut se confondre avec « Venir » (on peut croire à un plan d'accès).

Proposition, **mobile uniquement** (le bureau garde « Légende ») :

| Actuel | Proposé | Pourquoi |
| --- | --- | --- |
| Légende | **Menu** (avec l'icône des trois traits) | Tout le monde sait que ça ouvre la navigation. L'icône évite l'effet « menu de restaurant ». |
| La carte | **Le domaine** | Désigne l'illustration d'ensemble sans évoquer un plan d'accès. |
| Venir | **Venir** (inchangé) | Désormais sans ambiguïté avec « La carte ». |

Alternative si « Menu » gêne : **« Explorer »**, avec la même icône. Moins courant, mais plus proche de l'esprit de la carte.

## Prochaine itération : bandeau de réglages

Ajouter un petit bandeau de réglages, masqué par défaut, pour essayer les options directement dans la page et dire laquelle est préférée :

- police des titres et du texte (quelques choix) ;
- police du texte "Lejeune Père & Fils", séparer "Lejeune" et "Père & Fils"
- taille des titres, du texte, interlignage ;
- couleur du fond uni (quelques teintes) ;
- taille et disposition des bouteilles sur la page des cuvées ;
- illustration de la carte : **bascule directe** entre la version A « domaine et vignes » et la version B « façade » ;
- taille et style du titre et du logo.

Un bouton « copier ma configuration » donnera la combinaison retenue, à fixer ensuite dans le site.

## Points ouverts

- [ ] Choisir l'unique actualité mise en avant sur la carte
- [ ] Choisir la couleur du fond uni. -> je choisirais dans le bandeau de réglages
- [ ] Valider « Menu » ou « Explorer », et « Le domaine », pour la barre du bas sur mobile.
- [x] Indiquer sur une deux photos aériennes la direction de Verzy et d'Ambonnay.
- [ ] Retirer les repères « vers Verzy » et « vers Ambonnay » (liens vers les parcelles).
- [ ] Remettre la mention « Forêt de la Montagne de Reims » sur les deux versions de la carte.
- [x] Dessiner deux illustrations de la carte, une par photo aérienne, fidèles à la maison, aux rues et aux parcelles. → `shared/illustrations/carte-a-domaine.jpg` et `carte-b-facade.jpg` (+ `-1600`, + calques `-trait`).
- [x] Ajouter la bascule entre les deux illustrations dans le bandeau de réglages. → bouton « Réglages » en haut à droite du concept 2, ou `?carte=a|b` dans l'adresse.
- [ ] Choisir l'illustration préférée.
- [ ] Refaire la page des cuvées (bouteilles au premier plan) et le retour fiche → liste.
- [ ] Dessiner le favicon.
- [ ] Construire le bandeau de réglages. → commencé (`2-vue-cavaliere/reglages.js`) : bascule de carte et « copier ma configuration » ; les autres réglages restent à ajouter.
