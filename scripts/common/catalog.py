import hashlib
import json
import os

# The catalog lives in public/data/peaks/ (Vite serves "public" at the site root):
#   manifest.json   small index of all the regions
#   IT-25.json      the peaks of one region (the file name is the region code)
# The path is built from this file's location, so it is right from any launch folder.
DATA_DIR = os.path.normpath(os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "..",
    "public",
    "data",
    "peaks",
))
MANIFEST_PATH = os.path.join(DATA_DIR, "manifest.json")


def region_path(code):
    """Path of the JSON file with the peaks of one region."""
    return os.path.join(DATA_DIR, f"{code}.json")


def _write_bytes(path, data):
    """Write a file in one step, so a crash never leaves a half-written file."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    tmp_path = path + ".tmp"
    with open(tmp_path, "wb") as f:
        f.write(data)
    # Replacing the old file is a single operation
    os.replace(tmp_path, path)


def load_manifest():
    """Read manifest.json. Returns an empty manifest if it does not exist yet.

    If the file is not valid JSON this raises ValueError, so the callers stop
    before they can overwrite a damaged file.
    """
    if not os.path.exists(MANIFEST_PATH):
        return {"regions": []}

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def save_manifest(manifest):
    """Write manifest.json, with the regions sorted by code."""
    # Sorted, so the file in Git only changes when something really changed
    manifest["regions"].sort(key=lambda entry: entry["code"])
    text = json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    _write_bytes(MANIFEST_PATH, text.encode("utf-8"))


def find_entry(manifest, code):
    """Return the manifest entry of a region, or None if it is not in the catalog."""
    for entry in manifest["regions"]:
        if entry["code"] == code:
            return entry
    return None


def load_region_peaks(code):
    """Return the peaks of a region as a dict {id: peak}. Empty if never imported."""
    path = region_path(code)
    if not os.path.exists(path):
        return {}

    with open(path, "r", encoding="utf-8") as f:
        return {peak["id"]: peak for peak in json.load(f)}


def save_region(region, peaks_by_id):
    """Write the file of a region and update its entry in the manifest.

    region: any object with the attributes country, country_code, name and code.
    peaks_by_id: dict {id: peak}, with every peak that must be in the file.
    Returns the new manifest entry.
    """
    # Read the manifest BEFORE writing anything: if it is damaged this raises
    # an error and the region file is left untouched
    manifest = load_manifest()

    # Highest peaks first (then by id, so the order is always the same)
    peaks = sorted(peaks_by_id.values(), key=lambda p: (-p["elevation"], p["id"]))

    # One peak per line: compact, but easy to read and to compare in Git
    lines = [json.dumps(p, ensure_ascii=False, separators=(",", ":")) for p in peaks]
    data = ("[\n" + ",\n".join(lines) + "\n]\n").encode("utf-8")

    _write_bytes(region_path(region.code), data)

    latitudes = [p["lat"] for p in peaks]
    longitudes = [p["lon"] for p in peaks]
    entry = {
        "code": region.code,
        "countryCode": region.country_code,
        "country": region.country,
        "region": region.name,
        "file": f"{region.code}.json",
        # The site asks for "file?v=version": a new version means a new download,
        # the same version means the browser keeps using its copy
        "version": hashlib.sha1(data).hexdigest()[:8],
        "count": len(peaks),
        "bytes": len(data),
        # [south, west, north, east]: lets the site load only the regions in view
        "bbox": [min(latitudes), min(longitudes), max(latitudes), max(longitudes)],
        "maxElevation": peaks[0]["elevation"],
    }

    manifest["regions"] = [e for e in manifest["regions"] if e["code"] != region.code]
    manifest["regions"].append(entry)
    save_manifest(manifest)

    return entry


def remove_region(code):
    """Remove a region from the catalog: its manifest entry and its file."""
    manifest = load_manifest()
    manifest["regions"] = [e for e in manifest["regions"] if e["code"] != code]
    # Manifest first: the site never points to a file that is already gone
    save_manifest(manifest)

    path = region_path(code)
    if os.path.exists(path):
        os.remove(path)