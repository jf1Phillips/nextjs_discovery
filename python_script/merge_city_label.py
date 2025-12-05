import pandas as pd

file1 = "../utils/city_label.csv"
file2 = "src_files/maria_valtorta_parse_data.csv"

csv1 = pd.read_csv(file1, delimiter=",", encoding="utf-8")
csv2 = pd.read_csv(file2, delimiter=",", encoding="utf-8")

ouput = {"long": [], "lat": [], "fr": [], "url": []}

names = [row["name"] for row in csv2.iloc]

for row in csv1.iloc:
    if row["fr"] in names:
        continue
    ouput["lat"].append(row["lat"])
    ouput["long"].append(row["long"])
    ouput["fr"].append(row["fr"])
    ouput["url"].append("")

for row in csv2.iloc:
    ouput["lat"].append(row["latitude"])
    ouput["long"].append(row["longitude"])
    ouput["fr"].append(row["name"])
    ouput["url"].append(row["url"])
dt = pd.DataFrame(ouput)
dt.to_csv("merged_csv.csv", sep=",", index=False)
