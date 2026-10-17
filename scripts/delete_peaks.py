import sys

from common.catalog import find_entry, load_manifest, remove_region, region_path
from common.regions import choose_region

# Country and region selection (menus and data come from data/countries.json)
region = choose_region()

# If manifest.json is damaged we stop here, so nothing is deleted
try:
    manifest = load_manifest()
except ValueError:
    print("\nmanifest.json non è un JSON valido: sistemalo o eliminalo prima di continuare.")
    sys.exit()

entry = find_entry(manifest, region.code)

if entry is None:
    print(f"\n{region.name} non è nel catalogo. Non c'è nulla da eliminare.")
    sys.exit()

print(f"\nCime di {region.name} nel catalogo: {entry['count']}")
print(f"Verrà eliminato il file {region_path(region.code)} e la regione sparirà dal manifest.")
print("Le salite del diario che usano queste cime resteranno senza coordinate.")

# The user must type a word, so it cannot happen by accident
answer = input("Per confermare scrivi ELIMINA: ")
if answer.strip() != "ELIMINA":
    print("Annullato. Non è stato eliminato nulla.")
    sys.exit()

remove_region(region.code)
print(f"Eliminate {entry['count']} cime di {region.name} dal catalogo.")