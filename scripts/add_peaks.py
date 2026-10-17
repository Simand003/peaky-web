import sys

from common.catalog import load_manifest, load_region_peaks, region_path, save_region
from common.overpass import fetch_peak_nodes
from common.regions import choose_region

# Country and region selection (menus and data come from data/countries.json)
region = choose_region()

# Stop now if manifest.json is damaged, before downloading anything
try:
    load_manifest()
except ValueError:
    print("\nmanifest.json non è un JSON valido: sistemalo o eliminalo prima di importare.")
    sys.exit()

print(f"\nImportazione peaks per {region.name}, {region.country}...")

# Download the peaks from OpenStreetMap
elements = fetch_peak_nodes(region.code)

if elements is None:
    print("Tutti i server hanno fallito. Riprova più tardi.")
    sys.exit()

print(f"Totale elementi trovati: {len(elements)}")

# A real answer with 0 elements means the area was not found (wrong ISO code)
if not elements:
    print(f"Nessuna cima trovata: controlla il codice '{region.code}' in countries.json.")
    sys.exit()

# Step 1: keep only the peaks with valid data, in the format of the catalog
new_peaks = {}  # {id: peak}

for el in elements:
    tags = el.get("tags", {})

    name = (tags.get("name") or "").strip()
    lat = el.get("lat")
    lon = el.get("lon")
    ele_str = tags.get("ele")

    # Skip peaks with incomplete data
    if not name or lat is None or lon is None or not ele_str:
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

    # The OSM node id, as a string, is the id of the peak everywhere in the site.
    # It must never change.
    peak_id = str(el["id"])

    new_peaks[peak_id] = {
        "id": peak_id,
        "name": name,
        # 5 decimals is about 1 meter, enough for a map marker
        "lat": round(lat, 5),
        "lon": round(lon, 5),
        "elevation": elevation,
    }

skipped = len(elements) - len(new_peaks)
print(f"Cime con dati completi: {len(new_peaks)} (scartate {skipped} con dati incompleti)")

if not new_peaks:
    print("Nessuna cima valida da salvare.")
    sys.exit()

# Step 2: compare with the peaks already in the catalog for this region
existing = load_region_peaks(region.code)

added = [i for i in new_peaks if i not in existing]
changed = [i for i in new_peaks if i in existing and existing[i] != new_peaks[i]]
# Peaks that are in the catalog but no longer in OSM. We keep them: an id must never
# disappear, or the climbs that use it would lose the peak.
kept = [i for i in existing if i not in new_peaks]
unchanged = len(new_peaks) - len(added) - len(changed)

elevations = [p["elevation"] for p in new_peaks.values()]
print(f"Quota delle cime: da {min(elevations)} a {max(elevations)} m")
print(f"\nCatalogo di {region.name} ({region.code}):")
print(f"  nuove:      {len(added)}")
print(f"  modificate: {len(changed)}")
print(f"  invariate:  {unchanged}")
if kept:
    print(f"  non più su OpenStreetMap (le tengo): {len(kept)}")

if not added and not changed:
    print("\nIl catalogo è già aggiornato. Non c'è nulla da salvare.")
    sys.exit()

# Step 3: ask for authorization before writing anything
answer = input(f"\nAggiornare il catalogo di {region.name}? (s/n): ")
if answer.strip().lower() != "s":
    print("Annullato. Non è stato salvato nulla.")
    sys.exit()

# Step 4: merge and save. New data wins over old data, kept peaks stay as they are.
merged = {**existing, **new_peaks}
entry = save_region(region, merged)

print(f"\nSalvato {region_path(region.code)}")
print(f"{entry['count']} cime, {entry['bytes'] / 1024:.0f} KB (versione {entry['version']})")