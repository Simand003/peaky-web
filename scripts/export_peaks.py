from google.cloud.firestore_v1.base_query import FieldFilter

from common.firebase import get_db
from common.peaks_file import PEAKS_PATH, load_peaks, save_peaks
from common.regions import choose_region

# Connect to Firestore
db = get_db()

# Country and region selection (menus and data come from data/countries.json)
country_name, region_name, _ = choose_region(db)

print(f"\nEsportazione peaks per {region_name}, {country_name}...")

new_peaks = []

# Read only the peaks of the chosen region: Firestore filters on the server,
# so we pay one read only for the documents that match
query = (
    db.collection("peaks")
    .where(filter=FieldFilter("country", "==", country_name))
    .where(filter=FieldFilter("region", "==", region_name))
)

for doc in query.stream():
    data = doc.to_dict()
    new_peaks.append({
        "id": doc.id,
        "name": data["name"],
        # Round coordinates: 5 decimals is about 1 meter, enough for a map marker
        "lat": round(data["lat"], 5),
        "lon": round(data["lon"], 5),
        "elevation": data["elevation"],
        # Needed by the site filters (country and region)
        "country": data["country"],
        "region": data["region"],
    })

# Stop early if the region has no peaks: nothing to update
if not new_peaks:
    print(f"Nessuna cima trovata per {region_name}. File non modificato.")
    exit()

# Load the peaks already in peaks.json, indexed by id
peaks_by_id = load_peaks()

# Merge: a peak with the same id is updated, a new id is added,
# every other peak already in the file is kept untouched
added = 0
updated = 0
for p in new_peaks:
    if p["id"] in peaks_by_id:
        updated += 1
    else:
        added += 1
    peaks_by_id[p["id"]] = p

save_peaks(peaks_by_id.values())

print(f"{region_name}: {added} added, {updated} updated. Total in file: {len(peaks_by_id)} -> {PEAKS_PATH}")