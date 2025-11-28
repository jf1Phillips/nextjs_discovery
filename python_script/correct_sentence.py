#!/usr/bin/env python3
from sys import argv
from os import getenv
from groq import Groq
from dotenv import load_dotenv
import json
from time import sleep

if len(argv) < 2:
    print("Usage: python correct_sentence.py <file>")
    exit(1)

filename = argv[1]
load_dotenv()

models = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
]

def get_correct_sentence(text: str, client: Groq, index: int) -> str:
    prompt = f"""Corrige l’orthographe du nom de lieu suivant uniquement s’il contient une faute.
        Si aucune faute n’est trouvée, renvoie-le strictement identique.
        Ne renvoie rien d’autre que le nom du lieu corrigé (pas de markdown, pas d'explication).

        Lieu : "{text}"
    """
    completion = client.chat.completions.create(
        model=models[index % len(models)],
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.1
    )
    response = completion.choices[0].message.content.strip()
    return response

client = Groq(api_key=getenv("AI_API_KEY"))

with open("corrected_" + filename, "r", encoding="utf-8") as fd:
    correct = json.load(fd)
with open("non_corrected_" + filename, "r", encoding="utf-8") as fd:
    non_correct = json.load(fd)
i = 0
while True:
    try:
        with open(filename, "r", encoding="utf-8") as fd:
            data = json.load(fd)[i:]
            for entry in data:
                cor = get_correct_sentence(entry["place"], client, 0)
                if cor == entry["place"]:
                    print(f"Non trouvé pour {entry["place"]}")
                    non_correct.append(entry)
                else:
                    print(f"{entry["place"]} devient {cor}")
                    correct.append({
                        **entry,
                        "place": cor,
                    })
                i += 1
        break
    except:
        sleep(2)
with open("corrected_" + filename, "w", encoding="utf-8") as fd:
    json.dump(correct, fd, ensure_ascii=False, indent=4)
with open("non_corrected_" + filename, "w", encoding="utf-8") as fd:
    json.dump(non_correct, fd, ensure_ascii=False, indent=4)
