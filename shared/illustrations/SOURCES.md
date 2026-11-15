# Illustrations des concepts

Dessins générés sur Replicate, chacun **d'après une vraie photo du domaine** quand il représente un lieu, un objet
ou un geste. Font exception les motifs botaniques, le sarment, la cave en coupe, la toile de Jouy et le papier.
Le prompt exact est intégré à chaque fichier (`impeccable embed-prompt --read <fichier>`). Ce sont des **dessins
d'intention** : à faire reprendre par un illustrateur si le concept est retenu.

Les dérivés (trait seul, teintes, détourages, inversion) sortent de `concepts/_outils/derives.py`.

| Fichier | Contenu | Fait d'après | Modèle | Pour |
|---|---|---|---|---|
| `carte-domaine.jpg` (3200px), `-1600.jpg` | Plan cavalier du domaine : maison, cour, routes, vignes en rangs, forêt en haut | `maison-vue-aerienne-domaine-vignes` | flux-kontext-max, puis Real-ESRGAN ×4 | 2 |
| `carte-domaine-trait.png`, `-1600.png` | Le même dessin, trait sépia seul sur fond transparent (calque « encre », aligné au pixel) | dérivé de `carte-domaine.jpg` | `derives.py trait` | 2 |
| `carte-a-domaine.jpg` (3200px), `-1600.jpg` | **Version A** de la nouvelle carte (retours client du 14/11) : vue plongeante fidèle, maison, cour vide, routes, kiosque, parcelles avec leurs vrais sens de rangs, bois en haut | `maison-vue-aerienne-domaine-vignes` | nano-banana-pro, 2 passes (dessin, puis voitures retirées et lavis adouci) | 2 |
| `carte-b-facade.jpg` (3200px), `-1600.jpg` | **Version B** de la nouvelle carte : la maison de face, cour et mur courbe, vignes et plaine jusqu'à l'horizon, ciel en papier nu | `maison-vue-aerienne-facade` | idem | 2 |
| `carte-a-domaine-trait.png`, `carte-b-facade-trait.png` (+ `-1600`) | Calques « encre » des versions A et B, alignés au pixel | dérivés | `derives.py trait` | 2 |
| `cave-coupe.jpg` | La maison et sa cave en craie en coupe, bouteilles sur lattes | texte seul | flux-1.1-pro | 2 |
| `pressoir.png` | Le vieux pressoir vu de dessus, mains sur la barre (transparent) | `pressoir-ancien-mains-vue-dessus` | flux-kontext-max | 2, 3 |
| `facade.png` | La façade de la maison, encre ardoise et lavis bleu-gris (transparent) | `maison-vue-aerienne-facade` | flux-kontext-max | 3, 4 |
| `porte.png` | La porte d'entrée, découpée dans `facade.png` | dérivé | — | 3 |
| `feuille.png`, `feuille-<cuvée>.png`, `feuille-ardoise.png` | Vraie feuille de vigne (sinus pétiolaire, dents), lavis ocre ; variantes teintées par cuvée et en encre ardoise / lavis bleu-gris | texte seul (la version d'après photo donnait une feuille d'érable, écartée) | flux-1.1-pro | 2, 3, 4 |
| `grappe.png`, `grappe-<cuvée>.png`, `grappe-ardoise.png` | Grappe de chardonnay ; variantes teintées par cuvée et en ardoise / bleu-gris | `vignes-grappes-chardonnay-dorees` | flux-kontext-pro | 2, 3 |
| `pressoir-1927.png` | Le pressoir Lejeune de 1927 redessiné (deux pressoirs, échelle, paniers, fûts ; personnes omises), encre ardoise et lavis bleu-gris | `histoire-pressoir-lejeune-1927` (photo d'archive) | flux-kontext-max | 3 |
| `caisse.png` | Caisse de vendange pleine de raisins blancs | `vendanges-caisses-chemin-vignes` | flux-kontext-max | 3 |
| `sarment.png` | Long sarment vertical, vrilles, feuilles, une grappe | texte seul | flux-1.1-pro | 3 |
| `storyboard-1-aube.jpg` … `storyboard-7-rendez-vous.jpg` | Cartons de storyboard, crayon et lavis gris, sans visage | photo de tête de chaque séquence (voir prompts) | flux-kontext-pro | 1 |
| `toile-de-jouy.jpg` | Toile de Jouy : vendangeurs, pressoir, cave, maison, en bleu d'imprimeur sur craie | texte seul | flux-1.1-pro | 5 |
| `toile-de-jouy-inverse.jpg` | La même, craie sur bleu capsule `#1F3A8F` | `derives.py inverse` | — | 5 |
| `papier.jpg` | Papier aquarelle vierge (texture de fond) | texte seul | flux-1.1-pro | 2 |

**Teintes des variantes par cuvée** (lavis) :

| Cuvée | Teinte |
|---|---|
| `brut-reserve` | `#B8963F` |
| `demi-sec` | `#C99236` |
| `rose` | `#D99A86` (saumon) |
| `grande-reserve` | `#C2AA5E` |
| `millesime` | `#A86F33` |

**Règles :**
- aucun visage de la famille n'est dessiné ; les personnes restent en photo ;
- la carte ne montre **pas** l'emplacement des 35 parcelles : ses vignes sont un décor ; le plan réel doit venir de la famille.
