from os import getenv
from groq import Groq
from dotenv import load_dotenv
import json

load_dotenv()

class WeatherInfo:
    def __init__(self, rain=False, snow=False,
                 windy=False, foggy=False, stormy=False):
        self.rain = rain
        self.snow = snow
        self.windy = windy
        self.foggy = foggy
        self.stormy = stormy

    def __repr__(self):
        attrs = {k: v for k, v in self.__dict__.items() if v}
        return f"{', '.join(f'{k}={v}' for k, v in attrs.items())}"

def extract_weather(text: str) -> WeatherInfo:
    client = Groq(api_key=getenv("AI_API_KEY"))

    prompt = f"""Analyse le texte suivant et détermine les conditions météo présentes.
Réponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas d'explication).
Format attendu :
{{
    "rain": true/false,
    "snow": true/false,
    "windy": true/false,
    "foggy": true/false,
    "stormy": true/false
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

# Exemples d'utilisation
if __name__ == "__main__":
    exemples = [
        "Il fait beau et chaud",
        "Il pleut des cordes et il fait froid",
        "Journée ensoleillée avec quelques nuages",
        "Tempête de neige avec des vents violents",
        "Brouillard dense ce matin",
        "Temps orageux avec de fortes précipitations"
    ]

    for texte in exemples:
        print(f"\nTexte : {texte}")
        meteo = extract_weather(texte)
        print(f"Résultat : {meteo}")
