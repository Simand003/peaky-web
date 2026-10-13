import json
import os

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter

# Init Firestore (same service account used by add_peak.py)
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Countries and regions (same list used by add_peak.py)
COUNTRIES = {
    "Italia": ["Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna", "Friuli-Venezia Giulia", "Lazio",
               "Liguria", "Lombardia", "Marche", "Molise", "Piemonte", "Puglia", "Sardegna", "Sicilia", "Toscana",
               "Trentino-Alto Adige", "Umbria", "Valle d'Aosta", "Veneto"]
}

# Output path: Vite serves the "public" folder at the site root
OUTPUT_PATH = os.path.join("..", "public", "peaks.json")

# Country selection
print("Seleziona lo stato:")
for i, country in enumerate(COUNTRIES.keys()):
    print(f"{i+1}. {country}")
country_choice = int(input("Scelta: ")) - 1
country_name = list(COUNTRIES.keys())[country_choice]

# Region selection
print(f"\nSeleziona la regione in {country_name}:")
for i, region in enumerate(COUNTRIES[country_name]):
    print(f"{i+1}. {region}")
region_choice = int(input("Scelta: ")) - 1
region_name = COUNTRIES[country_name][region_choice]

print(f"\nEsportazione peaks per {region_name}, {country_name}...")

new_peaks = []

# Read only the peaks of the chosen region: Firestore filters on the server,
# so we pay one read only for the documents that match
query = db.collection("peaks").where(filter=FieldFilter("region", "==", region_name))

for doc in query.stream():
    data = doc.to_dict()
    new_peaks.append({
        "id": doc.id,
        "name": data["name"],
        # Round coordinates: 5 decimals is about 1 meter, enough for a map marker
        "lat": round(data["lat"], 5),
        "lon": round(data["lon"], 5),
        "elevation": data["elevation"],
    })

# Stop early if the region has no peaks: nothing to update
if not new_peaks:
    print(f"Nessuna cima trovata per {region_name}. File non modificato.")
    exit()

# Load the peaks already in peaks.json (if the file exists) and index them by id.
# If the file is not valid JSON this raises an error BEFORE we write anything,
# so the existing file is never damaged.
existing_by_id = {}
if os.path.exists(OUTPUT_PATH):
    with open(OUTPUT_PATH, "r", encoding="utf-8") as f:
        for p in json.load(f):
            existing_by_id[p["id"]] = p

# Merge: a peak with the same id is updated, a new id is added,
# every other peak already in the file is kept untouched
added = 0
updated = 0
for p in new_peaks:
    if p["id"] in existing_by_id:
        updated += 1
    else:
        added += 1
    existing_by_id[p["id"]] = p

peaks = list(existing_by_id.values())

# Highest peaks first: later we can show only the first N at low zoom
peaks.sort(key=lambda p: p["elevation"], reverse=True)

# Compact separators remove spaces, ensure_ascii=False keeps accented letters readable
# One peak per line: still compact, but easy to read and diff
with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    f.write("[\n")
    lines = [json.dumps(p, ensure_ascii=False, separators=(",", ":")) for p in peaks]
    f.write(",\n".join(lines))
    f.write("\n]")

print(f"{region_name}: {added} added, {updated} updated. Total in file: {len(peaks)} -> {OUTPUT_PATH}")