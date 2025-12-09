import pandas as pd

file = "bible_with_meteo.csv"
output = "meteo_bible.csv"

try:
    df_file = pd.read_csv(file, delimiter="|")
except:
    print("File not found")
    exit(1)

dt_output = {"t": [], "bible reference": [], "texte": [], "rain": [], "snow": [], "wind": [], "fog": [], "storm": [], "night": []}
all_meteo = ["rain", "snow", "wind", "fog", "storm", "night"]

for row in df_file.iloc:
    valid = False
    for meteo in all_meteo:
        if row[meteo] == True:
            valid = True
            break
    if valid == False:
        continue
    for key in dt_output:
        dt_output[key].append(row[key])
pd.DataFrame(dt_output).to_csv(output, encoding="utf-8", sep="|", index=False)
