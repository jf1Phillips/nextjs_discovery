#!/bin/bash

# Script d'optimisation et génération de tiles légères pour Mapbox
# Usage: ./optimize_and_tile.sh

set -e

INPUT="input.tif"
OUTPUT_DIR="public/tiles"
TEMP_DIR="temp_processing"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}=== Optimisation et génération de tiles (WebP légères) ===${NC}"

if [ ! -f "$INPUT" ]; then
    echo -e "${RED}Erreur: $INPUT n'existe pas${NC}"
    exit 1
fi

mkdir -p "$TEMP_DIR"

ORIGINAL_SIZE=$(du -h "$INPUT" | cut -f1)
echo -e "${GREEN}Taille originale: $ORIGINAL_SIZE${NC}"

echo -e "\n${BLUE}[1/6] Analyse du fichier...${NC}"
gdalinfo "$INPUT" | grep -E "(Size|Pixel Size|Origin|Upper|Lower|Coordinate System)"

echo -e "\n${BLUE}[2/6] Reprojection + compression WebP (qualité réduite)...${NC}"
gdalwarp -t_srs EPSG:3857 \
    -r bilinear \
    -co COMPRESS=WEBP \
    -co WEBP_LEVEL=60 \
    -co TILED=YES \
    -co ALPHA=YES \
    -overwrite \
    "$INPUT" "$TEMP_DIR/optimized.tif"

OPTIMIZED_SIZE=$(du -h "$TEMP_DIR/optimized.tif" | cut -f1)
echo -e "${GREEN}Après optimisation: $OPTIMIZED_SIZE${NC}"

echo -e "\n${BLUE}[3/6] Création des overviews...${NC}"
gdaladdo -r average "$TEMP_DIR/optimized.tif" 2 4 8 16 32

echo -e "\n${BLUE}[4/6] Génération des tiles PNG (temporaire)...${NC}"

if [ -d "$OUTPUT_DIR" ]; then
    echo "Suppression de l'ancien dossier tiles..."
    rm -rf "$OUTPUT_DIR"
fi

gdal2tiles.py \
    -z 6-13 \
    --xyz \
    --tilesize=256 \
    --processes=8 \
    --resampling=average \
    -w none \
    "$TEMP_DIR/optimized.tif" "$OUTPUT_DIR"

echo -e "\n${BLUE}[5/6] Conversion PNG → WebP (qualité 65)...${NC}"

if ! command -v cwebp &> /dev/null; then
    echo -e "${RED}Erreur: cwebp n'est pas installé.${NC}"
    echo "Installe-le avec: sudo apt install webp"
    exit 1
fi

find "$OUTPUT_DIR" -name "*.png" -type f | while read file; do
    cwebp -quiet -q 65 "$file" -o "${file%.png}.webp"
    if [ $? -eq 0 ]; then
        rm "$file"
    fi
done

echo -e "${GREEN}Conversion terminée.${NC}"

echo -e "\n${BLUE}[6/6] Nettoyage...${NC}"
find "$OUTPUT_DIR" -type f -size -1k -delete
rm -rf "$TEMP_DIR"

echo -e "\n${GREEN}=== Résumé ===${NC}"
TILES_SIZE=$(du -sh "$OUTPUT_DIR" | cut -f1)
TILES_COUNT=$(find "$OUTPUT_DIR" -type f | wc -l)
echo -e "Taille originale: ${ORIGINAL_SIZE}"
echo -e "Taille du dossier tiles: ${TILES_SIZE}"
echo -e "Nombre de tiles générées: ${TILES_COUNT}"
echo -e "\n${GREEN}✓ Terminé !${NC}"
echo -e "\nUtilise dans ton code TypeScript:"
echo -e "${BLUE}tiles: ['/tiles/{z}/{x}/{y}.webp']${NC}"
echo -e "${BLUE}tileSize: 256${NC}"
echo -e "${BLUE}minzoom: 6, maxzoom: 13${NC}"
