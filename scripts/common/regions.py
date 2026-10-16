import json
import os

from common.status import get_region_status

# countries.json lives in scripts/data/. We build the path from this file's
# location, so the scripts work no matter which folder you launch them from.
DATA_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "countries.json",
)


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


def format_count(count):
    """Show a count as a number, '-' for zero and '?' if unknown."""
    if count is None:
        return "?"
    return str(count) if count > 0 else "-"


def build_region_labels(db, country_name, region_names):
    """Build the menu lines for the regions, with their Firestore and JSON counts."""
    print("\nControllo le cime già presenti...")
    status, without_region = get_region_status(db, country_name, region_names)

    name_width = max(len(name) for name in region_names)
    labels = []
    for name in region_names:
        firestore_count, json_count = status[name]
        labels.append(
            f"{name.ljust(name_width)}   "
            f"Firestore: {format_count(firestore_count):>6}   "
            f"JSON: {format_count(json_count):>6}"
        )

    # Legend and a note about old entries that cannot be assigned to a region
    legend = "(Firestore = cime nel database, JSON = cime in peaks.json, - = nessuna)"
    if without_region:
        legend += (
            f"\nNota: cime in peaks.json senza regione (non contate): {without_region}. "
            "Riesporta le regioni per aggiornarle."
        )
    return labels, legend


def choose_region(db=None):
    """Ask for a country and a region.

    If db (the Firestore client) is given, each region is shown with the number
    of peaks it has on Firestore and in peaks.json.

    Returns (country_name, region_name, iso_code), where iso_code is the
    ISO 3166 code of the chosen region (used to query OpenStreetMap).
    """
    countries = load_countries()

    country_name = choose_from_list("Seleziona lo stato:", list(countries.keys()))

    regions = countries[country_name]["regions"]
    region_names = list(regions.keys())

    labels = None
    title = f"\nSeleziona la regione in {country_name}:"
    if db is not None:
        labels, legend = build_region_labels(db, country_name, region_names)
        title += f"\n{legend}"

    region_name = choose_from_list(title, region_names, labels)

    return country_name, region_name, regions[region_name]