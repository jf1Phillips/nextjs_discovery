#!/bin/python3x

import json5
from sys import argv
import json

if len(argv) != 2:
    exit(84)

file_name = argv[1]

with open(file_name, mode="r", encoding="utf-8") as file:
    content = file.read()
data = json5.loads(content)

print("File loaded !")
features = []
with open(file_name, mode="r", encoding="utf-8") as file:
    for d in data:
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [float(d["Longitude"]), float(d["Latitude"])]
            },
            "properties": {
                "fr": d["Nom"],
                "html": d["Texte"],
                "icon": d["TypeSite"],
                "icon_selected": "map_icon_orange.png",
                "min_zoom": float(d["NiveauCarteMinimum"]),
                "testament": "EC",
            }
        }
        features.append(feature)
    end_geojson = {
        "type": "FeatureCollection",
        "features": features
    }

output_file = file_name.split('.')[0] + ".geojson"
with open(output_file, mode="w", encoding="utf-8") as file:
    json.dump(end_geojson, file, indent=4, ensure_ascii=False)
print(f"Fichier geoJSON généré : {output_file}")
