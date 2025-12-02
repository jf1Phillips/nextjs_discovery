import json
from sys import argv

if len(argv) < 3:
    exit(1)
file1 = argv[1]
file2 = argv[2]

with open(file1, "r", encoding="utf-8") as f1:
    data1 = json.load(f1)["features"]
with open(file2, "r", encoding="utf-8") as f2:
    data2 = json.load(f2)

all_data = []

import re

def extract_year(html: str) -> int | None:
    months = [
        "janvier", "février", "mars", "avril", "mai", "juin",
        "juillet", "août", "septembre", "octobre", "novembre", "décembre",
        "janv", "févr", "avr", "juil", "sept", "oct", "nov", "déc"
    ]

    # 1️⃣ Priorité : mois + espace + nombre
    month_pattern = r'(?i)\b(?:' + '|'.join(months) + r')\s+(\d{2,4})(?=[\s,])'
    month_matches = re.findall(month_pattern, html)
    years = [int(y) for y in month_matches if 10 <= int(y) <= 2100]
    if years:
        return years[0]

    # 2️⃣ Sinon : "en " + nombre
    en_pattern = r'(?i)\ben\s+(\d{2,4})(?=[\s,])'
    en_matches = re.findall(en_pattern, html)
    years = [int(y) for y in en_matches if 10 <= int(y) <= 2100]
    if years:
        return years[0]

    return None

def extract_year_after_comma(html: str) -> int | None:
    # Cherche le pattern "nombre, nombre" avec espaces optionnels avant et après la virgule
    pattern_comma = r'\b(\d{1,4})\s*,\s*(\d{1,4})\b'
    matches = re.findall(pattern_comma, html)
    if matches:
        # Priorité au second nombre après la virgule
        return int(matches[0][1])
    
    # Sinon : retourne le premier nombre trouvé entre 0 et 9999
    pattern_number = r'\b(\d{1,4})\b'
    matches = re.findall(pattern_number, html)
    if matches:
        return int(matches[0])
    
    return None


for data in data1:
    pr = data["properties"]
    geo = data["geometry"]
    date = extract_year(pr["html"])
    all_data.append({
        "type": ["Apparation of the virgin Mary"],
        "date": str(date) if date is not None else None,
        "dt2": date,
        "place": pr["fr"],
        "visionary": None,
        "title": None,
        "description": pr["html"],
        "feast": None,
        "commemorated": None,
        "source": None,
        "people_involved": None,
        "approval": None,
        "links": [],
        "lang": "fr",
        "latitude": geo["coordinates"][1],
        "longitude": geo["coordinates"][0]
    })

for data in data2:
    try:
        lat = data["latitude"]
        lng = data["longitude"]
    except:
        lat = None
        lng = None
    all_data.append({
        **data,
        "type": [data["type"]],
        "feast": data["feast"] if data["feast"] != "" else None,
        "commemorated": data["commemorated"] if data["commemorated"] != "" else None,
        "lang": "en",
        "dt2": extract_year_after_comma(data["date"]),
        "people_involved": data["peple_involved"],
        "latitude": lat,
        "longitude": lng
    })

print(len(all_data))
all_data = sorted(all_data, key=lambda ft: ft["dt2"] if ft["dt2"] is not None else 999999)
for item in all_data:
    item.pop("dt2", None)
    item.pop("peple_involved", None)

all_data = [{
    "type": data["type"],
    "date": data["date"] if data["date"] != "" else None,
    "place": data["place"] if data["place"] != "" else None,
    "latitude": data["latitude"] if data["latitude"] != "" else None,
    "longitude": data["longitude"] if data["longitude"] != "" else None,
    "title": data["title"] if data["title"] != "" else None,
    "description": data["description"] if data["description"] != "" else None,
    "visionaries": data["visionary"] if data["visionary"] != "" else (data["people_involved"] if data["people_involved"] != "" else None),
    "approval": data["approval"] if data["approval"] != "" else None,
    "commemorated": data["feast"] if data["feast"] is not None else data['commemorated'],
    "source": data["source"] if data["source"] != "" else None,
    "links": data["links"],
    "lang": data["lang"] if data["lang"] != "" else None
} for data in all_data]

with open("merged.json", "w", encoding="utf-8") as fd:
    json.dump(all_data, fd, ensure_ascii=False, indent=4)
