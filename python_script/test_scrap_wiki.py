import re
import csv

# Fichier source (ton .txt)
INPUT_FILE = "wiki.txt"

# Fichier CSV de sortie
OUTPUT_FILE = "data.csv"

# Regex pour capturer :
# - latitude
# - longitude
# - URL
# - label (nom du lieu)
pattern = re.compile(
    r"([0-9\.\-°'NnSs]+)\s*,?\s*([0-9\.\-°'Ee]+)\s*~~\s*\[(https?://[^\s]+)\s(.+?)\]"
)

rows = []

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    content = f.read()

# Trouver toutes les occurrences
matches = pattern.findall(content)

for lat, lon, url, name in matches:
    name = name.strip().replace("]", "")
    rows.append([lat, lon, name, url])

# Écrire le CSV
with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["latitude", "longitude", "name", "url"])
    writer.writerows(rows)

print(f"Extraction terminée : {len(rows)} lignes écrites dans {OUTPUT_FILE}")
