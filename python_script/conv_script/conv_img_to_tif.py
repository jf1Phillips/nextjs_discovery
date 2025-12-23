from PIL import Image
import rasterio
from rasterio.transform import from_bounds
import numpy as np

def webp_to_geotiff(webp_path, tif_path, bounds, crs='EPSG:4326'):
    """
    Convertit un fichier WebP en GeoTIFF avec des coordonnées géographiques.
    Args:
        webp_path: chemin vers le fichier WebP
        tif_path: chemin de sortie pour le GeoTIFF
        bounds: tuple (left, bottom, right, top) avec les coordonnées
        crs: système de coordonnées (par défaut WGS84)
    """
    # Ouvrir l'image WebP
    img = Image.open(webp_path)
    img_array = np.array(img)
    if len(img_array.shape) == 2:
        count = 1
        img_array = img_array[np.newaxis, :, :]
    else:
        count = img_array.shape[2]
        img_array = np.transpose(img_array, (2, 0, 1))
    height, width = img.size[1], img.size[0]
    transform = from_bounds(bounds[0], bounds[1], bounds[2], bounds[3], 
                           width, height)
    with rasterio.open(
        tif_path,
        'w',
        driver='GTiff',
        height=height,
        width=width,
        count=count,
        dtype=img_array.dtype,
        crs=crs,
        transform=transform,
        compress='lzw' # compression optionnelle
    ) as dst:
        dst.write(img_array)

    print(f"Conversion réussie : {tif_path}")

# Exemple d'utilisation
webp_file = "pef_1880_map.webp"
tif_file = "pef_1880_map.tif"

# Tes bounds : (left, bottom, right, top)
bounds = (34.120542941238725 + 0.008,
            31.10529446421723 - 0.0058,
            35.7498100593699 + 0.008,
            33.46703792406347 + 0.003) # lon_min, lat_min, lon_max, lat_max

# webp_to_geotiff(webp_file, tif_file, bou
webp_to_geotiff(webp_file, tif_file, bounds=bounds)

