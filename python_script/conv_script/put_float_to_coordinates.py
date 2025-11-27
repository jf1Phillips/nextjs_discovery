import json
from sys import argv

if len(argv) != 2:
    print("Usage: python put_float_to_coordinates.py <input_file>")
    exit(1)


output_data = []
INPUT_FILE = argv[1]
with open(INPUT_FILE, "r", encoding="utf-8") as fd:
    data = json.load(fd)
for entry in data:
    output_data.append({
        **entry,
        "latitude": float(entry["latitude"]),
        "longitude": float(entry["longitude"])
    })
with open(INPUT_FILE, "w", encoding="utf-8") as fd:
    json.dump(output_data, fd, ensure_ascii=False, indent=4)
print(f"Updated coordinates in {INPUT_FILE}")
