#!/bin/python3
from sys import argv
import csv
import json

if len(argv) != 2:
    exit(84)

file_name = argv[1]

def csv_to_json(file_name):
    points = []
    with open(file_name, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            if not (row["latitude"] and row["longitude"]):
                continue
            point = {
                "latlong": [float(row["longitude"]), float(row["latitude"])],
                "link": "None",
                "name": {}
            }
            if row["nameFr"]:
                point["name"]["fr"] = row["nameFr"]
            if row["nameEn"]:
                point["name"]["en"] = row["nameEn"]
            if row["nameZh"]:
                point["name"]["zh"] = row["nameZh"]
            if row["nameIt"]:
                point["name"]["it"] = row["nameIt"]
            if row["nameEs"]:
                point["name"]["es"] = row["nameEs"]
            points.append(point)
    return {"points": points}

json_data = csv_to_json(file_name)
output_file = file_name.split('.')[0] + ".json"

with open(output_file, mode='w', encoding='utf-8') as json_file:
    json.dump(json_data, json_file, indent=4, ensure_ascii=False)

print(f"Fichier JSON généré : {output_file}")
