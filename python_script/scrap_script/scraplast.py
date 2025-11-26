import requests
import json
from bs4 import BeautifulSoup
import re

URL = "https://www.miraclehunter.com/marian_apparitions/approved_apparitions/index.html"
BASEURL = "https://www.miraclehunter.com/marian_apparitions/approved_apparitions/"
EXPORT_FILE = "scrapLastv2.json"

def rmEndLine(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()

def scrape_table(url):
    html = requests.get(url).text
    soup = BeautifulSoup(html, "html.parser")

    all_tables = soup.find_all("table")
    target_table = None

    for table in all_tables:
        trs = table.find_all("tr")
        count_3td = sum(1 for tr in trs if len(tr.find_all("td")) == 4)
        if count_3td >= 5:
            target_table = table
            break
    if not target_table:
        raise RuntimeError("Impossible de trouver le tableau final !")
    results = []
    for tr in target_table.find_all("tr"):
        tds = tr.find_all("td")
        links = tr.find_all("a")
        if len(tds) == 4:
            row = [td.get_text(strip=False) for td in tds]
            if not ("Contact The Miracle Hunter" in row):
                for link in links:
                    href = link.get("href", "")
                    if href != "":
                        if not href.startswith("http"):
                            href = BASEURL + href
                        row.append(href)
                results.append(row)
    return results[2:]

if __name__ == "__main__":
    json_data = []
    print(URL)
    data = scrape_table(URL)
    for row in data:
        newList = {
            "date": rmEndLine(row[0]),
            "place": rmEndLine(row[1]),
            "People Involved": rmEndLine(row[2]),
            "Approval of Supernatural character": rmEndLine(row[3]),
            "links": row[4:],
        }
        json_data.append(newList)


    with open(EXPORT_FILE, "w", encoding="utf-8") as f:
        json.dump(json_data, f, ensure_ascii=False, indent=4)
