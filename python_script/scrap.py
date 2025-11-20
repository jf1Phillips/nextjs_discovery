import requests
from bs4 import BeautifulSoup
import re

URL = "https://www.miraclehunter.com/marian_apparitions/approved_apparitions/apparitions_1000-1099.html"
BASEURL = "https://www.miraclehunter.com/marian_apparitions/approved_apparitions/"

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
        if len(tds) == 3:
            row = [re.sub(r"\s+", " ", str(td.get_text(strip=False))).strip() for td in tds]
            if not ("Contact The Miracle Hunter" in row):
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
    end_urls = get_select(URL)
    for end in end_urls:
        print(BASEURL+end)
        data = scrape_table(BASEURL+end)
        with open("scrap.csv", "a") as file:
            for row in data:
                file.write('|'.join(row))
                file.write("\n")
