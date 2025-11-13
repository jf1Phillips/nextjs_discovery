#!/bin/python3
from sys import argv
import csv
import json

if len(argv) != 2:
    exit(84)

file_name = argv[1]

def csv_to_geoJson(file_name):
    features = []
    with open(file_name, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            if not (row["lat"] and row["long"]):
                continue
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(row["long"]), float(row["lat"])]
                },
                "properties": {
                    "fr": row["fr"],
                    "jsx": f"<p>{row["fr"]}</p>",
                    "icon": "pin_labels_dark.png",
                }
            }
            features.append(feature)
    return {
        "type": "FeatureCollection",
        "features": features
    }
geojson_data = csv_to_geoJson(file_name)
output_file = file_name.split('.')[0] + ".geojson"

with open(output_file, mode='w', encoding='utf-8') as geojson_file:
    json.dump(geojson_data, geojson_file, indent=4, ensure_ascii=False)

print(f"Fichier GeoJSON généré : {output_file}")
