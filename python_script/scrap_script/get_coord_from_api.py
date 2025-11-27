import requests
from bs4 import BeautifulSoup
import json
import urllib.parse
import re

INPUT_FILE = "event_without_coordinates.json"
OUTPUT_FILE = "event_with_coordinates.json"
NOT_FOUND_FILE = "not_found_places.json"

fd = open(INPUT_FILE, "r", encoding="utf-8")
data = json.load(fd)
with open(OUTPUT_FILE, "r", encoding="utf-8") as fout:
    out_dt = json.load(fout)


def dms_to_decimal(dms):
    match = re.match(r"([NSEW])\s*(\d+)°\s*(\d+)′\s*(\d+)''", dms)
    if not match:
        raise ValueError(f"Format DMS incorrect: {dms}")
    direction, deg, minutes, seconds = match.groups()
    deg = int(deg)
    minutes = int(minutes)
    seconds = int(seconds)
    decimal = deg + minutes/60 + seconds/3600
    if direction in ['S', 'W']:
        decimal *= -1
    return decimal

def getLoc(place: str) -> tuple | None:
    query = urllib.parse.quote(place)
    url = f"https://www.geonames.org/search.html?q={query}&country="
    response = requests.get(url)
    if response.status_code != 200:
        print(f"Error fetching data for {place}: {response.status_code}")
        return None
    soup = BeautifulSoup(response.text, "html.parser")
    trs = soup.find_all("tr")
    for tr in trs:
        tds = tr.find_all("td")
        if len(tds) == 6:
            lat_td = tds[-2]
            lon_td = tds[-1]
            lat = lat_td.get_text(strip=True)
            lon = lon_td.get_text(strip=True)
            return dms_to_decimal(lat), dms_to_decimal(lon)
    return None

def get_coords(place) -> tuple | None:
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": place, "format": "json"}
    headers = {
        "User-Agent": "Nominatim-Test-Koa/1.0 (+https://www.solidarite-logement.org)",
        "Accept-Language": "fr",
    }
    response = requests.get(url, params=params, headers=headers)
    if response.status_code == 403:
        print("=== Contenu renvoyé ===")
        print(response.text[:500])
        return None
    data = response.json()
    if data:
        lat = data[0]["lat"]
        lon = data[0]["lon"]
        return lat, lon
    return None


none_file = []
for entry in data:
    place = entry["place"]
    coord = get_coords(place)
    if coord:
        out_dt.append({
            **entry,
            "latitude": coord[0],
            "longitude": coord[1]
        })
    else:
        print("Not found:", place)
        none_file.append(entry)
with open(OUTPUT_FILE, "w", encoding="utf-8") as fout:
    json.dump(out_dt, fout, ensure_ascii=False, indent=4)
with open(NOT_FOUND_FILE, "w", encoding="utf-8") as fout:
    json.dump(none_file, fout, ensure_ascii=False, indent=4)

fd.close()
