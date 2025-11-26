import requests
import json
from bs4 import BeautifulSoup
import re

URL = "https://www.miraclehunter.com/marian_apparitions/approved_apparitions/apparitions_1000-1099.html"
BASEURL = "https://www.miraclehunter.com/marian_apparitions/approved_apparitions/"
EXPORT_FILE = "scrapv2.json"

def rmEndLine(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()

def extract_description(text, field_names):
    description_lines = []
    fields = {f.lower() for f in field_names}

    for line in text.strip().split("\n"):
        stripped = line.strip()
        if not stripped:
            continue
        lower = stripped.lower()
        if any(lower.startswith(f) for f in fields):
            continue
        description_lines.append(stripped)
    return " ".join(description_lines).splitlines()

def parseLine(text: str) -> list[str]:
    data = {
        "visionary": "",
        "title": "",
        "description": "",
        "feast": "",
        "commemorated": "",
        "source": "",
    }

    # visionary
    match = re.search(r"visionar(?:y|ies):\s*(.*)", text, re.IGNORECASE)
    if match:
        data["visionary"] = rmEndLine(match.group(1).strip())

    # title
    match = re.search(r"title:\s*(.*)", text, re.IGNORECASE)
    if match:
        data["title"] = rmEndLine(match.group(1).strip())

    # feast
    match = re.search(r"feast:\s*(.*)", text, re.IGNORECASE)
    if match:
        data["feast"] = rmEndLine(match.group(1).strip())

    # commemorated
    match = re.search(r"commemorated:\s*(.*)", text, re.IGNORECASE)
    if match:
        data["commemorated"] = rmEndLine(match.group(1).strip())

    # source
    match = re.search(r"source:\s*(.*)", text, re.IGNORECASE | re.DOTALL)
    if match:
        data["source"] = rmEndLine(match.group(1).strip())

    # description
    fields = ["Visionary:", "Visionaries:", "Title:", "Source:", "Feast:", "Commemorated:"]
    description = extract_description(text, fields)

    data["description"] = rmEndLine(" ".join(description))
    return data

def scrape_table(url):
    html = requests.get(url).text
    soup = BeautifulSoup(html, "html.parser")
    all_tables = soup.find_all("table")
    target_table = None
    for table in all_tables:
        trs = table.find_all("tr")
        count_3td = sum(1 for tr in trs if len(tr.find_all("td")) == 3)
        if count_3td >= 5:
            target_table = table
            break
    if not target_table:
        raise RuntimeError("Impossible de trouver le tableau final !")
    results = []
    for tr in target_table.find_all("tr"):
        tds = tr.find_all("td")
        links = tr.find_all("a")
        if len(tds) == 3:
            row = [td.get_text(strip=False) for td in tds]
            if not ("Contact The Miracle Hunter" in row):
                for link in links:
                    href = link.get("href", "")
                    if href != "":
                        if href.startswith("http"):
                            row.append(href)
                        else:
                            row.append(BASEURL+href)
                results.append(row)
    return results[1:]

def get_select(url):
    html = requests.get(url).text
    soup = BeautifulSoup(html, "html.parser")
    select: BeautifulSoup = soup.find("select")
    options = select.find_all("option")
    result = []
    for opt in options:
        result.append(opt.get("value", "").strip())
    return result[1:]

if __name__ == "__main__":
    json_data = []
    end_urls = get_select(URL)[:-1]
    for end in end_urls:
        print(BASEURL+end)
        data = scrape_table(BASEURL+end)
        for row in data:
            parse = parseLine(row[2])
            newList = {
                "date": rmEndLine(row[0]),
                "place": rmEndLine(row[1]),
                **parse,
                "links": row[3:]
            }
            json_data.append(newList)


    with open(EXPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(json_data, f, ensure_ascii=False, indent=4)
