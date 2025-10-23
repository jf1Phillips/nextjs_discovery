import requests
from PIL import Image
from io import BytesIO
from sys import argv

lang = argv[1] if len(argv) >= 2 else "fr"

TILE_SIZE = 256
Z = 4
X_RANGE = range(2**Z)
Y_RANGE = range(2**Z)
URL_TEMPLATE = "https://app.mariavaltorta.com/map/%s/{z}/{x}/{y}.pbf" % (lang)

img_width = TILE_SIZE * len(X_RANGE)
img_height = TILE_SIZE * len(Y_RANGE)
final_img = Image.new("RGB", (img_width, img_height))

for x in X_RANGE:
    for y in Y_RANGE:
        url = URL_TEMPLATE.format(z=Z, x=x, y=y)
        print(f"Téléchargement {url}")
        while 1:
            r = requests.get(url)
            if r.status_code != 200:
                print(f"Erreur téléchargement tile {x},{y}")
                continue
            break
        tile_img = Image.open(BytesIO(r.content))
        final_img.paste(tile_img, (x*TILE_SIZE, y*TILE_SIZE))

final_img.save("map_z%d_final.png" % (Z))
print("Image finale générée : map_z%d_final.png" % (Z))
