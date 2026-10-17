import json
import os
from typing import NamedTuple

from common.catalog import load_manifest

# countries.json lives in scripts/data/. We build the path from this file's
# location, so the scripts work no matter which folder you launch them from.
DATA_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "countries.json",
)


class Region(NamedTuple):
    """A region chosen from the menu."""
    country: str        # e.g. "Italia"
    country_code: str   # e.g. "IT"
    name: str           # e.g. "Lombardia"
    code: str           # ISO 3166 code, e.g. "IT-25": identity of the region and name of its file


def load_countries():
    """Load the countries and regions from the shared JSON file."""
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def choose_from_list(title, options, labels=None):
    """Print a numbered menu and keep asking until the user picks a valid number.

    options: the values that can be returned.
    labels: optional text shown for each option (defaults to the option itself).
    """
    if labels is None:
        labels = options

    print(title)
    for i, label in enumerate(labels):
        print(f"{i + 1:>2}. {label}")

    while True:
        answer = input("Scelta: ")
        if answer.isdigit() and 1 <= int(answer) <= len(options):
            return options[int(answer) - 1]
        print(f"Inserisci un numero da 1 a {len(options)}.")


def count_peaks_by_region():
    """Return {region code: number of peaks in the catalog}, or None if the manifest is unreadable."""
    try:
        manifest = load_manifest()
    except ValueError:
        print("Attenzione: manifest.json non è un JSON valido, non posso contare le cime.")
        return None

    return {entry["code"]: entry["count"] for entry in manifest["regions"]}


def format_count(counts, code):
    """Show the number of peaks of a region: '-' if none, '?' if unknown."""
    if counts is None:
        return "?"
    return str(counts.get(code, 0)) if counts.get(code, 0) > 0 else "-"


def choose_region():
    """Ask for a country and a region.

    Each region is shown with the number of peaks it already has in the catalog.
    Returns a Region.
    """
    countries = load_countries()

    country_name = choose_from_list("Seleziona lo stato:", list(countries.keys()))
    country = countries[country_name]

    regions = country["regions"]  # {region name: ISO code}
    names = list(regions.keys())
    counts = count_peaks_by_region()

    # One line per region: name, code and peaks already in the catalog
    width = max(len(name) for name in names)
    labels = [
        f"{name.ljust(width)}   {regions[name]:<7} {format_count(counts, regions[name]):>6}"
        for name in names
    ]

    title = (
        f"\nSeleziona la regione in {country_name}:\n"
        "(ultima colonna = cime già nel catalogo, - = non ancora importata)"
    )
    name = choose_from_list(title, names, labels)

    return Region(country_name, country["iso"], name, regions[name])