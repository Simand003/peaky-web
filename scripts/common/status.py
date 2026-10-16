from collections import Counter

from google.cloud.firestore_v1.base_query import FieldFilter

from common.peaks_file import load_peaks


def count_in_firestore(db, country_name, region_name):
    """Count the peaks of a region on Firestore.

    count() is an aggregation done by the server: we do not download the
    documents, and it is billed as roughly 1 read every 1000 peaks counted.
    """
    query = (
        db.collection("peaks")
        .where(filter=FieldFilter("country", "==", country_name))
        .where(filter=FieldFilter("region", "==", region_name))
    )
    return query.count().get()[0][0].value


def get_region_status(db, country_name, region_names):
    """Return how many peaks each region has on Firestore and in peaks.json.

    Returns (status, without_region):
    - status: dict {region_name: (firestore_count, json_count)};
      json_count is None if peaks.json cannot be read
    - without_region: number of peaks in peaks.json that have no region yet
      (old entries, exported before the region field existed)
    """
    # Count the peaks in peaks.json, grouped by country and region
    json_counts = None
    without_region = 0
    try:
        peaks = load_peaks().values()
        json_counts = Counter((p.get("country"), p.get("region")) for p in peaks)
        without_region = sum(1 for p in peaks if not p.get("region"))
    except ValueError:
        print("Attenzione: peaks.json non è un JSON valido, non posso contare le cime nel file.")

    status = {}
    for region_name in region_names:
        firestore_count = count_in_firestore(db, country_name, region_name)
        json_count = None if json_counts is None else json_counts[(country_name, region_name)]
        status[region_name] = (firestore_count, json_count)

    return status, without_region