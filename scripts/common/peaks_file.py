import json
import os

# Output path: Vite serves the "public" folder at the site root.
# Built from this file's location, so it is right from any launch folder.
PEAKS_PATH = os.path.normpath(os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "..",
    "public",
    "peaks.json",
))


def load_peaks():
    """Read peaks.json and return the peaks as a dict {id: peak}.

    Returns an empty dict if the file does not exist yet. If the file is not
    valid JSON this raises an error, so callers never overwrite a damaged file.
    """
    if not os.path.exists(PEAKS_PATH):
        return {}

    with open(PEAKS_PATH, "r", encoding="utf-8") as f:
        return {p["id"]: p for p in json.load(f)}


def save_peaks(peaks):
    """Write the peaks (any iterable of dicts) to peaks.json."""
    # Highest peaks first: later we can show only the first N at low zoom
    peaks = sorted(peaks, key=lambda p: p["elevation"], reverse=True)

    # Compact separators remove spaces, ensure_ascii=False keeps accented letters readable
    # One peak per line: still compact, but easy to read and diff
    with open(PEAKS_PATH, "w", encoding="utf-8") as f:
        f.write("[\n")
        lines = [json.dumps(p, ensure_ascii=False, separators=(",", ":")) for p in peaks]
        f.write(",\n".join(lines))
        f.write("\n]")