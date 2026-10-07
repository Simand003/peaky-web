import json
import os

import firebase_admin
from firebase_admin import credentials, firestore

# Init Firestore (same service account used by add_peak.py)
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Output path: Vite serves the "public" folder at the site root
OUTPUT_PATH = os.path.join("..", "public", "peaks.json")

peaks = []

# stream() reads the whole collection (one read per document, done once here)
for doc in db.collection("peaks").stream():
    data = doc.to_dict()
    peaks.append({
        "id": doc.id,
        "name": data["name"],
        # Round coordinates: 5 decimals is about 1 meter, enough for a map marker
        "lat": round(data["lat"], 5),
        "lon": round(data["lon"], 5),
        "elevation": data["elevation"],
    })

# Highest peaks first: later we can show only the first N at low zoom
peaks.sort(key=lambda p: p["elevation"], reverse=True)

# Compact separators remove spaces, ensure_ascii=False keeps accented letters readable
# One peak per line: still compact, but easy to read and diff
with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    f.write("[\n")
    lines = [json.dumps(p, ensure_ascii=False, separators=(",", ":")) for p in peaks]
    f.write(",\n".join(lines))
    f.write("\n]")
    
print(f"Exported {len(peaks)} peaks to {OUTPUT_PATH}")