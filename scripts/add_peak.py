import requests
import firebase_admin
from firebase_admin import credentials, firestore
from tqdm import tqdm

# 🔹 INIT FIRESTORE
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# 🔹 DEFINIZIONE STATI E REGIONI
COUNTRIES = {
    "Italia": ["Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna", "Friuli-Venezia Giulia", "Lazio",
               "Liguria", "Lombardia", "Marche", "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
               "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto"]
}

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

# 🔹 SELEZIONE STATO
print("Seleziona lo stato:")
for i, country in enumerate(COUNTRIES.keys()):
    print(f"{i+1}. {country}")
country_choice = int(input("Scelta: ")) - 1
country_name = list(COUNTRIES.keys())[country_choice]

# 🔹 SELEZIONE REGIONE
print(f"\nSeleziona la regione in {country_name}:")
for i, region in enumerate(COUNTRIES[country_name]):
    print(f"{i+1}. {region}")
region_choice = int(input("Scelta: ")) - 1
region_name = COUNTRIES[country_name][region_choice]

print(f"\nImportazione peaks per {region_name}, {country_name}...")

# 🔹 RICHIESTA OVERPASS
query = f"""
[out:json][timeout:25];
area["name"="{region_name}"]["boundary"="administrative"]->.searchArea;
node["natural"="peak"](area.searchArea);
out;
"""

HEADERS = {"User-Agent": "peaky-web-importer/1.0 (simone.renna@gmail.com)"}

response = requests.post(OVERPASS_URL, data={"data": query}, headers=HEADERS)

if response.status_code != 200:
    print("Errore HTTP:", response.status_code)
    exit()

data = response.json()
elements = data.get("elements", [])
print(f"Totale elementi trovati: {len(elements)}")

# 🔹 INSERIMENTO FIRESTORE CON PROGRESS BAR
batch = db.batch()
count = 0

for el in tqdm(elements, desc="Import peaks"):
    tags = el.get("tags", {})

    name = tags.get("name")
    lat = el.get("lat")
    lon = el.get("lon")
    ele_str = tags.get("ele")

    # 🔥 FILTRO DATI COMPLETI
    if not name or not lat or not lon or not ele_str:
        continue

    # 🔹 PARSE ELEVATION
    try:
        ele_str = ele_str.lower().replace("m", "").strip()
        ele_str = ele_str.replace(",", ".")
        elevation = int(float(ele_str))
    except:
        continue

    # 🔹 VALIDAZIONE FINALE
    if elevation <= 0:
        continue

    peak_id = str(el.get("id"))

    peak_data = {
        "name": name,
        "lat": lat,
        "lon": lon,
        "elevation": elevation,
        "source": "OSM",
        "osm_id": el.get("id"),
        # TODO: SPOSTARE
        # "total_climbs": 0,
        # "total_climbers": 0,
        "country": country_name,
        "region": region_name
    }

    doc_ref = db.collection("peaks").document(peak_id)
    batch.set(doc_ref, peak_data, merge=True)

    count += 1

    # FIRESTORE LIMIT: max 500 per batch
    if count % 500 == 0:
        batch.commit()
        batch = db.batch()

# commit finale
batch.commit()

print(f"\nTotale cime salvate: {count}")