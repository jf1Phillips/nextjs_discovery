#!/bin/python3
from sys import argv
import csv
import json

if len(argv) != 2:
    exit(84)

file_name = argv[1]

dico = {
    "Gomorrhe ?": "<p style='margin-bottom: 0.5rem; font-weight: bold; font-size: 20px;'>Gomorrhe ?</p><a href='https://edifiant.fr/sodome-et-gomorrhe/' target='_blank' style='display: block; margin-bottom: 0.5rem; text-align: center;'>https://edifiant.fr/sodome-et-gomorrhe/</a><a href='https://www.youtube.com/watch?v=YpdYveOi28A' target='_blank' style='display: block; text-align: center;'>https://www.youtube.com/watch?v=YpdYveOi28A</a>",
    "Bethsaïda": "<p style='margin-bottom: 0.5rem; font-size: 20px;'>Bethsaïde</p><img src='/img/bethsaid.jpg' alt='Bethsaïde' width='250' style='display: block; margin-bottom: 0.5rem;' /><p style='text-align: justify; padding: 0.5rem; font-size: 15px;'>La ville galiléenne de Bethsaïde fut détruite par un tremblement de terre vers l'an 324 après Jésus Christ. Elle fut retrouvée en 1987 par un consortium d'universités menée par l'Université du Nebraska à Omaha, conduit par le professeur de religion et de philosophie israélien Dr. Rami Arav, sur le site de et-Tell, à 2 kilomètres au nord-est du lac de Tibériade. Cet emplacement correspond exactement à la dictée du Christ transmis à Maria Valtorta du 4 juin 1947 dans laquelle il lui explique qu'en raison de « vingt siècles d'alluvions apportés par le fleuve et par les éboulis descendus des collines », la ville se trouve désormais au milieu des terres et non plus « à l'embouchure du fleuve dans le lac » (L'Évangile tel qu'il m'a été révélé, chapitre 179.1).</p>",
}

testement = ["AT", "NT", "EC"]

def csv_to_geoJson(file_name):
    features = []
    with open(file_name, mode='r', encoding='utf-8') as file:
        size = len(list(csv.DictReader(file)))
        file.seek(0, 0)
        reader = csv.DictReader(file)
        for row in reader:
            nb = reader.line_num // int(1 + size / len(testement))

            if not (row["lat"] and row["long"]):
                continue

            fr_name = row["fr"]
            if fr_name in dico:
                html = dico[fr_name]
            else:
                html = f"<p>{fr_name}</p>"

            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(row["long"]), float(row["lat"])]
                },
                "properties": {
                    "fr": row["fr"],
                    "html": html,
                    "icon": f"pin_labels_dark_{testement[nb]}.png",
                    "icon_selected": f"pin_labels_{testement[nb]}_selected.png",
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
