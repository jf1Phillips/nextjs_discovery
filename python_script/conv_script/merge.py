import json

file1 = "scrapv2.json"
file2 = "scrapLastv2.json"

fd1 = open(file1, "r", encoding="utf-8")
fd2 = open(file2, "r", encoding="utf-8")

data1 = json.load(fd1)
data2 = json.load(fd2)

final_data = []

for entry in data1:
    dic = {
        "type": "Apparation of the virgin Mary",
        "date": entry["date"],
        "place": entry["place"],
        "visionary": entry["visionary"],
        "title": entry["title"],
        "description": entry["description"],
        "feast": entry["feast"],
        "commemorated": entry["commemorated"],
        "source": entry["source"],
        "peple_involved": "",
        "approval": "",
        "links": entry["links"],
    }
    final_data.append(dic)

for entry in data2:
    dic = {
        "type": "Apparation of the virgin Mary",
        "date": entry["date"],
        "place": entry["place"],
        "visionary": "",
        "title": "",
        "description": "",
        "feast": "",
        "commemorated": "",
        "source": "",
        "peple_involved": entry["People Involved"],
        "approval": entry["Approval of Supernatural character"],
        "links": entry["links"],
    }
    final_data.append(dic)

with open("merged_output.json", "w", encoding="utf-8") as fout:
    json.dump(final_data, fout, ensure_ascii=False, indent=4)

fd1.close()
fd2.close()
