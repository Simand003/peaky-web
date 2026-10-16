from google.cloud.firestore_v1.base_query import FieldFilter

from common.firebase import get_db
from common.peaks_file import PEAKS_PATH, load_peaks, save_peaks
from common.regions import choose_from_list, choose_region

# Connect to Firestore
db = get_db()

# Where to delete from
BOTH = "Firestore e peaks.json"
ONLY_FIRESTORE = "Solo Firestore"
ONLY_JSON = "Solo peaks.json"

# Country and region selection (menus and data come from data/countries.json)
country_name, region_name, _ = choose_region(db)

target = choose_from_list("\nDa dove vuoi eliminare?", [BOTH, ONLY_FIRESTORE, ONLY_JSON])

print(f"\nCerco le cime di {region_name}, {country_name}...")

# Peaks to delete from Firestore (we keep the document references)
refs = []
if target in (BOTH, ONLY_FIRESTORE):
    query = (
        db.collection("peaks")
        .where(filter=FieldFilter("country", "==", country_name))
        .where(filter=FieldFilter("region", "==", region_name))
    )
    refs = [doc.reference for doc in query.stream()]

# Peaks to delete from peaks.json (we keep their ids)
peaks_by_id = {}
ids_to_remove = set()
if target in (BOTH, ONLY_JSON):
    peaks_by_id = load_peaks()
    # Peaks of the chosen region according to the file itself
    ids_to_remove = {
        peak_id for peak_id, p in peaks_by_id.items()
        if p.get("country") == country_name and p.get("region") == region_name
    }
    # Older entries may not have country/region yet: when deleting from both,
    # the ids found on Firestore tell us which ones to remove from the file
    ids_to_remove |= {ref.id for ref in refs if ref.id in peaks_by_id}

# Summary before doing anything
if target in (BOTH, ONLY_FIRESTORE):
    print(f"Cime su Firestore: {len(refs)}")
if target in (BOTH, ONLY_JSON):
    print(f"Cime in peaks.json: {len(ids_to_remove)}")

if not refs and not ids_to_remove:
    print("Niente da eliminare.")
    exit()

# Confirmation: the user must type a word, so it cannot happen by accident
print(f"\nStai per eliminare le cime di {region_name} ({target}).")
if refs:
    print("L'eliminazione da Firestore NON si può annullare.")
answer = input("Per confermare scrivi ELIMINA: ")
if answer.strip() != "ELIMINA":
    print("Annullato. Non è stato eliminato nulla.")
    exit()

# Delete from Firestore first: if it fails, peaks.json is still untouched
if refs:
    batch = db.batch()
    for i, ref in enumerate(refs, start=1):
        batch.delete(ref)
        # Firestore limit: max 500 writes per batch
        if i % 500 == 0:
            batch.commit()
            batch = db.batch()
    # Final commit for the remaining peaks
    if len(refs) % 500 != 0:
        batch.commit()
    print(f"Eliminate da Firestore: {len(refs)}")

# Then remove the same peaks from peaks.json
if ids_to_remove:
    remaining = [p for peak_id, p in peaks_by_id.items() if peak_id not in ids_to_remove]
    save_peaks(remaining)
    print(f"Eliminate da peaks.json: {len(ids_to_remove)}. Rimaste nel file: {len(remaining)} -> {PEAKS_PATH}")