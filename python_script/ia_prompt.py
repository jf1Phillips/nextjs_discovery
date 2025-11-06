#!/usr/bin/env python3
import pandas as pd
import argparse
from os.path import isfile

parser = argparse.ArgumentParser()
parser.add_argument("-f", "--file")
parser.add_argument("-s", "--start")

args = parser.parse_args()
try:
    if args.start == None:
        start = 0
    else:
        start = int(args.start)
except:
    parser.exit(84, "Start must be an integer\n")
filename = args.file
if filename == None or not isfile(filename):
    parser.exit(84, "The file doesn't exist\n")

from os import getenv
from groq import Groq
from dotenv import load_dotenv
import json

load_dotenv()

class WeatherInfo:
    def __init__(self, rain=False, snow=False,
                 wind=False, fog=False, storm=False, night=False):
        self.rain = rain
        self.snow = snow
        self.wind = wind
        self.fog = fog
        self.storm = storm
        self.night = night

    def get_weather_str(self):
        return "|".join(["%r" % (value) for _, value in vars(self).items()])

    def __repr__(self):
        infos = [f"{key}: {value}" for key, value in vars(self).items()]
        return ", ".join(infos)

def extract_weather(text: str, client: Groq) -> WeatherInfo:
    prompt = f"""Analyse le texte suivant et identifie les conditions atmosphériques et temporelles présentes ou fortement suggérées.
        Consignes :
        - rain: présence de pluie, averses, ou précipitations liquides
        - snow: présence de neige ou précipitations neigeuses
        - wind: présence de vent notable (pas juste une brise légère)
        - fog: présence de brouillard, brume épaisse, ou visibilité réduite
        - storm: présence d'orage, tempête, conditions violentes
        - night: le contexte indique clairement un moment nocturne (nuit explicite, heures nocturnes, ambiance nocturne décrite)

        Pour "night", sois conservateur : ne le marquer true que si le contexte temporel nocturne est clair.
        Pour les autres, tu peux inférer même si ce n'est pas dit littéralement.

        Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas d'explication).
        {{
            "rain": true/false,
            "snow": true/false,
            "wind": true/false,
            "fog": true/false,
            "storm": true/false,
            "night": true/false
        }}
    Texte à analyser : "{text}"
    """

    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.1
    )
    response = completion.choices[0].message.content.strip()
    if response.startswith("```"):
        response = response.split("```")[1]
        if response.startswith("json"):
            response = response[4:]
        response = response.strip()

    try:
        weather_data = json.loads(response)
        return WeatherInfo(**weather_data)
    except json.JSONDecodeError as e:
        print(f"Erreur lors du parsing JSON : {e}")
        print(f"Réponse reçue : {response}")
        return WeatherInfo()

client = Groq(api_key=getenv("AI_API_KEY"))

csv = pd.read_csv(filename, delimiter='|', encoding="utf-8")
csv.info()

# print("t|bible reference|texte|rain|snow|wind|fog|storm|night")
file = open("ex.csv", "a", encoding="utf-8")
try:
    for i, row in csv.iloc[start:].iterrows():
        testement = row["t"]
        book = row["livre"]
        chapter = row["chapitre"]
        verse = row["verset"]
        texte = row["texte"]
        weather = extract_weather(texte, client=client)
        end_str = "|".join([testement, "%s %s,%s" % (book, chapter, verse),
                        texte, weather.get_weather_str()])
        file.write(end_str + "\n")
        print("\rprocessing...%d/%d" % (i+1, len(csv)), end="")
    file.close()
    print("\nDone !")
except:
    file.close()
    print("")
