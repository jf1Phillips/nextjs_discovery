# Carte historique interactive — Le Proche-Orient ancien

Ce projet est une **carte interactive Mapbox** permettant d’explorer la Le Proche-Orient ancien à travers différentes époques, avec des **couches historiques**, des **labels dynamiques**, des **pop-ups contextuels** et un **mode clair/sombre**.
Le site a été conçu pour naviguer librement, visualiser des cartes anciennes superposées et afficher des informations géographiques détaillées.

---

## Fonctionnalités principales

### Carte interactive

* Navigation libre sur la carte (zoom, déplacement, clics).
* Interface minimaliste réactive.

### Couches historiques

Deux cartes anciennes sont intégrées :

1. **Carte du PEF (1880)**
2. **Carte de Hans J. Hopfen (1975)**

Elles sont superposées sur la carte moderne et peuvent être affichées ou masquées individuellement via l’interface.

### Labels et points d’intérêt

* Les labels proviennent de fichiers GeoJSON.
* Certains labels disposent de **pop-ups spéciaux** (contenu HTML dynamique).
* Lorsqu’un chapitre particulier est actif, le label correspondant est **surligné en orange**.

### Mode clair/sombre

* Bascule dynamique entre les styles *Mapbox Light* et *Mapbox Dark*.
* Les icônes et textes des labels s’adaptent automatiquement (couleur, halo, contraste).

### Effets visuels

* Option **pluie animée** et **relief 3D** activables via l’interface.

---

## Architecture

Le cœur du projet repose sur deux fichiers principaux :

| Fichier               | Rôle                                                                                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `./components/get_map.tsx`    | Composant React principal affichant la carte et gérant les interactions utilisateur.                                                           |
| `./components/mapbox_functions.ts` | Module contenant toutes les fonctions utilitaires pour manipuler la carte Mapbox (ajout de labels, d’images, de routes, effets visuels, etc.). |

---

## Installation

```bash
# 1. Cloner le dépôt
git clone [https://github.com/jf1Phillips/nextjs_discovery.git](https://github.com/jf1Phillips/nextjs_discovery.git)
cd nextjs_discovery/

# 2. Installer les dépendances
npm install

# 3. Ajouter votre clé Mapbox
echo "NEXT_PUBLIC_MAPBOX_TOKEN=YOUR_TOKEN_HERE" > .env.local

# 4. Lancer le serveur de développement
npm run dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000).

---

## Module `mapbox_functions.ts`

Ce module agit comme une **librairie Mapbox personnalisée**, réutilisable dans d’autres projets.
Il expose un objet principal `mapboxTools` contenant de nombreuses fonctions documentées.

---

### Liste des fonctions exportées

#### `addGeoJsonLabels(map, labels)`

Ajoute des labels à partir de fichiers GeoJSON, avec gestion automatique des icônes (`dark`, `white`, `selected`).

```ts
function addGeoJsonLabels(map: MapboxMap, labels: GeoJsonLabels[]): void
```

#### `setDarkmodeToLabels(map, labels)`

Met à jour les couleurs et icônes des labels selon le mode sombre ou clair.

```ts
function setDarkmodeToLabels(map: MapboxMap, labels: GeoJsonLabels[]): void
```

#### `highLightLabel(map, labels, name?)`

Surligne un ou plusieurs labels par nom, ou réinitialise tous les labels.

```ts
function highLightLabel(map: MapboxMap, labels: GeoJsonLabels[], name?: string | string[]): void
```

#### `reload_json_labels(map, labels)`

Recharge complètement les labels GeoJSON (supprime et réimporte les couches).

```ts
function reload_json_labels(map: MapboxMap | null, labels: GeoJsonLabels[]): void
```

#### `addGeoImg(map, geoImgArray)`

Ajoute des cartes historiques (images ou tuiles raster) sur la carte.

```ts
function addGeoImg(map: MapboxMap, imgs: GeoImg[]): void
```

#### `addRoads(path, map)`

Ajoute un fichier GeoJSON contenant les routes sur la carte.

```ts
function addRoads(path: string, map: MapboxMap): void
```

#### `addRain(map, clear?)`

Affiche un effet de pluie sur la carte (ou le retire si `clear = true`).

```ts
function addRain(map: MapboxMap, clear?: boolean): void
```

#### `set3dTerrain(map, clear?)`

Active ou désactive le rendu 3D du relief.

```ts
function set3dTerrain(map: MapboxMap, clear?: boolean): void
```

#### `add_popup(map, labels)`

Associe des pop-ups dynamiques aux labels correspondants.

```ts
function add_popup(map: MapboxMap, labels: GeoJsonLabels[]): void
```

#### `get_location(map, marker, enable, setBtn, watchId)`

Permet de suivre la localisation de l’utilisateur et d’afficher un marqueur GPS.

```ts
function get_location(
    map: MapboxMap | null,
    marker: Marker | null,
    enable: boolean,
    setBtn: (b: boolean) => void,
    watchId: { current: number | null }
): void
```

---

## Navigation & Interface

L’interface inclut :

* Bouton ☰ : ouvre le panneau latéral de couches.
* 🌑 / 🔆 : bascule entre mode clair et sombre.
* * / − : zoom.
* 3D / 2D : active ou désactive le relief.
* 🌧️ / ☀️ : active ou désactive la pluie.
* ↻ : recharge les labels GeoJSON.
* ⊕ : active la géolocalisation de l’utilisateur.

---

## Types principaux

### `GeoJsonLabels`

Structure décrivant un label géographique :

```ts
type GeoJsonLabels = {
  url: string;
  id: string;
  icons: {
    white: { id: string, url: string };
    dark: { id: string, url: string };
    selected: { id: string, url: string };
  };
};
```

### `GeoImg`

Structure d’une image ou couche raster :

```ts
type GeoImg =
  | { type: "image", url: string, id: string, coord: Coords, opacity?: number }
  | { type: "raster", url: string, id: string, bounds: [number, number, number, number], opacity?: number };
```
