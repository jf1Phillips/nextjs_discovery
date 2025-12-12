#!/bin/python3
from sys import argv
import csv
import json

if len(argv) != 2:
    exit(84)

file_name = argv[1]

dicos = {
    "Gomorrhe ?": {"links_more": [{"name": "Vidéo", "url": 'https://www.youtube.com/watch?v=YpdYveOi28A'}, {"url": 'https://edifiant.fr/sodome-et-gomorrhe/'}]},
    "Bethsaïda": {"links_more": [{"name": "wiki", "url": "https://fr.mariavaltorta.wiki/wiki/Béthsaïda,_Bethsaïde"}], "img": '/img/bethsaid.jpg', "description": "La ville galiléenne de Bethsaïde fut détruite par un tremblement de terre vers l'an 324 après Jésus Christ. Elle fut retrouvée en 1987 par un consortium d'universités menée par l'Université du Nebraska à Omaha, conduit par le professeur de religion et de philosophie israélien Dr. Rami Arav, sur le site de et-Tell, à 2 kilomètres au nord-est du lac de Tibériade. Cet emplacement correspond exactement à la dictée du Christ transmis à Maria Valtorta du 4 juin 1947 dans laquelle il lui explique qu'en raison de « vingt siècles d'alluvions apportés par le fleuve et par les éboulis descendus des collines », la ville se trouve désormais au milieu des terres et non plus « à l'embouchure du fleuve dans le lac » (L'Évangile tel qu'il m'a été révélé, chapitre 179.1)."},
}


def csv_to_geoJson(file_name):
    features = []
    with open(file_name, mode='r', encoding='utf-8') as file:
        size = len(list(csv.DictReader(file)))
        file.seek(0, 0)
        reader = csv.DictReader(file)
        for i, row in enumerate(reader):

            if not (row["lat"] and row["long"]):
                continue

            fr_name = row["fr"]
            img = None
            description = None
            links_more = []
            if fr_name in dicos:
                dico = dicos[fr_name]
                try: img = dico["img"]
                except: pass

                try: description = dico["description"]
                except: pass

                try: links_more.extend(dico["links_more"])
                except: pass

            # ajout de l'url si elle est presente
            if row["url"] != "":
                links_more.append({"url": row["url"]})

            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(row["long"]), float(row["lat"])]
                },
                "properties": {
                    "fr": fr_name,
                    "related_event": [],
                    "img": img,
                    "description": description,
                    "links_more": links_more,
                    "icon": "map_icon_black.png",
                    "icon_darkmode": "map_icon_white.png",
                    "icon_selected": "map_icon_orange.png",
                    "testament": "NT",
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
