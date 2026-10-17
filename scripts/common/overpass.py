import time

import requests

# Public Overpass servers: if one is overloaded we try the next one
OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]

HEADERS = {"User-Agent": "peaky-web-importer/1.0 (simone.renna@gmail.com)"}


def fetch_peak_nodes(iso_code):
    """Download the OSM peaks (with name and elevation) inside an area.

    iso_code: ISO 3166 code of the area, e.g. "IT-25" (a region) or "SI" (a country).
    Returns the list of OSM nodes, or None if every server failed.
    An empty list is a real answer: the area exists but has no peaks, or it was not found.
    """
    # A region code has a dash (e.g. IT-25) and is stored by OSM in the ISO3166-2 tag.
    # A code without a dash (e.g. SI) is a whole country, stored in the ISO3166-1 tag.
    iso_tag = "ISO3166-2" if "-" in iso_code else "ISO3166-1"

    # Search the area by ISO code (fast) instead of by name (slow and fragile).
    # We ask only for peaks that have a name and an elevation: we would discard
    # the others anyway, and a smaller answer is easier for the server.
    query = f"""
[out:json][timeout:120];
area["{iso_tag}"="{iso_code}"]->.searchArea;
node["natural"="peak"]["name"]["ele"](area.searchArea);
out;
"""

    # Try every server, up to 3 rounds, waiting a bit longer after each failed round
    for attempt in range(1, 4):
        for url in OVERPASS_URLS:
            print(f"Tentativo {attempt}: {url}")
            try:
                response = requests.post(url, data={"data": query}, headers=HEADERS, timeout=150)
            except requests.RequestException as e:
                print("Errore di rete:", e)
                continue

            if response.status_code != 200:
                print("Errore HTTP:", response.status_code)
                continue

            try:
                result = response.json()
            except ValueError:
                print("Risposta non valida (non è JSON)")
                continue

            # An overloaded server can answer 200 OK but with a "remark" (for example
            # "Query timed out") and an empty list: that is a failure, not "no peaks"
            if "remark" in result:
                print("Il server ha segnalato un problema:", result["remark"])
                continue

            return result.get("elements", [])

        time.sleep(10 * attempt)

    return None