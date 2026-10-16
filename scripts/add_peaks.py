import time

import requests
from tqdm import tqdm

from common.firebase import get_db
from common.regions import choose_region

# Connect to Firestore
db = get_db()

# Public Overpass servers: if one is overloaded we try the next one
OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]

HEADERS = {"User-Agent": "peaky-web-importer/1.0 (simone.renna@gmail.com)"}

# Country and region selection (menus and data come from data/countries.json)
country_name, region_name, iso_code = choose_region(db)

print(f"\nImportazione peaks per {region_name}, {country_name}...")

# A region code has a dash (e.g. IT-25) and is stored by OSM in the ISO3166-2 tag.
# A code without a dash (e.g. SI) is a whole country, stored in the ISO3166-1 tag.
iso_tag = "ISO3166-2" if "-" in iso_code else "ISO3166-1"

# Search the area by ISO code (fast) instead of by name (slow and fragile)
query = f"""
[out:json][timeout:120];
area["{iso_tag}"="{iso_code}"]->.searchArea;
node["natural"="peak"](area.searchArea);
out;
"""

# Try every server, up to 3 rounds, waiting a bit longer after each failed round
data = None
for attempt in range(1, 4):
    for url in OVERPASS_URLS:
        print(f"Tentativo {attempt}: {url}")
        try:
            r = requests.post(url, data={"data": query}, headers=HEADERS, timeout=150)
        except requests.RequestException as e:
            print("Errore di rete:", e)
            continue

        if r.status_code != 200:
            print("Errore HTTP:", r.status_code)
            continue

        try:
            result = r.json()
        except ValueError:
            print("Risposta non valida (non è JSON)")
            continue

        # An overloaded server can answer 200 OK but with a "remark" (for example
        # "Query timed out") and an empty list: that is a failure, not "no peaks"
        if "remark" in result:
            print("Il server ha segnalato un problema:", result["remark"])
            continue

        data = result
        break
    if data is not None:
        break
    time.sleep(10 * attempt)

if data is None:
    print("Tutti i server hanno fallito. Riprova più tardi.")
    exit()

elements = data.get("elements", [])
print(f"Totale elementi trovati: {len(elements)}")

# A real answer with 0 elements means the area was not found (wrong ISO code)
if not elements:
    print(f"Nessuna cima trovata: controlla il codice '{iso_code}' in countries.json.")
    exit()

# Step 1: keep only the peaks with complete data. Nothing is written yet.
valid_peaks = []  # list of (peak_id, peak_data)

for el in elements:
    tags = el.get("tags", {})

    name = tags.get("name")
    lat = el.get("lat")
    lon = el.get("lon")
    ele_str = tags.get("ele")

    # Skip peaks with incomplete data
    if not name or not lat or not lon or not ele_str:
        continue

    # Parse the elevation (OSM values like "2130", "2130 m", "2130,5")
    try:
        ele_str = ele_str.lower().replace("m", "").strip()
        ele_str = ele_str.replace(",", ".")
        elevation = int(float(ele_str))
    except ValueError:
        continue

    # Final validation
    if elevation <= 0:
        continue

    peak_data = {
        "name": name,
        "lat": lat,
        "lon": lon,
        "elevation": elevation,
        "source": "OSM",
        "osm_id": el.get("id"),
        "country": country_name,
        "region": region_name,
    }

    valid_peaks.append((str(el.get("id")), peak_data))

skipped = len(elements) - len(valid_peaks)
print(f"Cime con dati completi: {len(valid_peaks)} (scartate {skipped} con dati incompleti)")

if not valid_peaks:
    print("Nessuna cima valida da salvare.")
    exit()

# Step 2: ask for authorization before writing anything to Firestore
elevations = [peak_data["elevation"] for _, peak_data in valid_peaks]
print(f"Quota delle cime: da {min(elevations)} a {max(elevations)} m")

answer = input(f"\nSalvare {len(valid_peaks)} cime su Firestore? (s/n): ")
if answer.strip().lower() != "s":
    print("Annullato. Non è stato salvato nulla.")
    exit()

# Step 3: save to Firestore with a progress bar
batch = db.batch()

for count, (peak_id, peak_data) in enumerate(tqdm(valid_peaks, desc="Import peaks"), start=1):
    doc_ref = db.collection("peaks").document(peak_id)
    batch.set(doc_ref, peak_data, merge=True)

    # Firestore limit: max 500 writes per batch
    if count % 500 == 0:
        batch.commit()
        batch = db.batch()

# Final commit for the remaining peaks
if len(valid_peaks) % 500 != 0:
    batch.commit()

print(f"\nTotale cime salvate: {len(valid_peaks)}")