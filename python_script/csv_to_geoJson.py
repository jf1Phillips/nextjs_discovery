#!/bin/python3
from sys import argv
import csv
import json

if len(argv) != 2:
    exit(84)

file_name = argv[1]

dico = {
    "Gomorrhe ?": "<p class='mb-2 font-bold text-[20px]'>Gomorrhe ?</p><a class='mb-2 text-center' target='_blank' href='https://edifiant.fr/sodome-et-gomorrhe/'>https://edifiant.fr/sodome-et-gomorrhe/</a><a class='text-center block' target='_blank' href='https://www.youtube.com/watch?v=YpdYveOi28A'>https://www.youtube.com/watch?v=YpdYveOi28A</a>",
    "Bethsaïda": "<p class='mb-2 text-[20px]'>Bethsaïde</p><img src='/img/bethsaid.jpg' alt='Bethsaïde' width='250'/><p class='text-justify p-2 text-[15px]'>La ville galiléenne de Bethsaïde fut détruite par un tremblement de terre vers l'an 324 après Jésus Christ. Elle fut retrouvée en 1987 par un consortium d'universités menée par l'Université du Nebraska à Omaha, conduit par le professeur de religion et de philosophie israélien Dr. Rami Arav, sur le site de et-Tell, à 2 kilomètres au nord-est du lac de Tibériade. Cet emplacement correspond exactement à la dictée du Christ transmis à Maria Valtorta du 4 juin 1947 dans laquelle il lui explique qu'en raison de « vingt siècles d'alluvions apportés par le fleuve et par les éboulis descendus des collines », la ville se trouve désormais au milieu des terres et non plus « à l'embouchure du fleuve dans le lac » (L'Évangile tel qu'il m'a été révélé, chapitre 179.1).</p>"
}

def csv_to_geoJson(file_name):
    features = []
    with open(file_name, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
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
                    "icon": "pin_labels_dark.png",
                    "icon_selected": "pin_labels_selected.png",
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
