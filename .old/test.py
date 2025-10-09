import cv2
import numpy as np

# Charger l'image PNG
image = cv2.imread("image.png")

# Convertir l'image en espace colorimétrique HSV
hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)

# Définir la plage de couleurs bleues (ajuster si nécessaire)
lower_blue = np.array([100, 150, 50])
upper_blue = np.array([140, 255, 255])

# Appliquer un masque pour isoler les zones bleues
mask = cv2.inRange(hsv, lower_blue, upper_blue)

# Utiliser les contours pour isoler les rivières
contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Afficher l'image avec les contours détectés
for contour in contours:
    cv2.drawContours(image, [contour], -1, (0, 255, 0), 2)

# Sauvegarder l'image résultante si besoin
cv2.imwrite("rivers_detected.png", image)
