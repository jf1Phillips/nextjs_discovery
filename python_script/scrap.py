import requests

response  = requests.get("https://www.cartemarialedumonde.org/build/app.js")

print(response.status_code)
with open("app.js", "w") as f:
    f.write(response.text)
