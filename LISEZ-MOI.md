# Site de Félix Fritz — fins équilibrées et espaces de 6 px

## Installation

Pour mettre à jour la précédente version, remplacer seulement :

- `masonry.js` à la racine du site ;
- `css/styles.css` dans le dossier `css/`.

Les 19 pages HTML et `anim.js` sont identiques à ceux de la version précédente. Ils sont inclus pour permettre une installation complète. Conserver les dossiers existants `img/`, `typos/`, `favicon/` et les vidéos : ces ressources ne sont pas dans l'archive.

Après remplacement, recharger la page en vidant le cache si l'ancien affichage subsiste.

## Espacement et bordure de page

Une seule valeur définit l'espace commun dans `css/styles.css` :

```css
:root {
    --image-gap: 6px;
}
```

- Deux colonnes sur téléphone (jusqu'à 800 px), trois sur ordinateur.
- 6 px entre les images, horizontalement et verticalement.
- 6 px autour de la page entière, y compris en haut et en bas.
- 6 px entre les principaux blocs : navigation, textes, galeries, médias et pied de page.
- 6 px entre les titres et paragraphes des blocs de texte.
- 6 px entre les images de fabrication de La Caravelle, dans son carrousel.

Le padding extérieur est porté par `body`. Les galeries et les textes n'ajoutent pas un second padding horizontal : cela évite de doubler la bordure à 12 px. Le script lit les paddings calculés de la galerie au lieu de supposer une valeur fixe.

Les sauts de ligne écrits dans le contenu HTML (`<br>`) sont conservés. Une ligne vide volontaire dans un texte prend encore la hauteur de sa ligne ; ce n'est pas une marge CSS. Pour retirer ce blanc, supprimer les balises `<br>` concernées. Les espacements CSS autour des blocs sont désormais de 6 px.

## Rééquilibrage des dernières images

Les photos sont d'abord placées, dans leur ordre HTML, dans la colonne la plus courte. Elles conservent leur hauteur naturelle.

Le script compare ensuite quelques répartitions de la fin de la galerie :

1. La première rangée et toutes les images précédant les six dernières restent en place. Pour les petites galeries, seules les photos situées après la première rangée peuvent bouger.
2. Il autorise au plus deux échanges entre images voisines parmi les six dernières. Une image ne peut donc s'écarter de plus de deux places de son ordre initial.
3. Seule la dernière image de chaque colonne reçoit un éventuel recadrage, limité à 15 % de la dimension concernée.
4. Une permutation n'est retenue que si elle réduit le blanc d'au moins l'équivalent d'une bande de 6 px sur la largeur d'une colonne, sans allonger la galerie. Si aucun changement n'aide suffisamment, l'ordre habituel est conservé.

Les espaces entre photos restent toujours de 6 px. Aucun cadre, rectangle de remplissage ou dégradé n'est ajouté. Les images ne sont pas déformées : `object-fit: cover` applique le recadrage au centre.

Sur l'accueil, les années restent classées du plus récent au plus ancien. Les échanges ne sont permis qu'entre projets de la même année. L'ordre des éléments dans le HTML n'est pas modifié par l'optimisation visuelle.

Le placement peut varier avec la largeur de la fenêtre et les dimensions des images. Les dimensions originales sont toujours utilisées : les recadrages ne s'accumulent pas après redimensionnement. Les anciennes dernières images retrouvent leur hauteur naturelle lorsqu'elles ne sont plus en bas d'une colonne.

Un peu de blanc peut subsister lorsque les proportions diffèrent beaucoup. Le calcul préserve la limite de recadrage et les changements d'ordre modestes ; il ne promet pas un alignement parfait.

Pour réduire le recadrage à 10 %, modifier :

```css
.gallery {
    --gallery-crop-limit: 0.10;
}
```

Utiliser `0` désactive le recadrage. La limite par défaut est `0.15`.

## Ajouter une image ou un projet

Ajouter les photos dans l'ordre souhaité :

```html
<div class="gallery">
    <div class="gallery__item" data-aos="fade-up">
        <img src="img/mon-projet/photo.jpg" alt="Description de la photo">
    </div>
</div>
```

Cet exemple montre la structure. Conserver les images existantes et utiliser un chemin de fichier réel.

Pour ajouter un projet sur l'accueil, dupliquer une carte dans `index.html`, modifier son lien, sa miniature, son titre et `data-year`. Les projets sont automatiquement classés par année décroissante.

## Carrousel de fabrication de La Caravelle

Les 36 images de fabrication et d'installation de `jardins.html` restent dans le carrousel horizontal. Elles conservent leurs proportions entières et leur ordre. Elles ne reçoivent pas le rééquilibrage ni le recadrage de fin de galerie.

Pour ajouter une image à cette série, ajouter une balise `<img>` dans le bloc `.carousel`. Le défilement fonctionne par glissement sur téléphone, pavé tactile ou barre de défilement.

## Ajouter une vidéo en bas de moulin.html

Placer la vidéo dans un dossier de votre site, par exemple `video/moulin.mp4`. Dans `moulin.html`, ajouter ce bloc juste avant la fermeture `</main>`, après la galerie :

```html
<div class="media">
    <video class="project-video" controls playsinline preload="metadata">
        <source src="video/moulin.mp4" type="video/mp4">
        Votre navigateur ne peut pas lire cette vidéo.
    </video>
</div>
```

Remplacer `video/moulin.mp4` par le chemin exact du fichier. La vidéo occupe la largeur disponible, garde ses proportions et suit la galerie avec un espace de 6 px. La bordure de page reste à 6 px.

- `controls` affiche le bouton de lecture, le volume et les autres commandes du navigateur.
- L'absence de `autoplay` empêche le démarrage automatique.
- L'absence de `muted` laisse le son activé au démarrage, sous réserve du réglage de volume de l'utilisateur et de la présence d'une piste audio dans le fichier.
- `playsinline` permet la lecture dans la page sur téléphone.
- `preload="metadata"` demande seulement les informations de la vidéo avant lecture ; le navigateur décide du téléchargement effectif.

Pour une vidéo compatible avec la plupart des navigateurs, utiliser un fichier MP4 contenant de la vidéo H.264 et de l'audio AAC.

Une image d'aperçu est facultative. Ajouter `poster="img/moulin-apercu.jpg"` dans la balise `<video>` si vous disposez de cette image. Aucun script supplémentaire n'est nécessaire.

La vidéo est à ajouter une fois son fichier disponible ; aucun lien vers une vidéo inexistante n'a été inséré dans la page livrée.

## Vérifications

La syntaxe JavaScript a été vérifiée. 128 cas simulés couvrent deux et trois colonnes, de 1 à 35 images, le classement chronologique, les espaces de 6 px, le padding, le recadrage limité aux fins de colonnes, les échanges limités, les erreurs de chargement et le redimensionnement. Dans 50 de ces cas, les permutations réduisent le blanc davantage que le recadrage seul. Aucun cas n'augmente le blanc ou la hauteur par rapport au placement habituel avec le même recadrage.

Ces contrôles portent sur les fichiers et les calculs. Les images réelles n'ont pas été fournies : vérifier leur rendu sur le site, surtout pour celles contenant du texte près des bords. La lecture vidéo devra être vérifiée avec votre fichier réel.
